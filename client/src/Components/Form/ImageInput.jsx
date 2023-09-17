import "./styles.css";

function ImageInput({ label, id, moreInfo, onChange, required = false }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="image-input-label">
        {label}{" "}
        {moreInfo && (
          <span className="input-box-label-more-info">({moreInfo}) </span>
        )}
      </label>
      <input
        type="file"
        id={id}
        className="image-input-box"
        accept="image/*"
        onChange={onChange}
        {...(required && { required: true })}
      />
    </div>
  );
}

export default ImageInput;
