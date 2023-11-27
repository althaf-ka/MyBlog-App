import { useContext, useEffect, useState } from "react";
import "./BookmarkPostsView.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";
import Post from "../../Components/Post/Post";
import { ThreeDotsIcon } from "../../assets";
import DropdownMenu from "../../Components/DropdownMenu/DropdownMenu";
import useClickOutside from "../../Hooks/useClickOutside";
import TailSpinLoader from "../../Components/Loaders/TailSpinLoader";
import { toast } from "react-toastify";

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
          { signal: controller.signal, withCredentials: true }
        );

        setPosts(bookmarkResponse.data);
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error(error.response.data);
        }
      }
    };
    fetchBookmarkPosts();

    return () => {
      controller.abort();
    };
  }, []);

  let dropdownNode = useClickOutside(() => {
    setOptionsVisible(false);
  });

  const toggleOptions = () => {
    setOptionsVisible(prevState => !prevState);
  };

  if (posts.length === 0) {
    return <TailSpinLoader size={60} />;
  }

  const options = [{ name: "Delete this List", path: false }];
  const isReadingList = posts?.name === "Reading List";

  const handleItemClick = async index => {
    if (index === 0) {
      const shouldDelete = window.confirm(
        "Are you sure you want to delete this list?"
      );

      if (shouldDelete && posts?.name && !isReadingList) {
        try {
          const data = { name: posts.name };
          const deleteResponse = await axios.put(
            `bookmarks/list/delete/${userInfo._id}`,
            data,
            { withCredentials: true }
          );

          if (deleteResponse?.status === 200) {
            navigate(-1);
          }
        } catch (err) {
          toast.error(err.response?.data);
        }
      }
    }
  };

  return (
    <div className="bookmark-posts-view-container">
      <div className="view-bookmark-posts-header">
        <h2>{posts?.name}</h2>

        {!isReadingList && (
          <div
            className="bookmark-list-options-dropdown"
            ref={dropdownNode}
            onClick={toggleOptions}
          >
            <ThreeDotsIcon size={30} />
            {optionsVisible && (
              <DropdownMenu options={options} onItemClick={handleItemClick} />
            )}
          </div>
        )}
      </div>
      <p>{posts?.storyCount} Stories</p>
      <div className="view-bookmark-posts-container">
        {posts.bookmarkedPosts?.map((post, index) => (
          <Post
            key={index}
            {...post}
            isBookmarked={true}
            currentUserId={userInfo?._id}
          />
        ))}
      </div>
    </div>
  );
}

export default BookmarkPostsView;
