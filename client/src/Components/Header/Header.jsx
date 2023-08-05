import React, { useContext, useEffect } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";

function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);

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
  }, []);

  const logout = () => {
    axios.defaults.withCredentials = true;
    axios.post("/users/logout").then(response => {
      console.log(response.data.message);
      setUserInfo(null);
      window.location.reload();
    });
  };

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        MyBlog
      </Link>
      <nav>
        {username && (
          <>
            <div className="tools">
              <Link to="/create" className="new-post-link main-new-post-link">
                <i className="fa fa-file-text" aria-hidden="true"></i>New Post
              </Link>
            </div>
            <div className="dropdown">
              <button className="dropbtn">
                {userInfo?.name}
                <i className="fa fa-angle-double-down" aria-hidden="true"></i>
              </button>
              <div className="dropdown-content">
                <Link to="/create" className="new-post-link">
                  <i className="fa fa-file-text" aria-hidden="true"></i>New Post
                </Link>
                <Link to={`/profile/${userInfo?._id}`}>
                  <i className="fa fa-user" aria-hidden="true"></i>
                  Profile
                </Link>
                <Link to="/explore-topics">
                  <i className="fa fa-hashtag" aria-hidden="true"></i>Topics
                </Link>
                <Link to="/bookmarks/lists">
                  <i className="fa fa-bookmark" aria-hidden="true"></i>Library
                </Link>
                <Link onClick={logout}>
                  <i className="fa fa-sign-out" aria-hidden="true"></i>
                  Logout
                </Link>
              </div>
            </div>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
