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
        <button className="register-mail-modal-button">Register Now</button>
        <p className="signin-up-modal-text">
          Already have an account?{" "}
          <span className="model-sign-in">Sign In</span>
        </p>
      </div>
    </div>
  );
}

export default SignInOrUpModel;