import React from "react";
import "./TopicBlogLists.css";
import { format } from "date-fns";
import { Link } from "react-router-dom";

function TopicBlogLists({ _id, title, content, author, createdAt, coverImageURL }) {
  const parser = new DOMParser();

  const contentData = parser.parseFromString(content, "text/html");
  return (
    <div key={_id} className="post-card">
      <div className="post-content">
        <Link to={`/post/${_id}`}>
          <h3>{title}</h3>
          <p className="post-description">
            {contentData.documentElement.textContent.substring(0, 200) + "....."}
          </p>
          <div className="post-meta">
            <div className="author">{author}</div>
            <time className="date">
              {format(new Date(createdAt), "MMM d, yyyy HH:mm")}
            </time>
          </div>
        </Link>
      </div>
      <div className="post-image">
        <Link to={`/post/${_id}`}>
          <img
            src={`http://localhost:4000/uploads/postImages/${coverImageURL}`}
            alt="Post Image"
          />
        </Link>
      </div>
    </div>
  );
}

export default TopicBlogLists;
