import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound({ message = "An error has occurred." }) {
  return (
    <div className="notfound-container">
      <h1>{message}</h1>
      <h1>
        <span className="ascii"> (╯°□°）╯︵ ┻━┻</span>
      </h1>
      <div>
        <Link to={"/"}>Go Home</Link>
      </div>
    </div>
  );
}

export default NotFound;
