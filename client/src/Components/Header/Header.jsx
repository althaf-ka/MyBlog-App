import React, { useEffect, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import axios from "../../../config/axios";

function Header() {
  const [username, setUsername] = useState("");
  useEffect(() => {
    axios.get("/profile", { withCredentials: true }).then(response => {
      setUsername(response.data.username);
    });
  }, []);

  const logout = () => {
    axios.defaults.withCredentials = true;
    axios.post("/logout").then(response => {
      console.log(response);
      setUsername(null);
    });
  };

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
