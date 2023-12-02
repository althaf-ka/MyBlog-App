import React, { useContext, useState } from "react";
import "./AuthorBlogLists.css";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../config/axios";
import { toast } from "react-toastify";
import { PostContext } from "../../../Context/PostContext";

function AuthorBlogLists(props) {
  const {
    _id,
    title,
    createdAt,
    coverImageURL,
    setPostDetails,
    isAuthor,
    updateTotalBlogsCount,
    deleteInProgress,
    setDeleteInProgress,
  } = props;
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { removePostFromHome } = useContext(PostContext);

  const handleDelete = e => {
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteInProgress) return;

    setDeleteInProgress(true);
    setShowConfirmation(false);

    try {
      const deleteBlog = await toast.promise(
        axios.delete(`/posts/delete/${_id}`, {
          withCredentials: true,
        }),
        {
          pending: "Deleting Post...",
          success: "Post deleted successfully!",
          error: "Error deleting Post. Please try again later.",
        }
      );

      await updateTotalBlogsCount();

      setPostDetails(prevDetails =>
        prevDetails.filter(post => post._id !== _id)
      );

      if (deleteBlog.statusText === "OK") {
        removePostFromHome(_id);
      }
    } catch (err) {
      toast.error(err.response?.data);
    } finally {
      setDeleteInProgress(false);
      setShowConfirmation(false);
    }
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
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteInProgress} //If delete in progress button gets disabled
                >
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
            src={`/api/uploads/postImages/${coverImageURL}`}
            alt="Post Image"
          />
        </div>
      </div>
    </>
  );
}

export default AuthorBlogLists;
