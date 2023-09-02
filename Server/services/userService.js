import bcrypt from "bcrypt";
import collection from "../db/collection.js";
import { db } from "../db/connection.js";
import createError from "../utils/createError.js";
import { ObjectId } from "mongodb";

const registerUser = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      password = await bcrypt.hash(password, 5);
      await db
        .collection(collection.USERS_COLLECTION)
        .createIndex({ username: 1 }, { unique: true });
      const newUsr = await db
        .collection(collection.USERS_COLLECTION)
        .insertOne({
          username,
          password,
        });

      resolve({
        message: "Successfully Registered",
        newUserId: newUsr.insertedId,
      });
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate username error
        reject(createError(409, "This User Already Exists"));
      } else {
        reject(createError(404, "Registration Failed !"));
      }
    }
  });
};

const loginUser = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db
        .collection(collection.USERS_COLLECTION)
        .findOne({ username: username });

      if (user) {
        bcrypt.compare(password, user.password).then(status => {
          if (status) {
            resolve(user); //Login Sucessfully
          } else {
            reject(createError(401, "The Password you entered is incorrect"));
          }
        });
      } else {
        reject(createError(404, "User Not found"));
      }
    } catch (error) {
      reject(createError(500, "Error Occured During Login"));
    }
  });
};

const getUserDetail = userId => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db
        .collection(collection.USERS_COLLECTION)
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { password: 0, bio: 0, socialLinks: 0 } }
        );

      resolve(user);
    } catch (err) {
      reject(createError(404, "User not found"));
    }
  });
};

const getAuthorDetails = userId => {
  return new Promise(async (resolve, reject) => {
    try {
      const author = await db
        .collection(collection.USERS_COLLECTION)
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { password: false } }
        );
      if (author === null) {
        throw { message: "Failed to retrieve user" };
      }

      const totalBlogs = await db
        .collection(collection.POSTS_COLLECTION)
        .countDocuments({ userId: new ObjectId(userId) });

      resolve({ ...author, totalBlogs });
    } catch (err) {
      reject(createError(404, "Failed to retrieve user"));
    }
  });
};

const addAuthorDetails = (profileDetails, profileImageURL) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, username, bio, socialLinks, id } = profileDetails;

      // Check if the username already exists for a different user($ne:)=>To exculde currrent Username
      const existingUsername = await db
        .collection(collection.USERS_COLLECTION)
        .findOne({ username, _id: { $ne: new ObjectId(id) } });

      if (existingUsername) {
        throw {
          status: 409,
          message:
            "Username already exists. Please choose a different username.",
        };
      }

      const updatefield = {
        name: name,
        username: username,
        bio: bio,
        socialLinks: JSON.parse(socialLinks),
      };
      if (profileImageURL) {
        updatefield.profileImageURL = profileImageURL;
      }

      const updateProfileResult = await db
        .collection(collection.USERS_COLLECTION)
        .updateOne({ _id: new ObjectId(id) }, { $set: updatefield });

      if (updateProfileResult.modifiedCount === 0) {
        resolve({ status: 201, message: "No changes made to the profile." });
      }
      resolve({ status: 200, message: "Profile updated Sucessfully." });
    } catch (err) {
      reject(
        createError(err.status || 500, err.message || "Profile Updation Failed")
      );
    }
  });
};

export default {
  registerUser,
  loginUser,
  getUserDetail,
  getAuthorDetails,
  addAuthorDetails,
};
