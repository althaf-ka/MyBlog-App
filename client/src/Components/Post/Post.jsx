import React from "react";
import "./Post.css";
import { format } from "date-fns";
import { Link } from "react-router-dom";

function Post({ _id, author, title, summary, coverImageURL, createdAt }) {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img
            src={`http://localhost:4000/uploads/postImages/${coverImageURL}`}
            alt="PosterImg"
          />
        </Link>
      </div>
      <div className="text">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a href="" className="author">
            {author}
          </a>
          <time>{format(new Date(createdAt), "MMM d, yyyy HH:mm")}</time>
        </p>
        <Link to={`/post/${_id}`}>
          <p className="summary">{summary}</p>
        </Link>
      </div>
    </div>
  );
}

export default Post;
