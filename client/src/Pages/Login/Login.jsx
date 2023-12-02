import React, { useContext, useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axios";
import { UserContext } from "../../../Context/UserContext";
import FormInput from "../../Components/Form/FormInput";
import PasswordInput from "../../Components/Form/PasswordInput";
import Button from "../../Components/Button/Button";
import GoogleAuth from "../../Components/GoogleAuth/GoogleAuth";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { userInfo, setUserInfo } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo]);

  const login = async event => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const data = { email, password };

      const response = await axios.post("/users/login", data, {
        withCredentials: true,
      });
      //checking if there user and also sending jwt token to store in cookie
      if (response.data) {
        const { _id, email, name } = response.data;
        setUserInfo({ _id, email, name });
        navigate("/");
      }
    } catch (err) {
      //setting other login errors
      setErrMessage(err.response.data);
      toast.error(err.response.data);
    } finally {
      setLoading(false);
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
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required={true}
          type="email"
        />

        <PasswordInput
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="login-btn">
          <Button label="Login" width="100%" size={"large"} />
        </div>
      </form>

      {!loading && (
        <>
          <h3 className="or-google">OR</h3>

          <div className="google-btn-auth">
            <GoogleAuth
              action={"login"}
              setUserInfo={setUserInfo}
              setErrMessage={setErrMessage}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
