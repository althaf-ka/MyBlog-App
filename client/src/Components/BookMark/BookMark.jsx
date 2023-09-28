import "./BookMark.css";
import { BookmarkIcon } from "../../assets";
import { useContext, useEffect, useState } from "react";
import axios from "../../../config/axios";
import RoatingLinesLoader from "../Loaders/RoatingLinesLoader";
import TailSpinLoader from "../Loaders/TailSpinLoader";
import SignInOrUpModel from "../SignInOrUpModel/SignInOrUpModel";
import useClickOutside from "../../Hooks/useClickOutside";
import { toast } from "react-toastify";
import { PostContext } from "../../../Context/PostContext";

function BookMark({ currentUserId, postId, isBookmarked }) {
  const [iconClicked, setIconClicked] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [bookmarkName, setBookmarkName] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [bookmarkDetailsFetched, setBookmarkDetailsFetched] = useState(false);
  const { toggleBookmarkIcon } = useContext(PostContext);
  let isRequestPending = false;

  useEffect(() => {
    setIconClicked(isBookmarked);
  }, [isBookmarked]);

  const bookmarkNode = useClickOutside(() => {
    setShowModel(false);
  });

  const storeBookmarkToDb = async (listName, postId) => {
    try {
      let bookmarkPayload = { name: listName, postId };
      const response = await axios.post(
        `/bookmarks/save/${currentUserId}`,
        bookmarkPayload,
        { withCredentials: true }
      );

      if (response.data.status === 200) {
        toggleBookmarkIcon(postId, true);
        return true;
      } else return false;
    } catch (err) {
      toast.error(err.response?.data);
      return false;
    }
  };

  const removeBookmarkFromDb = async (listName, postId) => {
    try {
      let removeDetails = { name: listName, postId };
      const response = await axios.put(
        `/bookmarks/delete/${currentUserId}`,
        removeDetails,
        { withCredentials: true }
      );

      if (response.data.status === 200) return true;
      else return false;
    } catch (err) {
      toast.error(err.response?.data);
      return false;
    }
  };

  const getCurrentUserBookmarkDetails = async () => {
    if (isRequestPending) {
      return;
    }
    isRequestPending = true;

    try {
      let userBookmarkDetails = await axios.get(
        `/bookmarks/details/${currentUserId}/${postId}`,
        { withCredentials: true }
      );

      let prevBookmarks = userBookmarkDetails.data;
      let response;

      if (prevBookmarks.length === 0) {
        prevBookmarks = [{ name: "Reading List", checked: false }];
        response = await addReadingListToDb();
      } else if (prevBookmarks.every(bookmark => !bookmark.checked)) {
        response = await addReadingListToDb(); // If no bookmark is checked
      }

      if (response) {
        const readingListIndex = prevBookmarks.findIndex(
          bookmark => bookmark.name === "Reading List"
        );
        if (readingListIndex !== -1) {
          prevBookmarks[readingListIndex].checked = true;
        }
        setIconClicked(true);
      }

      setBookmarks(prevBookmarks);
    } catch (error) {
      toast.error(error.response?.data);
      await getCurrentUserBookmarkDetails(); //Retry req
    } finally {
      isRequestPending = false;
    }
  };

  const addReadingListToDb = async () => {
    setLoadingIndex(0);
    try {
      const result = await storeBookmarkToDb("Reading List", postId);
      setLoadingIndex(false);

      return result;
    } catch (err) {
      toast.error(err.response?.data);
      setLoadingIndex(false);
      return false;
    }
  };

  const handleBookMarkClick = async () => {
    if (!currentUserId) {
      setShowLoginRequired(true);
      return;
    }

    setShowModel(prevState => !prevState);

    if (!bookmarkDetailsFetched) {
      await getCurrentUserBookmarkDetails();
      setBookmarkDetailsFetched(true);
    }
  };

  const handleBookmarkNameChange = e => {
    const inputText = e.target.value;
    const specialCharRegex = /^[a-zA-Z0-9\s-]*$/;

    if (specialCharRegex.test(inputText)) {
      setBookmarkName(inputText);
    } else {
      toast.warning("Special characters other than hyphens are not allowed.");
    }
  };

  const handleAddBookmark = () => {
    const trimBookmarkName = bookmarkName.trim();
    if (bookmarkName) {
      const isBookmarkNameExists = bookmarks.some(
        bookmark => bookmark.name === trimBookmarkName
      );
      if (isBookmarkNameExists) {
        toast.warning("Bookmark name already exists");
        return;
      }

      const newBookmark = { name: trimBookmarkName, checked: false };
      setBookmarks(prevBookmarks => [...prevBookmarks, newBookmark]);
      setBookmarkName("");
    }
  };

  const updateBookmarkState = (index, checked) => {
    setBookmarks(prevBookmarks => {
      const updatedBookmarks = prevBookmarks.map((bookmark, i) => {
        if (i === index) {
          bookmark.checked = checked;
        }
        return bookmark;
      });
      isAllBookmarkUnchecked(updatedBookmarks);
      return updatedBookmarks;
    });
  };

  const isAllBookmarkUnchecked = bookmarks => {
    const areAllCheckedFalse = bookmarks.every(bookmark => !bookmark.checked);
    if (areAllCheckedFalse) {
      setIconClicked(false);
      setShowModel(false);
      toggleBookmarkIcon(postId, false);
    }
  };

  const handleToggleBookmark = async (index, e) => {
    const { name } = bookmarks[index];
    const toggleChecked = e.target.checked;
    setIconClicked(true);

    setLoadingIndex(index);

    try {
      const result = toggleChecked
        ? await storeBookmarkToDb(name, postId)
        : await removeBookmarkFromDb(name, postId);

      setLoadingIndex(null);
      updateBookmarkState(index, result ? toggleChecked : !toggleChecked);
    } catch (err) {
      toast.error(err.response?.data);
      setLoadingIndex(null);
      updateBookmarkState(index, !toggleChecked);
    }
  };

  return (
    <>
      <div className="bookmark-container" ref={bookmarkNode}>
        <div className="bookmark-icon" onClick={handleBookMarkClick}>
          <BookmarkIcon isClicked={iconClicked} size={28} />
        </div>
        {showModel && (
          <div className="bookmark-options-dropdown">
            <div className="scrollable-bookmark-container">
              {bookmarks.length === 0 && (
                <TailSpinLoader size={40} wrapperClass={"bookmark-loading"} />
              )}
              <ul>
                {bookmarks.map((bookmark, index) => (
                  <li key={index}>
                    {index === loadingIndex ? (
                      <RoatingLinesLoader />
                    ) : (
                      <input
                        className="bookmark-checkbox"
                        type="checkbox"
                        checked={bookmark.checked}
                        onChange={e => handleToggleBookmark(index, e)}
                      />
                    )}
                    {bookmark.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bookmark-name-input-container">
              <input
                className="input-bookmark"
                type="text"
                value={bookmarkName}
                onChange={handleBookmarkNameChange}
                placeholder="Create a New List"
              />
              <button className="bookmark-add-btn" onClick={handleAddBookmark}>
                <i className="fa fa-plus" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {showLoginRequired && (
        <SignInOrUpModel
          message={"bookmark this story"}
          isVisible={setShowLoginRequired}
        />
      )}
    </>
  );
}

export default BookMark;
