import React, { useState } from "react";
import "./AuthorBlogLists.css";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../config/axios";

function AuthorBlogLists(props) {
  const { _id, title, createdAt, coverImageURL, setPostDetails, isAuthor } =
    props;
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDelete = e => {
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const deleteBlog = await axios.delete(`/posts/delete/${_id}`, {
        withCredentials: true,
      });
      console.log(deleteBlog);
      setPostDetails(prevDetails =>
        prevDetails.filter(post => post._id !== _id)
      );
    } catch (err) {
      console.log(err);
    }
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handlePostClick = () => {
    navigate(`/post/${_id}`);
  };
  return (
    <>
      {showConfirmation && (
        <dialog open className="confirmation-dialog">
          <div className="confirmation-dialog-content">
            <h2>Are you sure you want to delete?</h2>
            <div className="confirmation-dialog-buttons">
              <button onClick={handleConfirmDelete} className="confirm-button">
                Yes
              </button>
              <button onClick={handleCancelDelete} className="cancel-button">
                No
              </button>
            </div>
          </div>
        </dialog>
      )}

      <div key={_id} className="author-blogs-card" onClick={handlePostClick}>
        <div className="author-blogs-content">
          <h3>{title}</h3>
          <div className="author-blogs-opt">
            <time>{format(new Date(createdAt), "MMM d, yyyy HH:mm")}</time>
            {/* Displaying the delete and edit btn */}
            {isAuthor && (
              <div className="author-post-btn">
                <button type="button" onClick={handleDelete}>
                  <i className="fa fa-trash-o" aria-hidden="true"></i>
                </button>
                <Link to={`/edit/${_id}`}>
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="author-blogs-image">
          <img
            src={`http://localhost:4000/uploads/postImages/${coverImageURL}`}
            alt="Post Image"
          />
        </div>
      </div>
    </>
  );
}

export default AuthorBlogLists;
