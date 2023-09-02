import React, { useState } from "react";
import axios from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import FormInput from "../../Components/Form/FormInput";
import PasswordInput from "../../Components/Form/PasswordInput";
import Button from "../../Components/Button/Button";

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
    <div className="register-container">
      <form className="register" onSubmit={register}>
        <h1>Register</h1>
        {errMessage && <p className="error-register">{errMessage}</p>}

        <FormInput
          id="email"
          label="Email"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Email"
          required={true}
          // type="email"
        />

        <PasswordInput
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="register-btn">
          <Button label="Register" variant="secondary" />
        </div>
      </form>
    </div>
  );
}

export default Register;
