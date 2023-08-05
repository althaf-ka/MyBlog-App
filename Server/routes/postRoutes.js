import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  addPost,
  deletePostById,
  editPost,
  getAllPost,
  getPostById,
  postsByAuthor,
} from "../controllers/postController.js";
import { postUpload } from "../utils/MulterUpload.js";

const router = express.Router();

router.get("/", getAllPost);
router.get("/:id", getPostById);
router.get("/author-posts/:userId", postsByAuthor);

router.post("/add", verifyToken, postUpload.single("file"), addPost);

router.put("/edit", verifyToken, postUpload.single("file"), editPost);

router.delete("/delete/:id", verifyToken, deletePostById);

export default router;
