import { ObjectId } from "mongodb";
import collection from "../db/collection.js";
import { db } from "../db/connection.js";
import createError from "../utils/createError.js";

const addPost = (blog, coverImageURL, user) => {
  const { title, content, topics } = blog;
  const { _id } = user;
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const newPost = await db
        .collection(collection.POSTS_COLLECTION)
        .insertOne({
          userId: new ObjectId(_id),
          title: title,
          content: content,
          coverImageURL: coverImageURL,
          topics: topics,
          createdAt: now,
          updatedAt: null,
        });

      //Adding topics to collection
      const newPostId = new ObjectId(newPost.insertedId);

      if (topics) {
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
      }

      resolve({ message: "Successfully Posted the Blog" });
    } catch (err) {
      console.log(err, "service");
      reject(
        createError(
          500,
          "Failed to post. The server encountered an error. Please try again later."
        )
      );
    }
  });
};

const getAllPost = skip => {
  return new Promise(async (resolve, reject) => {
    try {
      const blogs = await db
        .collection(collection.POSTS_COLLECTION)
        .aggregate([
          {
            $lookup: {
              from: collection.USERS_COLLECTION,
              localField: "userId",
              foreignField: "_id",
              as: "author",
            },
          },
          {
            $unwind: "$author",
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $skip: parseInt(skip) || 0,
          },
          {
            $limit: 15,
          },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              createdAt: 1,
              coverImageURL: 1,
              userId: 1,
              author: "$author.name",
            },
          },
        ])
        .toArray();
      resolve(blogs);
    } catch (err) {
      reject(
        createError(
          500,
          "We apologize, but an error occurred while retrieving the blogs. Please try again later."
        )
      );
    }
  });
};

const getAllPostWithBookmarks = (userId, skip) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blogs = await db
        .collection(collection.POSTS_COLLECTION)
        .aggregate([
          {
            $lookup: {
              from: collection.USERS_COLLECTION,
              localField: "userId",
              foreignField: "_id",
              as: "author",
            },
          },
          {
            $unwind: "$author",
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $skip: parseInt(skip) || 0,
          },
          {
            $limit: 15,
          },
          {
            $lookup: {
              from: collection.BOOKMARK_COLLECTION,
              let: { postId: "$_id" },
              pipeline: [
                { $match: { userId: new ObjectId(userId) } },
                {
                  $project: {
                    isBookmarked: {
                      $anyElementTrue: {
                        $map: {
                          input: "$bookmarks.postId",
                          as: "bookmarkId",
                          in: { $in: ["$$postId", "$$bookmarkId"] },
                        },
                      },
                    },
                  },
                },
              ],
              as: "bookmarks",
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              createdAt: 1,
              coverImageURL: 1,
              userId: 1,
              author: "$author.name",
              isBookmarked: { $arrayElemAt: ["$bookmarks.isBookmarked", 0] },
            },
          },
        ])
        .toArray();

      resolve(blogs);
    } catch (err) {
      reject(
        createError(
          500,
          "We apologize, but an error occurred while retrieving the blogs. Please try again later."
        )
      );
    }
  });
};

const getPostById = postId => {
  return new Promise(async (resolve, reject) => {
    try {
      const singleBlog = await db
        .collection(collection.POSTS_COLLECTION)
        .aggregate([
          { $match: { _id: new ObjectId(postId) } },
          {
            $lookup: {
              from: collection.USERS_COLLECTION,
              localField: "userId",
              foreignField: "_id",
              as: "author",
            },
          },
          {
            $lookup: {
              from: collection.TOPICS_COLLECTION,
              localField: "topics",
              foreignField: "title",
              as: "topicDetails",
            },
          },
          {
            $project: {
              userId: 1,
              author: "$author.name",
              title: 1,
              content: 1,
              coverImageURL: 1,
              createdAt: 1,
              updatedAt: 1,
              profileImageURL: "$author.profileImageURL",
              topics: {
                $map: {
                  input: "$topicDetails",
                  as: "topic",
                  in: { _id: "$$topic._id", title: "$$topic.title" },
                },
              },
            },
          },
        ])
        .toArray();

      if (singleBlog.length === 0) {
        reject(
          createError(
            500,
            "An error occurred while retrieving the post details. Please try again later."
          )
        );
      }
      resolve(singleBlog[0]);
    } catch (err) {
      reject(
        createError(
          500,
          "An error occurred while retrieving the posts. Please try again later."
        )
      );
    }
  });
};

