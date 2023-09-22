import "./Button.css";

function Button({ size, onClick, label, width }) {
  const buttonStyles = {
    padding:
      size === "small"
        ? "4px 8px"
        : size === "large"
        ? "10px 24px"
        : "8px 16px",
    color: "#fff",
    width: width ? width : "70px",
  };

  return (
    <button style={buttonStyles} className="button-style" onClick={onClick}>
      {label}
    </button>
  );
}

export default Button;
