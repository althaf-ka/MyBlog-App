import React, { useState } from "react";
import axios from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import FormInput from "../../Components/Form/FormInput";
import PasswordInput from "../../Components/Form/PasswordInput";
import Button from "../../Components/Button/Button";
import GoogleAuth from "../../Components/GoogleAuth/GoogleAuth";
import { toast } from "react-toastify";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const navigate = useNavigate();

  const register = event => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    axios
      .post("/users/register", { formData })
      .then(res => {
        toast.success("Successfully Signed Up");
        navigate("/login");
      })
      .catch(err => {
        if (err.response)
          setErrMessage(err.response.data), toast.error(err.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = event => {
    const { id: name, value } = event.target;
    // Capitalize the first letter if the field is 'name'
    const updatedValue =
      name === "name" ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    setFormData(prevVal => ({
      ...prevVal,
      [name]: updatedValue,
    }));
  };

  return (
    <div className="register-container">
      <form className="register" onSubmit={register}>
        <h1>Register</h1>
        {errMessage && <p className="error-register">{errMessage}</p>}

        <FormInput
          id="name"
          label="Name"
          value={formData?.name}
          onChange={handleInputChange}
          placeholder="Name"
          required={true}
          maxLength={25}
        />

        <FormInput
          id="email"
          label="Email"
          value={formData?.email}
          onChange={handleInputChange}
          placeholder="Email"
          required={true}
          type="email"
        />

        <PasswordInput
          id="password"
          value={formData?.password}
          onChange={handleInputChange}
        />

        <div className="register-btn">
          <Button label="Register" width="100%" size={"large"} />
        </div>
      </form>

      {!loading && (
        <>
          <h3 className="or-google">OR</h3>

          <div className="google-btn-auth">
            <GoogleAuth action={"register"} setErrMessage={setErrMessage} />
          </div>
        </>
      )}
    </div>
  );
}

export default Register;
