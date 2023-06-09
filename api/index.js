import express, { response } from "express";
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
import { connect as MongoConnect, db } from "./db/connection.js";
import { postUpload, profileUpload } from "./blogHelpers/MulterUpload.js";

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

function authMiddleware(req, res, next) {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    req.user = user;
    next();
  });
}

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
      const { _id, username, name } = response;
      jwt.sign(
        { _id, username, name },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
              maxAge: 24 * 60 * 60 * 1000, // 1 days in milliseconds
            })
            .json({ _id, username, name });
        }
      );
    })
    .catch(err => {
      const { message } = err;
      res.json(message);
    });
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const response = await dbHelpers.getAuthorDetails(req.user._id);
    const { _id, username, name } = response;
    res.json({ _id, username, name });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").status(200).json({
    status: 200,
    message: "Logged Out Sucessfully",
  });
});

app.post("/post", authMiddleware, postUpload.single("file"), (req, res) => {
  const blog = req.body;
  const coverImageURL = req.file ? req.file.filename : null;
  const user = req.user;

  //Saving blog Post to database
  dbHelpers
    .addPost(blog, coverImageURL, user)
    .then(response => {
      res.json(response);
      console.log(response, "response");
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

app.put("/post", authMiddleware, postUpload.single("file"), (req, res) => {
  const { id } = req.body;
  const blogDetails = req.body;
  const coverImageURL = req.file ? req.file.filename : null;
  const user = req.user;
  //Taking the blog id from client and retrive from database
  dbHelpers
    .getPostById(id)
    .then(currentBlog => {
      //Checking wheather the authorId from current Blog is same as in cookie
      const isAuthor = currentBlog?.userId.toString() === user._id;
      if (!isAuthor) {
        return res
          .status(400)
          .json(
            "You are not authorized to edit this post as it can only be edited by the creator."
          );
      }
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
          res.status(500).json("Image Updation Failed try Again");
        }
      }
      //Updating the database
      dbHelpers
        .updatePost(id, blogDetails, coverImageURL)
        .then(response => {
          res.status(200).json({ message: response });
        })
        .catch(err => {
          res.status(500).json({ message: err });
        });
    })
    .catch(err => {
      res.status(500).json({ message: "Internal Server Error" });
    });
});

app.get("/post", (req, res) => {
  //query for infinte scrolling
  dbHelpers.getAllPost(req.query.skip).then(blogPosts => {
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

app.delete("/post/delete/:id", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.user;
    const currentPostDetails = await dbHelpers.getPostById(postId);
    //Checking blog author from db
    if (currentPostDetails.userId !== user._id) {
      throw { status: 401, message: "Only Blog Author Can Delete the Blog" };
    }

    const deleteResponse = await dbHelpers.deletePostById(postId);
    //Remove the deleted Blog CoverImg
    if (deleteResponse.status === 200) {
      const uploadDir = path.join(__dirname, "uploads", "postImages");
      const filePath = path.join(uploadDir, currentPostDetails.coverImageURL);
      fs.unlink(filePath, err => {
        if (err) console.log(err, "Error in Removal of CoverIMG from Database");
      });
    }
    res
      .status(deleteResponse.status || 200)
      .json(deleteResponse.message || "Sucessfully Deleted");
  } catch (err) {
    res.status(err.status || 400).json(err.message || "Error Occured");
  }
});

app.get("/author-posts/:userId", (req, res) => {
  dbHelpers
    .postsByAuthor(req.params.userId, req.query.skip)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.status(400).json({ message: "Error Fetching Blogs " });
    });
});

app.get("/topic-suggestions", (req, res) => {
  dbHelpers.AlltopicSuggestion().then(response => {
    res.json(response);
  });
});

app.get("/topic/details/:topicId", (req, res) => {
  dbHelpers.TotalBlogsInTopic(req.params.topicId).then(response => {
    res.json(response);
  });
});

app.get("/topic/:topicId", (req, res) => {
  dbHelpers
    .TopicWiseAllBlogs(req.params.topicId, req.query.skip)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(err.status || 500).json(err.message);
    });
});

app.get("/profile/:userId", (req, res) => {
  dbHelpers
    .getAuthorDetails(req.params.userId)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(err.status || 500).json(err.message);
    });
});

app.put(
  "/profile",
  authMiddleware,
  profileUpload.single("file"),
  async (req, res) => {
    const profileDetails = req.body;
    const profileImageURL = req.file?.filename || null;
    const user = req.user;
    try {
      const currentAuthor = await dbHelpers.getAuthorDetails(profileDetails.id);
      const isAuthor = currentAuthor._id.toString() === user._id;
      if (isAuthor) {
        const response = await dbHelpers.addAuthorDetails(
          profileDetails,
          profileImageURL
        );

        if (response.status === 200 && profileImageURL) {
          const uploadDir = path.join(__dirname, "uploads", "profilePicture");
          const filePath = path.join(uploadDir, currentAuthor.profileImageURL);
          fs.unlink(filePath, err => {
            if (err) res.json({ message: "Error In Profile Database" });
          });
        }

        res.status(response.status).json(response.message);
      } else {
        throw { message: "Unauthorised Access" };
      }
    } catch (err) {
      res.status(err.status || 500).json(err.message);
    }
  }
);

app.post("/post/applause/:postId", authMiddleware, (req, res) => {
  dbHelpers
    .addApplauseDetails(req.body, req.params.postId)
    .then(response => {
      res.status(response.status).json({ message: response.message });
    })
    .catch(err => {
      res
        .status(err.status || 500)
        .json({ message: err.message || "An error occurred" });
    });
});

app.delete(
  "/applause/delete/:postId/:currentUserId",
  authMiddleware,
  (req, res) => {
    dbHelpers
      .deleteApplause(req.params)
      .then(response => {
        res.status(response.status || 200).json(response);
      })
      .catch(err => {
        res
          .status(err.status || 500)
          .json({ message: err.message || "Failed Removing Claps" });
      });
  }
);

app.get("/total-applause-detail/", (req, res) => {
  dbHelpers
    .retrieveApplauseAndUserCounts(req.query)
    .then(response => {
      res.status(response.status || 200).json(response);
    })
    .catch(err => {
      console.log(err);
    });
});

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