const updatePost = (postId, blogDetails, coverImageURL) => {
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
          reject(
            createError(500, "Updating Post Failed. Please try again later.")
          );
        }

        return resolve({ message: "Updating Post Successful" });
      }

      // Update post and topics
      const [postUpdateResult, topicsUpdateResult] = await Promise.all([
        db
          .collection(collection.POSTS_COLLECTION)
          .updateOne({ _id: postId }, { $set: updateFields }),
        db.collection(collection.TOPICS_COLLECTION).bulkWrite(bulkOps),
      ]);

      if (!postUpdateResult || !topicsUpdateResult) {
        reject(
          createError(500, "Updating Post Failed. Please try again later.")
        );
      }

      return resolve({ message: "Updating Post Successful" });
    } catch (error) {
      reject(createError(500, "Updating Post Failed. Please try again later."));
    } finally {
      // Delete topics docs without posts
      await db
        .collection(collection.TOPICS_COLLECTION)
        .deleteMany({ posts: { $size: 0 } });
    }
  });
};

const deletePostById = postId => {
  return new Promise((resolve, reject) => {
    db.collection(collection.POSTS_COLLECTION)
      .deleteOne({ _id: new ObjectId(postId) })
      .then(response => {
        if (response.deletedCount === 0) {
          reject(createError(404, "Failed to Delete the Post"));
        }
        resolve({
          status: 200,
          message: "Post has been deleted Sucessfully",
        });
      })
      .catch(() => {
        reject(createError(404, "Failed to Delete the Post"));
      });
  });
};

const deletePostReference = async (postId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Delete applause by postId
      await db
        .collection(collection.APPLAUSE_COLLECTION)
        .deleteOne({ postId: new ObjectId(postId) });

      // Delete bookmarks by postId
      await db.collection(collection.BOOKMARK_COLLECTION).updateMany(
        {
          userId: new ObjectId(userId),
          "bookmarks.postId": new ObjectId(postId),
        },
        { $pullAll: { "bookmarks.$[].postId": [new ObjectId(postId)] } }
      );

      // Delete topics by postId
      await db
        .collection(collection.TOPICS_COLLECTION)
        .updateMany(
          { posts: new ObjectId(postId) },
          { $pull: { posts: new ObjectId(postId) }, $inc: { total: -1 } }
        );

      // Delete topics docs without posts
      await db
        .collection(collection.TOPICS_COLLECTION)
        .deleteMany({ posts: { $size: 0 } });

      resolve({ status: 200, message: "Post Reference Deleted " });
    } catch (error) {
      reject(createError(404, "Failed to Delete Post Reference"));
    } finally {
      // Delete topics docs without posts
      await db
        .collection(collection.TOPICS_COLLECTION)
        .deleteMany({ posts: { $size: 0 } });
    }
  });
};

const postsByAuthor = (userId, skip) => {
  return new Promise(async (resolve, reject) => {
    try {
      const allPostsofAuthor = await db
        .collection(collection.POSTS_COLLECTION)
        .find(
          { userId: new ObjectId(userId) },
          { projection: { _id: 1, title: 1, coverImageURL: 1, createdAt: 1 } }
        )
        .sort({ createdAt: -1 })
        .skip(parseInt(skip) || 0)
        .limit(15)
        .toArray();
      resolve(allPostsofAuthor);
    } catch (err) {
      reject(createError(404, "Failed to Get Author Posts"));
    }
  });
};

export default {
  addPost,
  getAllPost,
  getAllPostWithBookmarks,
  getPostById,
  updatePost,
  deletePostById,
  deletePostReference,
  postsByAuthor,
};
