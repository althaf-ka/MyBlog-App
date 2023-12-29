import postService from "../services/postService.js";
import createError from "../utils/createError.js";
import { imagekitDeleteFile } from "../services/imageKitService.js";

export const addPost = (req, res, next) => {
  const blogDetails = req.body;
  const user = req.user;

  //Saving blog Post to database
  postService
    .addPost(blogDetails, user)
    .then((response) => {
      res
        .status(response.status || 200)
        .json(response.message || "Sucessfully Posted ");
    })
    .catch((err) => {
      next(err);
    });
};

export const editPost = async (req, res, next) => {
  try {
    const { id } = req.body;
    const blogDetails = req.body;
    const user = req.user;

    // Taking the blog id from the client and retrieve it from the database
    const currentBlog = await postService.getPostById(id);

    // Checking whether the authorId from the current Blog is the same as in the cookie
    const isAuthor = currentBlog?.userId.toString() === user._id;
    if (!isAuthor) {
      return next(
        createError(
          401,
          "You are not authorized to edit this post as it can only be edited by the creator."
        )
      );
    }

    // Checking if a new Image file is present, remove the old image from ImageKit
    if (blogDetails.coverImgURL) {
      await imagekitDeleteFile(currentBlog.imageKitFileId);
    }

    // Updating the database
    const response = await postService.updatePost(id, blogDetails);
    res.status(200).json({ message: response });
  } catch (err) {
    next(err);
  }
};

export const getAllPost = async (req, res, next) => {
  try {
    const skipValue = req.query.skip;
    const userDetails = req.user || false;

    let blogPosts;

    if (userDetails) {
      const { _id: userId } = userDetails;
      blogPosts = await postService.getAllPostWithBookmarks(userId, skipValue);
    } else {
      blogPosts = await postService.getAllPost(skipValue);
    }

    res.json(blogPosts);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getPostById = (req, res, next) => {
  const postId = req.params.id;

  postService
    .getPostById(postId)
    .then((blogPost) => {
      res.status(200).json(blogPost);
    })
    .catch((err) => {
      next(err);
    });
};

export const deletePostById = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const user = req.user;
    const currentPostDetails = await postService.getPostById(postId);
    //Checking blog author from db

    if (currentPostDetails.userId.toString() !== user._id.toString()) {
      throw createError(401, "Only Blog Author Can Delete the Blog");
    }

    const deleteResponse = await postService.deletePostById(postId);

    //Remove the deleted Blog CoverImg from ImageKit
    if (deleteResponse.status === 200) {
      await imagekitDeleteFile(currentPostDetails.imageKitFileId);
    }

    res.status(deleteResponse.status).json(deleteResponse.message);
  } catch (err) {
    next(err);
  }
};

export const postsByAuthor = (req, res, next) => {
  postService
    .postsByAuthor(req.params.userId, req.query.skip)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      next(err);
    });
};
