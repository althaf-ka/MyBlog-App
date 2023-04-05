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
            <Link to="">Create new Post</Link>
            <Link onClick={logout}>Logout</Link>
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
