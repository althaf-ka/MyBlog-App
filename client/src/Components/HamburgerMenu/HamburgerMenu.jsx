import "./HamburgerMenu.css";
import Sidebar from "../Sidebar/Sidebar";
import { ExitIcon } from "../../assets";
import useClickOutside from "../../Hooks/useClickOutside";

function HamburgerMenu({ setIsHamburgerMenuOpen }) {
  const handleClose = () => {
    setIsHamburgerMenuOpen(false);
  };

  let hamburgerNode = useClickOutside(() => {
    setIsHamburgerMenuOpen(false);
  });

  const onMenuClick = () => {
    setIsHamburgerMenuOpen(false);
  };

  return (
    <div className="hamburger">
      <div className="hamburger-content" ref={hamburgerNode}>
        <header className="hamburger-header">
          <h2>My Blog</h2>
          <button onClick={handleClose}>
            <ExitIcon />
          </button>
        </header>

        <div className="hamburger-menu">
          <Sidebar handleClick={onMenuClick} />
        </div>
      </div>

      <div className="hamburger-overlay"></div>
    </div>
  );
}

export default HamburgerMenu;
