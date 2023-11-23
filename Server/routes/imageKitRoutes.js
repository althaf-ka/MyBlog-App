import express from "express";
import {
  imageKitRemoveFile,
  imagekitAuthenticator,
} from "../controllers/imageKitController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/auth", verifyToken, imagekitAuthenticator);
router.post("/delete", verifyToken, imageKitRemoveFile);

export default router;
