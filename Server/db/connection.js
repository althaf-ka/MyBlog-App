import { MongoClient } from "mongodb";

let db = null;

export const connect = async done => {
  const url = "mongodb://0.0.0.0:27017";

  const dbName = "myBlogDB";

  try {
    let data = await MongoClient.connect(url, { useNewUrlParser: true });
    db = data.db(dbName);
    done();
  } catch (error) {
    done(error);
  }
};

export { db };
