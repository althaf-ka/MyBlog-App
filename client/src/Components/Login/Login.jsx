import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const navigate = useNavigate();

  const login = async event => {
    event.preventDefault();
    axios.defaults.withCredentials = true;
    try {
      const response = await axios.post("/login", { username, password });
      //checking use and password also sending jwt token
      if (response.data === "ok") {
        navigate("/");
      } else {
        console.log(response.data);
        setErrMessage(response.data);
      }
    } catch (err) {
      console.log(err);
      setErrMessage("Error occurred during login");
    }
  };
  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      {errMessage && <p className="error">{errMessage}</p>}
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
