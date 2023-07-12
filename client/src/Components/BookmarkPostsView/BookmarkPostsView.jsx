import { useContext, useEffect, useState } from "react";
import "./BookmarkPostsView.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import { format } from "date-fns";
import { UserContext } from "../../../Context/UserContext";

function BookmarkPostsView() {
  const { bookmarkName, userId } = useParams();
  const { userInfo } = useContext(UserContext);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchBookmarkPosts = async () => {
      try {
        const bookmarkResponse = await axios.get(
          `/bookmarks/list/posts/${bookmarkName}/${userId}`,
          { signal: controller.signal },
          { withCredentials: true }
        );

        setPosts(bookmarkResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBookmarkPosts();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = event => {
      if (event.target.closest(".bookmark-list-options-dropdown")) {
        return;
      }
      setOptionsVisible(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const toggleOptions = () => {
    setOptionsVisible(prevState => !prevState);
  };

  const handleListDelete = async listName => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this list?"
    );
    if (confirmed) {
      try {
        const data = { name: listName };
        const deleteResponse = await axios.put(
          `bookmarks/list/delete/${userInfo._id}`,
          data,
          { withCredentials: true }
        );

        if (deleteResponse.statusText === "OK") {
          navigate(-1);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handlePostClick = postId => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="bookmark-posts-view-container">
      <div className="view-bookmark-posts-header">
        <h2>{posts?.name}</h2>

        <div className="bookmark-list-options-dropdown" onClick={toggleOptions}>
          <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
          {optionsVisible && (
            <div className="bookmark-list-dropdown-content">
              <ul>
                <li onClick={() => handleListDelete(posts?.name)}>
                  Delete this list
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <p>{posts?.storyCount} Stories</p>
      <div className="view-bookmark-posts-container">
        {posts.bookmarkedPosts?.map((post, index) => (
          <div
            className="bookmarked-blog-post"
            key={index}
            onClick={() => handlePostClick(post._id)}
          >
            <div className="bookmarked-post-details">
              <h3 className="bookmarked-post-title">{post.title}</h3>
              <p className="bookmarked-author">{post.author}</p>
              <p className="bookmarked-date">
                {format(new Date(post.createdAt), "MMM d, yyyy HH:mm")}
              </p>
            </div>
            <div className="bookmarked-cover-image">
              <img
                src={`/api/uploads/postImages/${post.coverImageURL}`}
                alt="Cover Image"
                className="bookmarked-post-cover-image"
              />
            </div>
          </div> //Post content is also present
        ))}
      </div>
    </div>
  );
}

export default BookmarkPostsView;
