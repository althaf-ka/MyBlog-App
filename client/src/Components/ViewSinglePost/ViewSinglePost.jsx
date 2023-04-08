import React from "react";
import "./ViewSinglePost.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../config/axios";
import { format } from "date-fns";

function ViewSinglePost() {
  const { id } = useParams();
  const [postInfo, setPostInfo] = useState(null);
  useEffect(() => {
    axios.get(`/post/${id}`).then(response => {
      setPostInfo(response.data);
    });
  }, []);

  if (!postInfo) return "";

  return (
    <>
      <div className="post-page">
        <h1>{postInfo.title}</h1>
        <time>{format(new Date(postInfo.createdAt), "MMM d, yyyy HH:mm")}</time>
        <div className="author">{postInfo.author}</div>
        <div className="image">
          <img
            src={`http://localhost:4000/uploads/postImages/${postInfo.coverImageURL}`}
            alt="PosterImg"
          />
        </div>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: postInfo.content }}
        ></div>
      </div>
    </>
  );
}

export default ViewSinglePost;
