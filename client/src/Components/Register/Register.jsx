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
      .post("/users/register", {
        username,
        password,
      })
      .then(response => {
        console.log(response);
        alert("Successfully Signed Up");
        navigate("/login");
      })
      .catch(err => {
        console.log(err, "err");
        if (err.response) setErrMessage(err.response.data);
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
