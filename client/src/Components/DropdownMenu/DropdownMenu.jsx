import { Link } from "react-router-dom";
import "./DropdownMenu.css";

function DropdownMenu({ options, onItemClick }) {
  return (
    <ul className="dropdown-content">
      {options.map((option, index) =>
        option.path ? (
          <Link to={option.path} key={index}>
            <li
              className="dropdown-item"
              onClick={() => onItemClick(index, option.path)}
            >
              {option.name}
            </li>
          </Link>
        ) : (
          <li
            key={index}
            className="dropdown-item no-link-item"
            onClick={() => onItemClick(index, option.path)}
          >
            {option.name}
          </li>
        )
      )}
    </ul>
  );
}

export default DropdownMenu;
