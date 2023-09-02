import "./Button.css";

function Button({ size, onClick, label }) {
  const buttonStyles = {
    padding:
      size === "small"
        ? "4px 8px"
        : size === "large"
        ? "12px 24px"
        : "8px 16px",
    color: "#fff",
  };

  return (
    <button style={buttonStyles} className="button-style" onClick={onClick}>
      {label}
    </button>
  );
}

export default Button;
