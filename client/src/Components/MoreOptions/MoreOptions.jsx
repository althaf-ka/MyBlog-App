import React, { useState } from "react";
import "./MoreOptions.css";
import { ThreeDotsIcon } from "../../assets";

const MoreOptions = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="more-options">
      <div className="three-dots-icon" onClick={toggleOptions}>
        <ThreeDotsIcon />
      </div>
      {isOpen && (
        <div className="options-container">
          <ul>
            <li>TEst</li>
            <li>testt</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MoreOptions;
