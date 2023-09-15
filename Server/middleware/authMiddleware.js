import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(createError(401, "Unauthorized !"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(createError(403, "Unauthorized !"));

    req.user = user;
    next();
  });
};

export const isLoggedIn = (req, res, next) => {
  const { token } = req?.cookies;

  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next();

    req.user = user;
    next();
  });
};
