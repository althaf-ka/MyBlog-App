import { useEffect, useState } from "react";
import "./BlogOptions.css";
import { ThreeDotsIcon } from "../../assets";
import useClickOutside from "../../Hooks/useClickOutside";
import { toast } from "react-toastify";

function BlogOptions({ onCancelClaps, isUserClapped }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const dropDownNode = useClickOutside(() => {
    setMenuVisible(false);
  });

  const showMenuOfBlog = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCancelClaps = () => {
    onCancelClaps();
    setMenuVisible(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard successfully!");

      setMenuVisible(false);
    } catch (error) {
      toast.error("Failed to copy Link to clipboard");
    }
  };

  return (
    <div className="more-action-btn-container" ref={dropDownNode}>
      <div className="more-action-btn">
        <button className="three-dot-btn" onClick={showMenuOfBlog}>
          <ThreeDotsIcon size={28} />
        </button>
      </div>
      {menuVisible && (
        <ul className="blog-options-dropdown-menu">
          <li onClick={copyToClipboard}>Copy Link To Clipboard</li>
          {isUserClapped && (
            <li onClick={handleCancelClaps} className="cancel-red">
              Cancel Previous Applause
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default BlogOptions;
