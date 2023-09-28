import { ObjectId } from "mongodb";
import collection from "../db/collection.js";
import { db } from "../db/connection.js";
import createError from "../utils/createError.js";

const allTopicSuggestions = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const topicSuggestions = await db
        .collection(collection.TOPICS_COLLECTION)
        .find({}, { projection: { title: 1, _id: 1 } })
        .sort({ total: -1 })
        .toArray();

      resolve(topicSuggestions);
    } catch (err) {
      reject(
        createError(
          500,
          "An error occurred while retrieving topic suggestions."
        )
      );
    }
  });
};

const totalBlogsInTopic = topicId => {
  return new Promise(async (resolve, reject) => {
    try {
      const TotalTopicBlogs = await db
        .collection(collection.TOPICS_COLLECTION)
        .findOne(
          { _id: new ObjectId(topicId) },
          { projection: { _id: 0, posts: 0 } }
        );
      resolve(TotalTopicBlogs);
    } catch (err) {
      reject(createError(404, `Topics Fetching Error`));
    }
  });
};

const topicWiseAllBlogs = (topicId, skip) => {
  return new Promise(async (resolve, reject) => {
    try {
      const allBlogs = await db
        .collection(collection.TOPICS_COLLECTION)
        .aggregate([
          { $match: { _id: new ObjectId(topicId) } },
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
            $lookup: {
              from: collection.USERS_COLLECTION,
              localField: "postsDetails.userId",
              foreignField: "_id",
              as: "author",
            },
          },
          { $unwind: "$author" },
          {
            $addFields: {
              "postsDetails.author": "$author.name",
            },
          },
          {
            $project: {
              _id: 0,
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
          { $sort: { "postsDetails.createdAt": -1 } },
          { $skip: parseInt(skip) || 0 },
          { $limit: 15 },
          {
            $replaceRoot: {
              newRoot: "$postsDetails",
            },
          },
        ])
        .toArray();

      if (allBlogs.length === 0 && skip === 0) {
        reject(createError(404, "No blogs found for topic"));
      } else {
        resolve(allBlogs);
      }
    } catch (error) {
      reject(createError(404, `No blogs found for topic`));
    }
  });
};

export default {
  allTopicSuggestions,
  totalBlogsInTopic,
  topicWiseAllBlogs,
};
