import { db } from "../db/connection.js";
import collection from "../db/collection.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

export default {
  registerUser: (username, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        password = await bcrypt.hash(password, 5);
        await db
          .collection(collection.USERS_COLLECTION)
          .createIndex({ username: 1 }, { unique: true });
        await db
          .collection(collection.USERS_COLLECTION)
          .insertOne({ username, password });
        resolve({ message: "Successfully Registered" });
      } catch (err) {
        if (err.code === 11000) {
          //Handle duplicate username error
          reject({ message: "This User Already Exists" });
        } else {
          reject({ message: err.message });
        }
      }
    });
  },

  loginUser: (username, password) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .collection(collection.USERS_COLLECTION)
        .findOne({ username: username });
      if (user) {
        bcrypt.compare(password, user.password).then(status => {
          if (status) {
            //Login Sucess
            resolve(user);
          } else {
            reject({ message: "Password Not Matched" });
          }
        });
      } else {
        reject({ message: "User Not found" });
      }
    });
  },

  addPost: (blog, coverImageURL, user) => {
    const { title, summary, content } = blog;
    const { _id, username } = user;
    return new Promise((resolve, reject) => {
      try {
        const now = new Date();
        db.collection(collection.POSTS_COLLECTION).insertOne({
          userId: _id,
          author: username,
          title: title,
          summary: summary,
          content: content,
          coverImageURL: coverImageURL,
          createdAt: now,
          updatedAt: now,
        });
        resolve("Successfully Posted The blog");
      } catch (err) {
        console.log(err);
        reject("Posting failed");
      }
    });
  },

  getAllPost: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const blogs = await db
          .collection(collection.POSTS_COLLECTION)
          .find()
          .sort({ createdAt: -1 })
          .limit(25)
          .toArray();
        resolve(blogs);
      } catch (err) {
        console.log(err);
      }
    });
  },

  getPostById: postId => {
    return new Promise(async (resolve, reject) => {
      postId = new ObjectId(postId);
      try {
        const singleBlog = await db
          .collection(collection.POSTS_COLLECTION)
          .findOne({ _id: postId });
        resolve(singleBlog);
      } catch (err) {
        reject(err);
      }
    });
  },
};
