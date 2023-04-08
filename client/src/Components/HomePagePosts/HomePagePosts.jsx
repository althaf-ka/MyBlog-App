import React, { useEffect } from "react";
import "./HomePagePosts.css";
import Post from "../Post/Post";
import axios from "../../../config/axios";
import { useState } from "react";

function HomePagePosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    axios
      .get("/post")
      .then(blogPosts => {
        setPosts(blogPosts.data);
      })
      .catch(err => {});
  }, []);
  return (
    <>
      {posts.length > 0 &&
        posts.map((post, index) => <Post key={index} {...post} />)}
    </>
  );
}

export default HomePagePosts;
