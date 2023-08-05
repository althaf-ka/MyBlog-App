import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connect as MongoConnect } from "./db/connection.js";

dotenv.config();
const app = express();

import userRoute from "./routes/userRoutes.js";
import postRoute from "./routes/postRoutes.js";
import topicRoute from "./routes/topicRoutes.js";
import applauseRoute from "./routes/applauseRoutes.js";
import bookmarkRoute from "./routes/bookmarkRoutes.js";

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 4000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/topics", topicRoute);
app.use("/applauses", applauseRoute);
app.use("/bookmarks", bookmarkRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  console.log(errorStatus, errorMessage);
  return res.status(errorStatus).send(errorMessage);
});

app.listen(port, () => {
  console.log(`Server Started Port : ${port}`);

  MongoConnect(error => {
    if (error) return console.log("Database Connected Failed : ", error);
    console.log("MongoDB connected");
  });
});
