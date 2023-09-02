import React, { useContext, useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";
import FormInput from "../../Components/Form/FormInput";
import PasswordInput from "../../Components/Form/PasswordInput";
import Button from "../../Components/Button/Button";

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
    <div className="login-container">
      <form className="login" onSubmit={login}>
        <h1>Login</h1>
        {errMessage && <p className="error-login">{errMessage}</p>}

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
        <div className="login-btn">
          <Button label="Login" variant="secondary" />
        </div>
      </form>
    </div>
  );
}

export default Login;
