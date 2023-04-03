let db = require("../db/connection");
let collection = require("../db/collection");
let bcrypt = require("bcrypt");

module.exports = {
  registerUser: (username, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        password = await bcrypt.hash(password, 5);
        await db
          .get()
          .collection(collection.USERS_COLLECTION)
          .createIndex({ username: 1 }, { unique: true });
        await db
          .get()
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
        .get()
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
};
