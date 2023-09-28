import { MongoClient } from "mongodb";

let db = null;

export const connect = async done => {
  const url = process.env.MONGO_DB_URL;

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
