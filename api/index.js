import express, { response } from "express";
import cors from "cors";
const app = express();
import dbHelpers from "./blogHelpers/dbHelpers.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";

dotenv.config();
import { connect as MongoConnect } from "./db/connection.js";
import { postUpload } from "./blogHelpers/MulterUpload.js";

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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
        console.log(response);
        res.json(response);
      });
    }
  });
});

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
