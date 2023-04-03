const express = require("express");
var cors = require("cors");
const app = express();
let dbHelpers = require("./blogHelpers/dbHelpers");
let jwt = require("jsonwebtoken");

var db = require("./db/connection");
const secret = "adeqw!@3qte9852&A%D^@hbgfa";

app.use(cors());

app.use(express.json());

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
        res.cookie("token", token).json("ok");
      });
    })
    .catch(err => {
      const { message } = err;
      res.json(message);
    });
});

db.connect(err => {
  if (err) console.log("Error connecting to MongoDB:", err);
  else console.log("Connected to MongoDB successfully");
});

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
