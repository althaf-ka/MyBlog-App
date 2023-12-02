import { useContext, useEffect, useState } from "react";
import "./BookmarkView.css";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";
import TailSpinLoader from "../../Components/Loaders/TailSpinLoader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function BookmarkView() {
  const { userInfo } = useContext(UserContext);
  const [bookmarkLists, setBookmarkLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchBookmarkNames = async () => {
      try {
        const bookmarkResponse = await axios.get(
          `bookmarks/lists/names/${userInfo._id}`,
          { signal: controller.signal, withCredentials: true }
        );

        setBookmarkLists(bookmarkResponse.data);
        setIsLoading(false);
      } catch (err) {
        if (!controller.signal.aborted) {
          toast.error(err.response.data);
        }
      }
    };

    // To prevent undefined api call till userId gets
    if (userInfo && Object.keys(userInfo).length > 0) {
      fetchBookmarkNames();
    }

    return () => {
      controller.abort();
    };
  }, [userInfo]);

  // Add a default "Reading List" if bookmarkLists is empty
  useEffect(() => {
    if (!isLoading && bookmarkLists.length === 0) {
      setBookmarkLists([
        {
          name: "Reading List",
          storyCount: 0,
          coverImageURL: [], // No image for the default Reading List
        },
      ]);
    }
  }, [isLoading, bookmarkLists]);

  const handleListClick = bookmarkName => {
    const formattedBookmark = bookmarkName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/bookmarks/list/${formattedBookmark}/${userInfo._id}`);
  };

  return (
    <div className="bookmark-list-container">
      <h2>Your library</h2>

      {isLoading ? (
        <TailSpinLoader size={60} />
      ) : (
        bookmarkLists.map((bookmark, index) => (
          <div
            className="bookmark-card-container"
            onClick={() => handleListClick(bookmark.name)}
            key={index}
          >
            <div className="bookmark-details">
              <h3>{bookmark.name}</h3>
              <p>{bookmark.storyCount} Stories</p>
            </div>

            <div className="posts-img-cards">
              {bookmark.coverImageURL.map((imgUrl, imgIndex) => (
                <div className="image-box" key={imgIndex}>
                  <img
                    src={`/api/uploads/postImages/${imgUrl}`}
                    alt="posterImg"
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default BookmarkView;
