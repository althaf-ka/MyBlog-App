import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  addBookmarkList,
  bookmarksOfPostsByUsers,
  getBookmarkListNamesWithCover,
  isPostBookmarkedByUser,
  removeBookmark,
  removeBookmarkList,
  userBookmarkedPostList,
} from "../controllers/bookmarkController.js";

const router = express.Router();

router.get(
  "/details/:currentUserId/:postId",
  verifyToken,
  bookmarksOfPostsByUsers
);
router.get("/users/:postId/:userId", verifyToken, isPostBookmarkedByUser);
router.get("/lists/names/:userId", verifyToken, getBookmarkListNamesWithCover);
router.get("/list/posts/:name/:userId", verifyToken, userBookmarkedPostList);

router.post("/save/:currentUserId", verifyToken, addBookmarkList);

router.put("/delete/:currentUserId", verifyToken, removeBookmark);
router.put("/list/delete/:userId", verifyToken, removeBookmarkList);

export default router;
