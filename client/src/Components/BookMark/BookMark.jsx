import "./BookMark.css";
import BookMarkIcon from "../../assets/BookMarkIcon";
import { useEffect, useState } from "react";
import axios from "../../../config/axios";
import RoatingLinesLoader from "../RoatingLinesLoader/RoatingLinesLoader";
import TailSpinLoader from "../TailSpinLoader/TailSpinLoader";
import SignInOrUpModel from "../SignInOrUpModel/SignInOrUpModel";

function BookMark({ currentUserId, postId, isBookmarked }) {
  const [bookmarkToggle, setBookmarkToggle] = useState({
    iconClicked: false,
    showModel: false,
  });
  const [bookmarkName, setBookmarkName] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [bookmarkDetailsFetched, setBookmarkDetailsFetched] = useState(false);

  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest(".bookmark-container")) {
        setBookmarkToggle(prevState => ({ ...prevState, showModel: false }));
      }
    };
    if (bookmarkToggle.showModel) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [bookmarkToggle.showModel]);

  if (isBookmarked && !bookmarkToggle.iconClicked) {
    setBookmarkToggle(prevState => ({ ...prevState, iconClicked: true }));
  }

  const storeBookmarkToDb = async (listName, postId) => {
    try {
      let bookmarkPayload = { name: listName, postId };
      const response = await axios.post(
        `/bookmarks/save/${currentUserId}`,
        bookmarkPayload,
        { withCredentials: true }
      );

      if (response.data.status === 200) return true;
      else return false;
    } catch (err) {
      console.log(err);
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
      console.log(err);
      return false;
    }
  };

  const getCurrentUserBookmarkDetails = async () => {
    try {
      let userBookmarkDetails = await axios.get(
        `/bookmarks/details/${currentUserId}/${postId}`,
        { withCredentials: true }
      );

      let prevBookmarks = userBookmarkDetails.data;
      if (prevBookmarks.length === 0) {
        setBookmarks([{ name: "Reading List", checked: false }]);
      } else {
        setBookmarks(prevBookmarks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBookMarkClick = async () => {
    if (!currentUserId) {
      setShowLoginRequired(true);
      return;
    }

    if (!bookmarkDetailsFetched) {
      getCurrentUserBookmarkDetails();
      setBookmarkDetailsFetched(true);
    }

    const isAnyBookmarkChecked = bookmarks.some(bookmark => bookmark.checked);

    if (isAnyBookmarkChecked) {
      setBookmarkToggle(prevState => ({
        showModel: !prevState.showModel,
        iconClicked: true,
      }));
    } else {
      //If no bookmark is checked then auto check Reading List
      setBookmarkToggle(prevState => ({
        iconClicked: !prevState.iconClicked,
        showModel: !prevState.showModel,
      }));
      setBookmarks(prevBookmarks => {
        return prevBookmarks.map(bookmark => {
          if (bookmark.name === "Reading List") {
            return { ...bookmark, checked: false };
          }
          return bookmark;
        });
      });
      try {
        const readingListIndex = 0; // Index of "Reading List" bookmark
        setLoadingIndex(readingListIndex);

        const result = await storeBookmarkToDb("Reading List", postId);
        result
          ? updateBookmarkState(readingListIndex, true)
          : updateBookmarkState(readingListIndex, false);

        setLoadingIndex(null);
      } catch (err) {
        console.log(err);
        setLoadingIndex(null);
        updateBookmarkState(0, false);
      }
    }
  };

  const handleBookmarkNameChange = e => {
    setBookmarkName(e.target.value);
  };

  const handleAddBookmark = () => {
    const trimBookmarkName = bookmarkName.trim();
    if (bookmarkName) {
      const isBookmarkNameExists = bookmarks.some(
        bookmark => bookmark.name === trimBookmarkName
      );
      if (isBookmarkNameExists) {
        alert("Bookmark name already exists");
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
      setBookmarkToggle({ iconClicked: false, showModel: false });
    }
  };

  const handleToggleBookmark = async (index, e) => {
    const { name } = bookmarks[index];
    const toggleChecked = e.target.checked;
    setLoadingIndex(index);

    try {
      let result;
      if (toggleChecked) {
        result = await storeBookmarkToDb(name, postId);
      } else {
        result = await removeBookmarkFromDb(name, postId);
      }

      if (result) {
        setLoadingIndex(null);
        updateBookmarkState(index, toggleChecked);
      } else {
        setLoadingIndex(null);
        updateBookmarkState(index, !toggleChecked); //If db fails maintain same checkbox value
      }
    } catch (err) {
      console.log(err);
      setLoadingIndex(null);
      updateBookmarkState(index, !toggleChecked);
    }
  };

  return (
    <>
      <div className="bookmark-container">
        <div className="bookmark-icon" onClick={handleBookMarkClick}>
          <BookMarkIcon isClicked={bookmarkToggle.iconClicked} />
        </div>
        {bookmarkToggle.showModel && (
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
