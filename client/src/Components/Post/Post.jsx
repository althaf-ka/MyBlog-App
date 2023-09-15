import React, { useContext, useEffect, useState } from "react";
import "./Post.css";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Bookmark from "../BookMark/BookMark";

function Post(props) {
  const {
    _id,
    author,
    title,
    content,
    coverImageURL,
    createdAt,
    userId,
    isBookmarked,
    currentUserId = false,
    hideBookmark = false,
  } = props;

  const [bookmarkStatus, setBookmarkStatus] = useState(isBookmarked);

  useEffect(() => {
    setBookmarkStatus(isBookmarked);
  }, [isBookmarked]);

  //Convert html file into String from QuillEditor
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const plainTextContent = doc.body.textContent;

  const handleAuthorClick = e => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="posts-container">
        <div className="posts-info">
          <div className="posts-title">
            <Link to={`/post/${_id}`}>
              <h2>{title?.substring(0, 105)}</h2>
            </Link>
          </div>
          <div className="posts-summary">
            <Link to={`/post/${_id}`}>
              <p>{plainTextContent.substring(0, 170) + " ..."}</p>
            </Link>
          </div>

          <div className="post-sub">
            <div className="post-sub-content">
              <div className="left-content">
                <Link
                  to={`/profile/${userId}`}
                  className="author-name-post"
                  onClick={handleAuthorClick}
                >
                  {author}
                </Link>

                <div className="dot-container">
                  <span className="dot">·</span>
                </div>

                <time className="post-time">
                  {format(new Date(createdAt), "MMM d")}
                </time>
              </div>
              <div className="right-content">
                {!hideBookmark && (
                  <Bookmark
                    postId={_id}
                    isBookmarked={bookmarkStatus}
                    currentUserId={currentUserId}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="posts-coverimg">
          <Link to={`/post/${_id}`}>
            <img
              src={`/api/uploads/postImages/${coverImageURL}`}
              alt="PosterImg"
            />
          </Link>
        </div>
      </div>
    </>
  );
}

export default Post;
