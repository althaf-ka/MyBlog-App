import topicService from "../services/topicService.js";

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
  topicService.totalBlogsInTopic(req.params.topicId).then(response => {
    res.status(200).json(response);
  });
};

export const topicWiseAllBlogs = (req, res, next) => {
  topicService
    .topicWiseAllBlogs(req.params.topicId, req.query.skip)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};
