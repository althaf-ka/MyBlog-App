import { ObjectId } from "mongodb";
import collection from "../db/collection.js";
import { db } from "../db/connection.js";
import createError from "../utils/createError.js";

const addApplauseDetails = (
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
      reject(createError(500, "Applaused Failed"));
    }
  });
};

const deleteApplause = ({ postId, currentUserId }) => {
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
        throw new Error("Failed Removing Claps");
      }
    } catch (err) {
      reject(createError(400, "Failed Removing Claps"));
    }
  });
};

const retrieveApplauseAndUserCounts = ({ postId, userId }) => {
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
      reject(createError(500, "Error in Retriving Previous Claps"));
    }
  });
};

export default {
  addApplauseDetails,
  deleteApplause,
  retrieveApplauseAndUserCounts,
};
