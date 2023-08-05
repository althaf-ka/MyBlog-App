import React, { useContext, useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const { userInfo, setUserInfo } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo]);

  const login = async event => {
    event.preventDefault();
    axios.defaults.withCredentials = true;
    try {
      const response = await axios.post("/users/login", { username, password });
      //checking if there user and also sending jwt token to store in cookie
      if (response.data.username) {
        const { _id, username, name } = response.data;
        setUserInfo({ _id, username, name });
        navigate("/");
      }
    } catch (err) {
      //setting other login errors
      setErrMessage(err.response.data);
    }
  };
  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      {errMessage && <p className="error-login">{errMessage}</p>}
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        name=""
        placeholder="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button>Login</button>
    </form>
  );
}

export default Login;
