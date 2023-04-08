import React from "react";
import "./Post.css";
import { format } from "date-fns";

function Post({ author, title, summary, coverImageURL, createdAt }) {
  return (
    <div className="post">
      <div className="image">
        <img
          src={`http://localhost:4000/uploads/postImages/${coverImageURL}`}
          alt="PosterImg"
        />
      </div>
      <div className="text">
        <h2>{title}</h2>
        <p className="info">
          <a href="" className="author">
            {author}
          </a>
          <time>{format(new Date(createdAt), "MMM d, yyyy HH:mm")}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}

export default Post;
