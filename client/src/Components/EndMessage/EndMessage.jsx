import React from "react";
import "./EndMessage.css";

const EndMessage = ({ info }) => {
  return (
    <div className="end-message-container">
      <h2 className="end-message-header">That's all for now!</h2>
      {info && (
        <p className="end-message-text">
          Thanks for reading. Check back soon for more updates.
        </p>
      )}
    </div>
  );
};

export default EndMessage;
