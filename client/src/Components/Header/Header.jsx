import React, { useContext, useEffect, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";
import RoundProfilePicture from "../RoundProfilePicture/RoundProfilePicture";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import { HamburgerMenuIcon } from "../../assets";
import HamburgerMenu from "../HamburgerMenu/HamburgerMenu";
import useClickOutside from "../../Hooks/useClickOutside";

function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(prevState => !prevState);
  };

  useEffect(() => {
    axios
      .get("/users/profile", { withCredentials: true })
      .then(response => {
        setUserInfo(response.data);
      })
      .catch(err => {
        console.log(err.message, "User Not Logged In");
        setUserInfo(null);
      });
  }, [userInfo?._id]);

  const handleHamburgerClick = () => {
    setIsHamburgerMenuOpen(prevState => !prevState);
  };

  const dropdownNode = useClickOutside(() => {
    setIsDropdownOpen(false);
  });

  const logout = () => {
    axios.defaults.withCredentials = true;
    axios.post("/users/logout").then(response => {
      console.log(response.data.message);
      setUserInfo(null);
      window.location.reload();
    });
  };

  const handleOptionClick = index => {
    if (index === 3) {
      logout();
    }

    setIsDropdownOpen(false);
  };

  const options = [
    { name: userInfo?.name, path: `/profile/${userInfo?._id}` },
    { name: "Create Post", path: "/create" },
    { name: "Bookmark", path: "/bookmarks/lists" },
    { name: "Log Out", path: false },
  ];

  const username = userInfo?.username;

  return (
    <>
      <header id="main-header">
        <div className="header-container">
          <span className="hamburger-btn">
            <button onClick={handleHamburgerClick}>
              <HamburgerMenuIcon />
            </button>
          </span>

          <Link to="/" className="logo">
            MyBlog
          </Link>
          <nav>
            {username && (
              <>
                <Link to="/create">
                  <button className="header-main-btn create-header-btn">
                    Create Post
                  </button>
                </Link>

                <div className="dropdown" ref={dropdownNode}>
                  <div
                    className="dropdown-toggle"
                    onClick={handleDropdownToggle}
                  >
                    <RoundProfilePicture
                      size={"42px"}
                      imageUrl={`/api/uploads/profilePicture/${userInfo?.profileImageURL}`}
                    />
                  </div>
                  {isDropdownOpen && (
                    <DropdownMenu
                      options={options}
                      onItemClick={handleOptionClick}
                    />
                  )}
                </div>
              </>
            )}

            {!username && (
              <>
                <Link to="/login">
                  <button className="header-login-btn">Login</button>
                </Link>
                <Link to="/register">
                  <button className="header-main-btn">Create Account</button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {isHamburgerMenuOpen && (
        <HamburgerMenu setIsHamburgerMenuOpen={setIsHamburgerMenuOpen} />
      )}
    </>
  );
}

export default Header;
