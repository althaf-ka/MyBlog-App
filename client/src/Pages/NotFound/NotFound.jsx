import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="notfound-container">
      <h1>An error as occured.</h1>
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
