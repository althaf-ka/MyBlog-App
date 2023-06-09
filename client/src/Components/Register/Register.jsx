import React, { useState } from "react";
import axios from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const navigate = useNavigate();

  const register = event => {
    event.preventDefault();
    axios
      .post("/register", {
        username,
        password,
      })
      .then(response => {
        if (response.data.error) setErrMessage(response.data.error.message);
        else {
          alert("Successfully Signed Up");
          navigate("/login");
        }
      });
  };

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      {errMessage && <p className="error-register">{errMessage}</p>}
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
      <button>Register</button>
    </form>
  );
}

export default Register;
