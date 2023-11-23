import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getAuthorDetails,
  addAuthorDetails,
  getUserDetail,
  registerGoogleUser,
  loginGoogleUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyToken, getUserDetail);
router.get("/profile/:userId", getAuthorDetails);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google/auth", registerGoogleUser);
router.post("/google/login", loginGoogleUser);

router.put("/profile/details", verifyToken, addAuthorDetails);

export default router;
