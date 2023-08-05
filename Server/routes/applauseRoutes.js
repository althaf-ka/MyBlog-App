import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  addApplauseDetails,
  deleteApplause,
  retrieveApplauseAndUserCounts,
} from "../controllers/applauseController.js";

const router = express.Router();

router.get("/total-applause-detail/", retrieveApplauseAndUserCounts);

router.post("/add/:postId", verifyToken, addApplauseDetails);

router.delete("/delete/:postId/:currentUserId", verifyToken, deleteApplause);

export default router;
