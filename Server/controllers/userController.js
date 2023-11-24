import userService from "../services/userService.js";
import jwt from "jsonwebtoken";
import verifyToken from "../utils/googleAuth.js";
import createError from "../utils/createError.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const registerUser = (req, res, next) => {
  const { name, email, password } = req.body.formData;

  userService
    .registerUser(name, email, password)
    .then(response => {
      res.status(response.status || 200).json(response);
    })
    .catch(error => {
      next(error);
    });
};

export const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  userService
    .loginUser(email, password)
    .then(response => {
      //When successful login JWT token setup
      const { _id, email, name } = response;
      jwt.sign(
        { _id, email, name },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) return next(err);
          res
            .cookie("token", token, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
              maxAge: 24 * 60 * 60 * 1000, // 1 days in milliseconds
            })
            .json({ _id, email, name });
        }
      );
    })
    .catch(err => {
      next(err);
    });
};

export const logoutUser = (req, res) => {
  res.clearCookie("token").status(200).json({
    status: 200,
    message: "Logged Out Sucessfully",
  });
};

export const getUserDetail = (req, res) => {
  userService
    .getUserDetail(req.user._id)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
    });
};

export const getAuthorDetails = (req, res, next) => {
  userService
    .getAuthorDetails(req.params.userId)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      next(err);
    });
};

export const addAuthorDetails = async (req, res, next) => {
  const profileDetails = req.body;
  const profileImageURL = req.file?.filename || null;
  const user = req.user;

  console.log(profileDetails);
  try {
    const currentAuthor = await userService.getAuthorDetails(profileDetails.id);
    const isAuthor = currentAuthor._id.toString() === user._id.toString();

    if (isAuthor) {
      const response = await userService.addAuthorDetails(
        profileDetails,
        profileImageURL
      );

      if (response.status === 200 && profileImageURL) {
        if (currentAuthor.profileImageURL) {
          const uploadDir = path.resolve(
            __dirname,
            "..",
            "uploads",
            "profilePicture"
          );
          const oldImagePath = path.join(
            uploadDir,
            currentAuthor.profileImageURL
          );

          // Delete the old image
          fs.unlink(oldImagePath, err => {
            if (err) console.log("Error in removal of old image");
          });
        }
      }

      res.status(response.status).json(response.message);
    } else {
      throw { message: "Unauthorised Access" };
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const registerGoogleUser = async (req, res, next) => {
  try {
    const { credential } = req.body;

    const payload = await verifyToken(credential);

    userService
      .registerGoogleUser(payload)
      .then(response => {
        res.status(response.status || 200).json(response);
      })
      .catch(err => {
        next(err);
      });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const loginGoogleUser = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const payload = await verifyToken(credential);

    if (!payload) {
      return next(createError(404, "Google Authentication Failed"));
    }

    const user = await userService.loginGoogleUser(payload);
    if (user) {
      const { _id, email, name } = user;
      jwt.sign(
        { _id, email, name },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) return next(err);

          res
            .cookie("token", token, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
              maxAge: 24 * 60 * 60 * 1000, // 1 days in milliseconds
            })
            .json({ _id, email, name });
        }
      );
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};
