import { Link } from "react-router-dom";
import "./SignInOrUpModel.css";

function SignInOrUpModel({ message, isVisible }) {
  const closeModel = () => {
    isVisible(false);
  };
  return (
    <div className="signin-up-modal-container">
      <div className="signin-up-modal-content">
        <div className="signin-up-modal-close-btn" onClick={closeModel}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </div>
        <h3 className="signin-up-modal-title">
          Create an account to {message}.
        </h3>
        <Link to={"/register"}>
          <button className="register-mail-modal-button">Register Now</button>
        </Link>
        <p className="signin-up-modal-text">
          Already have an account?{" "}
          <Link to={"/login"}>
            <span className="model-sign-in">Sign In</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignInOrUpModel;
