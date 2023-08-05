import postService from "../services/postService.js";
import createError from "../utils/createError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const addPost = (req, res, next) => {
  const blog = req.body;
  const coverImageURL = req.file ? req.file.filename : null;
  const user = req.user;

  //Saving blog Post to database
  postService
    .addPost(blog, coverImageURL, user)
    .then(response => {
      res
        .status(response.status || 200)
        .json(response.message || "Sucessfully Posted ");
    })
    .catch(err => {
      next(err);
    });
};

export const editPost = (req, res, next) => {
  const { id } = req.body;
  const blogDetails = req.body;
  const coverImageURL = req.file ? req.file.filename : null;
  const user = req.user;
  //Taking the blog id from client and retrive from database
  postService
    .getPostById(id)
    .then(currentBlog => {
      //Checking wheather the authorId from current Blog is same as in cookie
      const isAuthor = currentBlog?.userId.toString() === user._id;
      if (!isAuthor) {
        return next(
          createError(
            401,
            "You are not authorized to edit this post as it can only be edited by the creator hehe."
          )
        );
      }
      //Checking if new Image file present remove old image from uploads
      if (coverImageURL) {
        try {
          if (currentBlog.coverImageURL) {
            const uploadDir = path.resolve(
              __dirname,
              "..",
              "uploads",
              "postImages"
            );
            const filePath = path.join(uploadDir, currentBlog.coverImageURL);
            fs.unlink(filePath, err => {
              if (err) console.log(err);
            });
          }
        } catch (err) {
          res.status(500).json("Image Updation Failed try Again");
        }
      }
      //Updating the database
      postService
        .updatePost(id, blogDetails, coverImageURL)
        .then(response => {
          res.status(200).json({ message: response });
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => {
      next(err);
    });
};

export const getAllPost = (req, res, next) => {
  //query for infinte scrolling
  postService
    .getAllPost(req.query.skip)
    .then(blogPosts => {
      res.json(blogPosts);
    })
    .catch(err => {
      next(err);
    });
};

export const getPostById = (req, res, next) => {
  const postId = req.params.id;

  postService
    .getPostById(postId)
    .then(blogPost => {
      res.status(200).json(blogPost);
    })
    .catch(err => {
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
    //Remove the deleted Blog CoverImg
    if (deleteResponse.status === 200) {
      const uploadDir = path.resolve(__dirname, "..", "uploads", "postImages");
      const filePath = path.join(uploadDir, currentPostDetails.coverImageURL);
      await fs.promises.unlink(filePath);
    }
    res.status(deleteResponse.status).json(deleteResponse.message);
  } catch (err) {
    next(err);
  }
};

export const postsByAuthor = (req, res, next) => {
  postService
    .postsByAuthor(req.params.userId, req.query.skip)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};
