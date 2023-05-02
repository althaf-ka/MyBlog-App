import { db } from "../db/connection.js";
import collection from "../db/collection.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { response } from "express";

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
    const { title, content, topics } = blog;
    const { _id, username } = user;
    return new Promise(async (resolve, reject) => {
      try {
        const now = new Date();
        const newPost = await db
          .collection(collection.POSTS_COLLECTION)
          .insertOne({
            userId: _id,
            author: username,
            title: title,
            content: content,
            coverImageURL: coverImageURL,
            topics: topics,
            createdAt: now,
            updatedAt: null,
          });

        //Adding topics to collection
        const newPostId = new ObjectId(newPost.insertedId);
        // Create an array of bulk write operations for each topics
        const bulkOps = topics.map(topic => ({
          updateOne: {
            filter: { title: topic },
            update: {
              $inc: { total: 1 },
              $addToSet: { posts: newPostId },
            },
            upsert: true,
          },
        }));
        await db.collection(collection.TOPICS_COLLECTION).bulkWrite(bulkOps);

        resolve("Successfully Posted The blog");
      } catch (err) {
        console.log(err, "dbHElper");
        reject("Posting failed", err);
      }
    });
  },

  getAllPost: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const blogs = await db
          .collection(collection.POSTS_COLLECTION)
          .find()
          .sort({ createdAt: -1 }) //To get Latest Blogs
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

  updatePost: (postId, blogDetails, coverImageURL) => {
    const { title, content, removedTopics, newTopics, allTopics } = blogDetails;

    return new Promise(async (resolve, reject) => {
      postId = new ObjectId(postId);
      const now = new Date();

      try {
        const updateFields = {
          title: title,
          content: content,
          topics: allTopics,
          updatedAt: now,
        };
        //checking for new cover image Present
        if (coverImageURL) {
          updateFields.coverImageURL = coverImageURL;
        }

        const bulkOps = [];
        //remove topic from topic collection
        removedTopics?.forEach(topic => {
          bulkOps.push({
            updateOne: {
              filter: { title: topic },
              update: {
                $inc: { total: -1 },
                $pull: { posts: postId },
              },
              upsert: true,
            },
          });
        });
        //add new Topics to topics collection
        newTopics?.forEach(topic => {
          bulkOps.push({
            updateOne: {
              filter: { title: topic },
              update: {
                $inc: { total: 1 },
                $addToSet: { posts: postId },
              },
              upsert: true,
            },
          });
        });

        // If there are no topics, update only the post
        if (!bulkOps.length > 0) {
          const postUpdateResult = await db
            .collection(collection.POSTS_COLLECTION)
            .updateOne({ _id: postId }, { $set: updateFields });
          if (!postUpdateResult) {
            throw new Error({ status: 500, message: "Updating Post Failed" });
          }
          return resolve("Updating Post Successful");
        }

        // Update post and topics
        const [postUpdateResult, topicsUpdateResult] = await Promise.all([
          db
            .collection(collection.POSTS_COLLECTION)
            .updateOne({ _id: postId }, { $set: updateFields }),
          db.collection(collection.TOPICS_COLLECTION).bulkWrite(bulkOps),
        ]);

        if (!postUpdateResult || !topicsUpdateResult) {
          throw new Error({ status: 500, message: "Updating Post Failed" });
        }

        return resolve("Updating Post Successful");
      } catch (error) {
        reject({ status: 500, message: "Updating Post Failed" });
      } finally {
        // Delete topics with total 0
        await db
          .collection(collection.TOPICS_COLLECTION)
          .deleteMany({ total: 0 });
      }
    });
  },

  AlltopicSuggestion: () => {
    return new Promise(async (resolve, reject) => {
      const topicSuggestions = await db
        .collection(collection.TOPICS_COLLECTION)
        .find({}, { projection: { title: 1, _id: 0 } })
        .sort({ total: -1 })
        .toArray();
      resolve(topicSuggestions);
    });
  },

  TopicWiseAllBlogs: topicName => {
    topicName = topicName.toLowerCase().replace(/-/g, " ");

    return new Promise(async (resolve, reject) => {
      try {
        const allBlogs = await db
          .collection(collection.TOPICS_COLLECTION)
          .aggregate([
            { $match: { title: { $regex: new RegExp(topicName, "i") } } },
            {
              $lookup: {
                from: collection.POSTS_COLLECTION,
                localField: "posts",
                foreignField: "_id",
                as: "postsDetails",
              },
            },
            { $unwind: "$postsDetails" },
            {
              $project: {
                _id: 0,
                title: 1,
                total: 1,
                "postsDetails._id": 1,
                "postsDetails.userId": 1,
                "postsDetails.author": 1,
                "postsDetails.title": 1,
                "postsDetails.content": {
                  $substrCP: ["$postsDetails.content", 0, 600],
                },
                "postsDetails.coverImageURL": 1,
                "postsDetails.createdAt": 1,
              },
            },
            {
              $group: {
                _id: "$title",
                total: { $first: "$total" },
                postsDetails: { $push: "$postsDetails" },
              },
            },
            // { $limit: limit },
          ])
          .toArray();

        if (allBlogs.length === 0) {
          throw {
            status: 404,
            message: `No blogs found for topic: ${topicName}`,
          };
        } else {
          resolve(allBlogs[0]);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};
