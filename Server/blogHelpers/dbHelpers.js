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

  getAllPost: skip => {
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
                author: "$author.name", // Assuming the author's name field is 'name'
              },
            },
          ])
          .toArray();
        resolve(blogs);
      } catch (err) {
        console.log(err);
      }
    });
  },

  getPostById: postId => {
    //topic lookup to get topic id
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
        resolve(singleBlog[0]);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  postsByAuthor: (userId, skip) => {
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

  deletePostById: postId => {
    return new Promise((resolve, reject) => {
      db.collection(collection.POSTS_COLLECTION)
        .deleteOne({ _id: new ObjectId(postId) })
        .then(response => {
          if (response.deletedCount === 0) {
            throw { status: 404, message: "Failed to Delete the post" };
          }
          resolve({
            status: 200,
            message: "Post has been deleted Sucessfully",
          });
        })
        .catch(err => {
          reject({
            status: err.status || 404,
            message: err.message || "Something Happened",
          });
        });
    });
  },

  AlltopicSuggestion: () => {
    return new Promise(async (resolve, reject) => {
      const topicSuggestions = await db
        .collection(collection.TOPICS_COLLECTION)
        .find({}, { projection: { title: 1, _id: 1 } })
        .sort({ total: -1 })
        .toArray();
      console.log(topicSuggestions);
      resolve(topicSuggestions);
    });
  },

  TotalBlogsInTopic: topicId => {
    return new Promise(async (resolve, reject) => {
      const TotalTopicBlogs = await db
        .collection(collection.TOPICS_COLLECTION)
        .findOne(
          { _id: new ObjectId(topicId) },
          { projection: { _id: 0, posts: 0 } }
        );
      resolve(TotalTopicBlogs);
    });
  },

  TopicWiseAllBlogs: (topicId, skip) => {
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
          throw {
            status: 404,
            message: `No blogs found for topic: ${topicName}`,
          };
        } else {
          resolve(allBlogs);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  getAuthorDetails: userId => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = await db
          .collection(collection.USERS_COLLECTION)
          .findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: false } }
          );
        if (author === null) {
          throw { status: 404, message: "Failed to retrieve user" };
        }

        const totalBlogs = await db
          .collection(collection.POSTS_COLLECTION)
          .countDocuments({ userId: new ObjectId(userId) });

        resolve({ ...author, totalBlogs });
      } catch (err) {
        reject(err);
      }
    });
  },

  addAuthorDetails: (profileDetails, profileImageURL) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, username, bio, socialLinks, id } = profileDetails;

        // Check if the username already exists for a different user($ne:)=>To exculde currrent Username
        const existingUsername = await db
          .collection(collection.USERS_COLLECTION)
          .findOne({ username, _id: { $ne: new ObjectId(id) } });
        console.log(existingUsername, "existinguse");
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
          throw {
            status: 500,
            message: "Profile updation failed. Please try again later.",
          };
        }
        resolve({ status: 200, message: "Profile updated Sucessfully." });
      } catch (err) {
        reject(err);
      }
    });
  },

  addApplauseDetails: (
    { currentUserId, newlyAddedClaps, authorId },
    postId
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await db
          .collection(collection.APPLAUSE_COLLECTION)
          .updateOne(
            {
              postId: new ObjectId(postId),
              "applausedUsers.userId": currentUserId,
            },
            { $set: { "applausedUsers.$.claps": newlyAddedClaps } }
          );

        if (response?.matchedCount === 0) {
          response = await db
            .collection(collection.APPLAUSE_COLLECTION)
            .updateOne(
              { postId: new ObjectId(postId) },
              {
                $set: {
                  postId: new ObjectId(postId),
                  authorId: new ObjectId(authorId),
                },
                $addToSet: {
                  applausedUsers: {
                    userId: currentUserId,
                    claps: newlyAddedClaps,
                  },
                },
              },
              { upsert: true }
            );
        }

        resolve({ status: 200, message: "Applaused Sucessfully" });
      } catch (error) {
        console.log(error);
        reject({
          status: error.status || 500,
          message: "Applaused Failed",
        });
      }
    });
  },

  retrieveApplauseAndUserCounts: ({ postId, userId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const applausedData = await db
          .collection(collection.APPLAUSE_COLLECTION)
          .aggregate([
            {
              $match: { postId: new ObjectId(postId) },
            },
            {
              $project: {
                totalClaps: { $sum: "$applausedUsers.claps" },
                filteredApplausedUsers: {
                  $filter: {
                    input: "$applausedUsers",
                    cond: { $eq: ["$$this.userId", userId] }, //Create a array of object
                  },
                },
              },
            },
            {
              $project: {
                totalClaps: 1,
                currentUserClaps: {
                  $ifNull: [
                    { $arrayElemAt: ["$filteredApplausedUsers.claps", 0] },
                    0,
                  ],
                },
              },
            },
          ])
          .toArray();

        if (applausedData.length === 0) {
          resolve({ status: 404, message: "No Previous Applause Found" });
        }
        resolve(applausedData[0]);
      } catch (err) {
        console.log(err);
        reject({
          status: err.status || 500,
          message: "Error in Retriving Previous Claps",
        });
      }
    });
  },

  deleteApplause: ({ postId, currentUserId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const deleteDetails = await db
          .collection(collection.APPLAUSE_COLLECTION)
          .updateOne(
            { postId: new ObjectId(postId) },
            {
              $pull: {
                applausedUsers: { userId: currentUserId },
              },
            }
          );

        if (deleteDetails.modifiedCount === 1) {
          resolve({ status: 200, message: "Sucessfully Removed Claps" });
        } else {
          reject({ status: 400, message: "Failed Removing Claps" });
        }
      } catch (err) {
        reject({
          status: 400,
          message: "Failed Removing Claps" || err.message,
        });
      }
    });
  },

  bookmarksOfPostsByUsers: ({ currentUserId, postId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        postId = new ObjectId(postId);
        const bookmarkDetailsResponse = await db
          .collection(collection.BOOKMARK_COLLECTION)
          .aggregate([
            { $match: { userId: new ObjectId(currentUserId) } },
            {
              $project: {
                bookmarks: {
                  $map: {
                    input: "$bookmarks",
                    as: "bookmark",
                    in: {
                      name: "$$bookmark.name",
                      hasPostId: {
                        $in: [postId, "$$bookmark.postId"],
                      },
                    },
                  },
                },
              },
            },
            {
              $unwind: "$bookmarks",
            },
            {
              $project: {
                _id: 0,
                name: "$bookmarks.name",
                checked: "$bookmarks.hasPostId",
              },
            },
          ])
          .toArray();

        resolve(bookmarkDetailsResponse);
      } catch (error) {
        console.log(error);
        reject({
          status: 400,
          message: "Error in Fetching Bookmarks",
        });
      }
    });
  },

  addBookmarkList: ({ currentUserId, bookmarkListName, postId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        postId = new ObjectId(postId);
        const addBookmarkResponse = await db
          .collection(collection.BOOKMARK_COLLECTION)
          .updateOne(
            {
              userId: new ObjectId(currentUserId),
              "bookmarks.name": bookmarkListName,
            },
            {
              $addToSet: {
                "bookmarks.$.postId": postId,
              },
            }
          );

        if (addBookmarkResponse.matchedCount === 0) {
          // Document doesn't exist, so insert a new one
          await db.collection(collection.BOOKMARK_COLLECTION).updateOne(
            { userId: new ObjectId(currentUserId) },
            {
              $push: {
                bookmarks: {
                  name: bookmarkListName,
                  postId: [postId],
                },
              },
            },
            { upsert: true }
          );
        }

        resolve({ status: 200, message: "Sucessfully Added Blog to Bookmark" });
      } catch (error) {
        console.log(error);
        reject({
          status: 400,
          message: "Failed Adding bookmark" || err.message,
        });
      }
    });
  },

  removeBookmark: ({ currentUserId, bookmarkListName, postId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        postId = new ObjectId(postId);
        const removeResponse = await db
          .collection(collection.BOOKMARK_COLLECTION)
          .updateOne(
            {
              userId: new ObjectId(currentUserId),
              "bookmarks.name": bookmarkListName,
            },
            { $pull: { "bookmarks.$.postId": postId } }
          );

        if (removeResponse.matchedCount === 1) {
          resolve({ status: 200, message: "Bookmark removed successfully" });
        }
        resolve({ status: 200, message: "Bookmark removed successfully" });
      } catch (error) {
        reject({ status: 404, message: "Error in removing Bookmark" });
        console.log(error);
      }
    });
  },

  isPostBookmarkedByUser: ({ postId, userId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        postId = new ObjectId(postId);
        const bookmarkedResponse = await db
          .collection(collection.BOOKMARK_COLLECTION)
          .aggregate([
            {
              $match: {
                userId: new ObjectId(userId),
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                _id: 0,
                hasBookmark: {
                  $anyElementTrue: {
                    $map: {
                      input: "$bookmarks",
                      as: "bookmark",
                      in: { $in: [postId, "$$bookmark.postId"] },
                    },
                  },
                },
              },
            },
          ])
          .toArray();

        resolve(bookmarkedResponse[0]);
      } catch (error) {
        reject({ status: 404, message: "Error in Finding Bookmarks" });
        console.log(error);
      }
    });
  },

  getBookmarkListNamesWithCover: userId => {
    return new Promise(async (resolve, reject) => {
      try {
        const listResponse = await db
          .collection(collection.BOOKMARK_COLLECTION)
          .aggregate([
            { $match: { userId: new ObjectId(userId) } },
            {
              $project: {
                bookmarkList: {
                  $map: {
                    input: "$bookmarks",
                    as: "bookmark",
                    in: {
                      name: "$$bookmark.name",
                      storyCount: { $size: "$$bookmark.postId" },
                      postIds: { $slice: ["$$bookmark.postId", 3] },
                    },
                  },
                },
              },
            },
            { $unwind: "$bookmarkList" },
            {
              $lookup: {
                from: collection.POSTS_COLLECTION,
                let: { postIds: "$bookmarkList.postIds" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$postIds"] } } },
                  { $project: { coverImageURL: 1 } },
                  { $limit: 3 },
                ],
                as: "coverImage",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  name: "$bookmarkList.name",
                  storyCount: "$bookmarkList.storyCount",
                  coverImageURL: "$coverImage.coverImageURL",
                },
              },
            },
          ])
          .toArray();

        resolve(listResponse);
      } catch (error) {
        console.log(error);
        reject({ status: 404, message: "Error in Finding Bookmark Lists" });
      }
    });
  },

  userBookmarkedPostList: ({ name, userId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const formattedListName = name.replace(/-/g, " ");
        const bookmarkListResponse = await db
          .collection(collection.BOOKMARK_COLLECTION)
          .aggregate([
            { $match: { userId: new ObjectId(userId) } },
            {
              $project: {
                bookmarks: {
                  $filter: {
                    input: "$bookmarks",
                    as: "bookmark",
                    cond: {
                      $regexMatch: {
                        input: "$$bookmark.name",
                        regex: new RegExp("^" + formattedListName, "i"),
                      },
                    },
                  },
                },
              },
            },
            { $unwind: "$bookmarks" },
            {
              $addFields: {
                storyCount: { $size: "$bookmarks.postId" },
              },
            },
            {
              $lookup: {
                from: collection.POSTS_COLLECTION,
                let: { postIds: "$bookmarks.postId" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$postIds"] } } },
                  {
                    $lookup: {
                      from: collection.USERS_COLLECTION,
                      let: { authorId: "$userId" },
                      pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$authorId"] } } },
                        { $project: { name: 1, _id: 0 } },
                      ],
                      as: "author",
                    },
                  },
                  {
                    $project: {
                      title: 1,
                      coverImageURL: 1,
                      author: { $arrayElemAt: ["$author.name", 0] },
                      content: { $substr: ["$content", 0, 600] },
                      createdAt: 1,
                    },
                  },
                ],
                as: "bookmarkedPosts",
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  name: "$bookmarks.name",
                  storyCount: "$storyCount",
                  bookmarkedPosts: "$bookmarkedPosts",
                },
              },
            },
          ])
          .toArray();
        console.log(bookmarkListResponse[0]);
        resolve(bookmarkListResponse[0]);
      } catch (error) {
        console.log(error);
        reject({ status: 404, message: "Error in Finding Bookmarked Posts" });
      }
    });
  },

  removeBookmarkList: (userId, name) => {
    const bookmarkName = name;
    return new Promise(async (resolve, reject) => {
      try {
        const deleteResponse = await db
          .collection(collection.BOOKMARK_COLLECTION)
          .updateOne(
            {
              userId: new ObjectId(userId),
              "bookmarks.name": { $regex: new RegExp(bookmarkName, "i") },
            },
            {
              $pull: {
                bookmarks: {
                  name: { $regex: new RegExp("^" + bookmarkName + "$", "i") },
                },
              },
            }
          );

        if (deleteResponse.modifiedCount === 1) {
          resolve({ status: 200, message: "Bookmark deleted successfully" });
        }

        resolve({ status: 200, message: "Bookmark deleted successfully" });
      } catch (error) {
        console.log(error);
        reject({ status: 404, message: "Error in Deleting Bookmark List" });
      }
    });
  },
};
