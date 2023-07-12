import { useEffect, useState } from "react";
import "./BlogOptions.css";

function BlogOptions({ onCancelClaps, isUserClapped }) {
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (menuVisible) {
      window.addEventListener("click", handleClickOutside);
    } else {
      window.removeEventListener("click", handleClickOutside);
    }
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [menuVisible]);

  const showMenuOfBlog = () => {
    setMenuVisible(!menuVisible);
  };

  const handleClickOutside = event => {
    if (!event.target.closest(".more-action-btn-container")) {
      setMenuVisible(false);
    }
  };

  const handleCancelClaps = () => {
    onCancelClaps();
    setMenuVisible(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      console.log("Text copied to clipboard successfully!");
      setMenuVisible(false);
    } catch (error) {
      console.log("Failed to copy text to clipboard:", error);
    }
  };

  return (
    <div className="more-action-btn-container">
      <div className="more-action-btn">
        <button className="three-dot-btn" onClick={showMenuOfBlog}>
          <i
            className="fa fa-ellipsis-h blog-options-btn"
            aria-hidden="true"
          ></i>
        </button>
      </div>

      {menuVisible && (
        <div className="blog-options-dropdown-menu">
          {isUserClapped && (
            <span onClick={handleCancelClaps}>
              <i className="fa fa-undo" aria-hidden="true"></i>
              Cancel Previous Applause
            </span>
          )}
          <span onClick={copyToClipboard}>
            <i className="fa fa-clipboard" aria-hidden="true"></i>
            Copy Link To Clipboard
          </span>
        </div>
      )}
    </div>
  );
}

export default BlogOptions;
