import bcrypt from "bcrypt";
import collection from "../db/collection.js";
import { db } from "../db/connection.js";
import createError from "../utils/createError.js";
import { ObjectId } from "mongodb";

const registerUser = (name, email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      password = await bcrypt.hash(password, 5);
      await db.collection(collection.USERS_COLLECTION).createIndex(
        { email: 1 },
        {
          unique: true,
          partialFilterExpression: { email: { $exists: true } },
        }
      );
      await db.collection(collection.USERS_COLLECTION).insertOne({
        name,
        email,
        password,
      });

      resolve({ message: "Successfully Registered" });
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate Email  error
        reject(createError(409, "This User Already Exists"));
      } else {
        reject(createError(404, "Registration Failed !"));
      }
    }
  });
};

const loginUser = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db
        .collection(collection.USERS_COLLECTION)
        .findOne({ email: email });

      if (user && user.googleUserId) {
        reject(
          createError(
            403,
            "Cannot Login with Google email. Use Google sign-in."
          )
        );
        return;
      }

      if (user) {
        bcrypt.compare(password, user.password).then(status => {
          if (status) {
            const { password, ...userWithoutPassword } = user;
            resolve(userWithoutPassword); //Login Sucessfully
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

const addAuthorDetails = profileDetails => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        name,
        bio,
        socialLinks,
        id,
        profileImageURL,
        profileThumbnailUrl,
        imageKitFileId,
      } = profileDetails;

      const updatefield = {
        name: name,
        bio: bio,
        socialLinks: JSON.parse(socialLinks),
      };
      if (profileImageURL) {
        updatefield.profileImageURL = profileImageURL;
        updatefield.profileThumbnailUrl = profileThumbnailUrl;
        updatefield.imageKitFileId = imageKitFileId;
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

const registerGoogleUser = payload => {
  return new Promise(async (resolve, reject) => {
    try {
      const { googleUserId, userEmail, userName, profileLink } = payload;

      if (!googleUserId) {
        reject(createError(400, "Error in by Loging by Google"));
        return;
      }

      await db.collection(collection.USERS_COLLECTION).createIndex(
        { googleUserId: 1 },
        {
          unique: true,
          partialFilterExpression: { googleUserId: { $exists: true } },
        }
      );

      await db.collection(collection.USERS_COLLECTION).insertOne({
        googleUserId: googleUserId,
        name: userName,
        email: userEmail,
        profileImageURL: profileLink || null,
      });

      resolve({ message: "Successfully Registered" });
    } catch (err) {
      console.log(err);
      if (err.code === 11000) {
        // Handle duplicate Email error
        reject(createError(409, "Your account already exists"));
      } else {
        reject(createError(404, "Registration Failed !"));
      }
    }
  });
};

const loginGoogleUser = payload => {
  return new Promise(async (resolve, reject) => {
    try {
      const { googleUserId: payloadGoogleUserId, userEmail } = payload;

      const user = await db
        .collection(collection.USERS_COLLECTION)
        .findOne({ googleUserId: payloadGoogleUserId });

      if (!user) {
        reject(
          createError(
            404,
            "Sorry, we couldn't find the user you are looking for. Please register for an account."
          )
        );
      }

      if (user.email !== userEmail) {
        reject(createError(401, "Google Login Failed"));
      }

      const { googleUserId, ...userwithoutId } = user;
      resolve(userwithoutId);
    } catch (err) {
      console.log(err);
      reject(createError(500, "Error Occured During Login"));
    }
  });
};

export default {
  registerUser,
  loginUser,
  getUserDetail,
  getAuthorDetails,
  addAuthorDetails,
  registerGoogleUser,
  loginGoogleUser,
};
