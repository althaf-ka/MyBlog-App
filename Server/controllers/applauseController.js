import applauseService from "../services/applauseService.js";

export const addApplauseDetails = (req, res, next) => {
  applauseService
    .addApplauseDetails(req.body, req.params.postId)
    .then(response => {
      res.status(response.status).json({ message: response.message });
    })
    .catch(err => {
      next(err);
    });
};

export const deleteApplause = (req, res, next) => {
  applauseService
    .deleteApplause(req.params)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const retrieveApplauseAndUserCounts = (req, res, next) => {
  applauseService
    .retrieveApplauseAndUserCounts(req.query)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
};
