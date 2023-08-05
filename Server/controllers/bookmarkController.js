import bookmarkService from "../services/bookmarkService.js";

export const bookmarksOfPostsByUsers = (req, res, next) => {
  bookmarkService
    .bookmarksOfPostsByUsers(req.params)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const addBookmarkList = (req, res, next) => {
  const bookmarkDetails = {
    currentUserId: req.params.currentUserId,
    bookmarkListName: req.body.name,
    postId: req.body.postId,
  };

  bookmarkService
    .addBookmarkList(bookmarkDetails)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const removeBookmark = (req, res, next) => {
  const bookmarkDetails = {
    currentUserId: req.params.currentUserId,
    bookmarkListName: req.body.name,
    postId: req.body.postId,
  };

  bookmarkService
    .removeBookmark(bookmarkDetails)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const isPostBookmarkedByUser = (req, res, next) => {
  bookmarkService
    .isPostBookmarkedByUser(req.params)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const getBookmarkListNamesWithCover = (req, res, next) => {
  bookmarkService
    .getBookmarkListNamesWithCover(req.params.userId)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const userBookmarkedPostList = (req, res, next) => {
  bookmarkService
    .userBookmarkedPostList(req.params)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const removeBookmarkList = (req, res, next) => {
  bookmarkService
    .removeBookmarkList(req.params.userId, req.body.name)
    .then(response => {
      res.status(200).json(response.message);
    })
    .catch(err => {
      next(err);
    });
};
