import { ObjectId } from "mongodb";
import topicService from "../services/topicService.js";
import createError from "../utils/createError.js";

export const allTopicSuggestions = (req, res, next) => {
  topicService
    .allTopicSuggestions()
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const totalBlogsInTopic = (req, res) => {
  const topicId = req.params.topicId;

  if (!ObjectId.isValid(topicId)) {
    return next(createError(400, "Invalid topicId"));
  }

  topicService.totalBlogsInTopic(topicId).then(response => {
    res.status(200).json(response);
  });
};

export const topicWiseAllBlogs = (req, res, next) => {
  const topicId = req.params.topicId;

  if (!ObjectId.isValid(topicId)) {
    return next(createError(400, "Invalid topicId"));
  }

  topicService
    .topicWiseAllBlogs(req.params.topicId, req.query.skip)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};
