import React from "react";
import "./Post.css";
import { format } from "date-fns";
import { Link } from "react-router-dom";

function Post({ _id, author, title, content, coverImageURL, createdAt }) {
  //Convert html file into String from QuillEditor
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const plainTextContent = doc.body.textContent;
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img
            src={`http://localhost:4000/uploads/postImages/${coverImageURL}`}
            alt="PosterImg"
          />
        </Link>{" "}
      </div>
      <div className="text">
        <Link to={`/post/${_id}`}>
          <h2>{title.substring(0, 110)}</h2>
        </Link>
        <p className="info">
          <a href="" className="author">
            {author}
          </a>
          <time>{format(new Date(createdAt), "MMM d, yyyy HH:mm")}</time>
        </p>
        <Link to={`/post/${_id}`}>
          <p className="summary">
            {plainTextContent.substring(0, 250) + " ..."}
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Post;
