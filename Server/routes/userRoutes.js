import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getAuthorDetails,
  addAuthorDetails,
  getUserDetail,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { profileUpload } from "../utils/MulterUpload.js";

const router = express.Router();

router.get("/profile", verifyToken, getUserDetail);
router.get("/profile/:userId", getAuthorDetails);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.put(
  "/profile/details",
  verifyToken,
  profileUpload.single("file"),
  addAuthorDetails
);

export default router;
