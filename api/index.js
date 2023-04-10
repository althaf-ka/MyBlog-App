import express, { json, response } from "express";
import cors from "cors";
const app = express();
import dbHelpers from "./blogHelpers/dbHelpers.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
import { connect as MongoConnect } from "./db/connection.js";
import { postUpload } from "./blogHelpers/MulterUpload.js";
import { ObjectId } from "mongodb";

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

MongoConnect(error => {
  if (error) return console.log("Database Connected Failed : ", error);
  console.log("MongoDB connected");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  dbHelpers
    .registerUser(username, password)
    .then(response => {
      res.json({ response });
    })
    .catch(error => {
      res.json({ error });
    });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  dbHelpers
    .loginUser(username, password)
    .then(response => {
      //When successful login JWT token setup
      const { _id, username } = response;
      jwt.sign({ _id, username }, process.env.JWT_SECRET, {}, (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 days in milliseconds
          })
          .json({ _id, username });
      });
    })
    .catch(err => {
      const { message } = err;
      res.json(message);
    });
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  console.log(10 + "10");

  jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
    //Checking user token for login Verification
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
      throw err;
    }
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("Logged out successfully");
});

app.post("/post", postUpload.single("file"), (req, res) => {
  const blog = req.body;
  const coverImageURL = req.file ? req.file.filename : null;
  const { token } = req.cookies;

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
      throw err;
    } else {
      //Saving blog Post to database
      dbHelpers.addPost(blog, coverImageURL, user).then(response => {
        res.json(response);
      });
    }
  });
});

app.put("/post", postUpload.single("file"), (req, res) => {
  // Extract data from request body and cookie
  const { id, title, summary, content } = req.body;
  const coverImageURL = req.file ? req.file.filename : null;
  const { token } = req.cookies;

  //Verifying User
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
      throw err;
    } else {
      //Taking the blog id from client and retrive from database
      const currentBlog = await dbHelpers.getPostById(id);
      //Checking wheather the authorId from current Blog is same as in cookie
      const isAuthor = currentBlog.userId === user._id;
      if (!isAuthor) {
        return res
          .status(400)
          .json(
            "You are not authorized to edit this post as it can only be edited by the creator."
          );
      } else {
        //Checking if new Image file present remove old image from uploads
        if (coverImageURL) {
          try {
            if (currentBlog.coverImageURL) {
              const uploadDir = path.join(__dirname, "uploads", "postImages");
              const filePath = path.join(uploadDir, currentBlog.coverImageURL);
              fs.unlink(filePath, err => {
                if (err) console.log(err);
              });
            }
          } catch (err) {
            res.json("Image Updation Failed try Again");
          }
        }
        //Updating the database
        dbHelpers
          .updatePost(id, title, summary, content, coverImageURL)
          .then(response => {
            res.json(response);
          })
          .catch(err => {
            res.json(err);
          });
      }
    }
  });
});

app.get("/post", (req, res) => {
  dbHelpers.getAllPost().then(blogPosts => {
    res.json(blogPosts);
  });
});

app.get("/post/:id", (req, res) => {
  const postId = req.params.id;
  dbHelpers
    .getPostById(postId)
    .then(blogPost => {
      res.json(blogPost);
    })
    .catch(err => {
      res.json({ message: "Error Fetching Blogs " });
    });
});

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
