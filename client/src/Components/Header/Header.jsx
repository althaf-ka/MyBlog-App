import React, { useContext, useEffect, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";

function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  useEffect(() => {
    axios
      .get("/profile", { withCredentials: true })
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
    axios.post("/logout").then(response => {
      console.log(response.data.message);
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
                <i className="fa fa-file-text" aria-hidden="true"></i>New Post
              </Link>
            </div>
            <div className="dropdown">
              <button className="dropbtn">
                {username}
                <i className="fa fa-angle-double-down" aria-hidden="true"></i>
              </button>
              <div className="dropdown-content">
                <a href="#">
                  <i className="fa fa-user" aria-hidden="true"></i>
                  Profile
                </a>
                <Link to="/create" className="new-post-link">
                  <i className="fa fa-file-text" aria-hidden="true"></i>New Post
                </Link>
                <a href="#">Link 2</a>
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
