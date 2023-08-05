import { ObjectId } from "mongodb";
import collection from "../db/collection.js";
import { db } from "../db/connection.js";
import createError from "../utils/createError.js";

const bookmarksOfPostsByUsers = ({ currentUserId, postId }) => {
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
      reject(createError(400, "Error in Fetching Bookmarks"));
    }
  });
};

const addBookmarkList = ({ currentUserId, bookmarkListName, postId }) => {
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
            $push: {
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
      reject(createError(400, "Failed Adding bookmark"));
    }
  });
};

const removeBookmark = ({ currentUserId, bookmarkListName, postId }) => {
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
      } else {
        reject(createError(404, "Bookmark not found"));
      }
    } catch (error) {
      reject(createError(404, "Error in removing Bookmark"));
    }
  });
};

const isPostBookmarkedByUser = ({ postId, userId }) => {
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
      reject(createError(404, "Error in Finding Bookmarks"));
    }
  });
};

const getBookmarkListNamesWithCover = userId => {
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
                    postIds: { $slice: ["$$bookmark.postId", -3] },
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
      reject(createError(404, "Error in Finding Bookmark Lists"));
    }
  });
};

const userBookmarkedPostList = ({ name, userId }) => {
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

      resolve(bookmarkListResponse[0]);
    } catch (error) {
      reject(createError(404, "Error in Finding Bookmarked Posts"));
    }
  });
};

const removeBookmarkList = (userId, name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bookmarkName = name;
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
    } catch (error) {
      reject(createError(404, "Error in Deleting Bookmark List"));
    }
  });
};

export default {
  bookmarksOfPostsByUsers,
  addBookmarkList,
  removeBookmark,
  isPostBookmarkedByUser,
  getBookmarkListNamesWithCover,
  userBookmarkedPostList,
  removeBookmarkList,
};
