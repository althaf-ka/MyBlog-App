import React, { useContext, useEffect, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";

function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  useEffect(() => {
    axios.get("/profile", { withCredentials: true }).then(response => {
      setUserInfo(response.data);
    });
  }, []);

  const logout = () => {
    axios.defaults.withCredentials = true;
    axios.post("/logout").then(response => {
      console.log(response);
      setUserInfo(null);
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
              <Link to="/create" className="new-post-link">
                <i class="fa fa-file-text" aria-hidden="true"></i>New Post
              </Link>
            </div>
            <div class="dropdown">
              <button class="dropbtn">
                {username}
                <i class="fa fa-angle-double-down" aria-hidden="true"></i>
              </button>
              <div class="dropdown-content">
                <a href="#">
                  <i class="fa fa-user" aria-hidden="true"></i>
                  Profile
                </a>
                <Link to="/create" className="new-post-link">
                  <i class="fa fa-file-text" aria-hidden="true"></i>New Post
                </Link>
                <a href="#">Link 2</a>
                <Link onClick={logout}>
                  <i class="fa fa-sign-out" aria-hidden="true"></i>
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
