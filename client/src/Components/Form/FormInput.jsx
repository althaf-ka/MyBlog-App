import "./styles.css";

function FormInput(props) {
  const {
    label,
    id,
    value,
    onChange,
    maxLength,
    moreInfo,
    required,
    type = "text",
    placeholder = "",
  } = props;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="input-box-label">
          {label}{" "}
          {moreInfo && (
            <span className="input-box-label-more-info">({moreInfo}) </span>
          )}
        </label>
      )}

      <div className="input-container">
        <input
          {...(required && { required })}
          type={type}
          id={id}
          value={value}
          className="input-box"
          placeholder={placeholder}
          onChange={onChange}
          {...(maxLength && { maxLength })}
          {...(!onChange && { disabled: true })}
        />
        {maxLength && (
          <div className="char-count">
            {value?.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}

export default FormInput;
