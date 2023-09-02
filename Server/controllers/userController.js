import userService from "../services/userService.js";
import jwt from "jsonwebtoken";

export const registerUser = (req, res, next) => {
  const { username, password } = req.body;

  userService
    .registerUser(username, password)
    .then(response => {
      res.status(response.status || 200).json(response);
    })
    .catch(error => {
      console.log(error, "Error in controller");
      next(error);
    });
};

export const loginUser = (req, res, next) => {
  const { username, password } = req.body;

  userService
    .loginUser(username, password)
    .then(response => {
      //When successful login JWT token setup
      const { _id, username, name } = response;
      jwt.sign(
        { _id, username, name },
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
            .json({ _id, username, name });
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
  try {
    const currentAuthor = await userService.getAuthorDetails(profileDetails.id);
    const isAuthor = currentAuthor._id.toString() === user._id.toString();

    if (isAuthor) {
      const response = await userService.addAuthorDetails(
        profileDetails,
        profileImageURL
      );

      if (response.status === 200 && profileImageURL) {
        const uploadDir = path.resolve(
          __dirname,
          "..",
          "uploads",
          "postImages"
        );
        const filePath = path.join(uploadDir, currentAuthor.profileImageURL);
        fs.unlink(filePath, err => {
          if (err) console.log("Error in removal of uploads");
        });
      }

      res.status(response.status).json(response.message);
    } else {
      throw { message: "Unauthorised Access" };
    }
  } catch (err) {
    next(err);
  }
};
