const { MongoClient } = require("mongodb");

const state = {
  db: null,
};

module.exports.connect = function (done) {
  const url = "mongodb://0.0.0.0:27017";
  const client = new MongoClient(url);
  const dbName = "myBlogDB";

  async function main() {
    // Use connect method to connect to the server
    await client.connect();
    state.db = client.db(dbName);
    return "Successfully Connected to Database";
  }

  main().then(console.log).catch(console.error);
};

module.exports.get = function () {
  return state.db;
};
