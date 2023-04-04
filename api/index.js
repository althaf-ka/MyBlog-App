const express = require("express");
var cors = require("cors");
const app = express();
let dbHelpers = require("./blogHelpers/dbHelpers");
let jwt = require("jsonwebtoken");
let cookieParser = require("cookie-parser");

var db = require("./db/connection");
const secret = "adeqw!@3qte9852&A%D^@hbgfa";

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

db.connect(err => {
  if (err) console.log("Error connecting to MongoDB:", err);
  else console.log("Connected to MongoDB successfully");
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
      jwt.sign({ _id, username }, secret, {}, (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 days in milliseconds
          })
          .json("ok");
      });
    })
    .catch(err => {
      const { message } = err;
      res.json(message);
    });
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secret, (err, info) => {
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

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
