import express from "express";
import {
  allTopicSuggestions,
  topicWiseAllBlogs,
  totalBlogsInTopic,
} from "../controllers/topicController.js";

const router = express.Router();

router.get("/topic-suggestions", allTopicSuggestions);
router.get("/details/:topicId", totalBlogsInTopic);
router.get("/posts/:topicId", topicWiseAllBlogs);

export default router;
