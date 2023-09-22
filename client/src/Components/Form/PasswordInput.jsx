import React, { useState } from "react";
import "./styles.css";
import { EyeIcon } from "../../assets";

function PasswordInput({ id, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-group">
      <label className="input-box-label">Password</label>
      <div className="input-container pass-wrap">
        <input
          onChange={onChange}
          type={showPassword ? "text" : "password"}
          className="input-box"
          id={id}
          placeholder="Enter Password"
          required
          value={value}
        />
        <span className="password-toggle" onClick={togglePasswordVisibility}>
          <EyeIcon closed={showPassword} />
        </span>
      </div>
    </div>
  );
}

export default PasswordInput;
