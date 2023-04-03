import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const navigate = useNavigate();

  const login = event => {
    event.preventDefault();
    axios.post("/login", { username, password }).then(response => {
      //Checking if response is "ok" when JWT is created
      if (response.data === "ok") {
        navigate("/");
      } else {
        //setting Error
        console.log(response.data);
        setErrMessage(response.data);
      }
    });
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
