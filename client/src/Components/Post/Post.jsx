import React from "react";
import "./Post.css";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

function Post({ _id, author, title, content, coverImageURL, createdAt, userId }) {
  //Convert html file into String from QuillEditor
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const plainTextContent = doc.body.textContent;
  const navigate = useNavigate();

  const handleDivClick = () => {
    navigate(`/post/${_id}`);
  };
  const handleAuthorClick = e => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="post" onClick={handleDivClick}>
        <div className="image">
          <img
            src={`http://localhost:4000/uploads/postImages/${coverImageURL}`}
            alt="PosterImg"
          />
        </div>
        <div className="text">
          <h2>{title?.substring(0, 110)}</h2>
          <p className="info">
            <Link
              to={`/profile/${userId}`}
              className="author"
              onClick={handleAuthorClick}
            >
              {author}
            </Link>
            <time>{format(new Date(createdAt), "MMM d, yyyy HH:mm")}</time>
          </p>

          <p className="summary">
            {plainTextContent.substring(0, 250) + " ..."}
          </p>
        </div>
      </div>
    </>
  );
}

export default Post;
