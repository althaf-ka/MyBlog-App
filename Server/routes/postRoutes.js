import express from "express";
import { verifyToken, isLoggedIn } from "../middleware/authMiddleware.js";
import {
  addPost,
  deletePostById,
  editPost,
  getAllPost,
  getPostById,
  postsByAuthor,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", isLoggedIn, getAllPost);

router.get("/:id", getPostById);
router.get("/author-posts/:userId", postsByAuthor);

router.post("/add", verifyToken, addPost);

router.put("/edit", verifyToken, editPost);

router.delete("/delete/:id", verifyToken, deletePostById);

export default router;
