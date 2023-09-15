import { Link } from "react-router-dom";
import "./Sidebar.css";
import { useContext } from "react";
import { UserContext } from "../../../Context/UserContext";
import {
  BookmarkSideIcon,
  HomeIcon,
  PrivacyPolicyIcon,
  ProfileIcon,
  ReadingListIcon,
  TopicIcon,
  TwitterIcon,
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  TelegramIcon,
  CreatePostIcon,
} from "../../assets";
import Button from "../Button/Button";

function Sidebar({ handleClick }) {
  const { userInfo } = useContext(UserContext);

  return (
    <div className="sidebar-layout-container">
      <aside className="sidebar-layout">
        {!userInfo?._id && (
          <div className="welcome-container">
            <h3>Welcome to My Blog App!</h3>
            <p>Share your thoughts, ideas, and experiences with the world.</p>
            <Link to={"/login"}>
              <Button label={"Login"} onClick={handleClick} />
            </Link>
          </div>
        )}

        <nav onClick={handleClick}>
          <ul>
            <li>
              <Link className="nav-link" to="/">
                <HomeIcon />
                Home
              </Link>
            </li>
            {userInfo && (
              <li>
                <Link className="nav-link" to="/create">
                  <CreatePostIcon />
                  Create Blog
                </Link>
              </li>
            )}
            <li>
              <Link className="nav-link" to="/explore-topics">
                <TopicIcon />
                Topics
              </Link>
            </li>
            {userInfo && (
              <li>
                <Link className="nav-link" to={`/profile/${userInfo?._id}`}>
                  <ProfileIcon />
                  Profile
                </Link>
              </li>
            )}
            {userInfo && (
              <li>
                <Link
                  className="nav-link"
                  to={`/bookmarks/list/reading-list/${userInfo?._id}`}
                >
                  <ReadingListIcon />
                  Reading List
                </Link>
              </li>
            )}
            {userInfo && (
              <li>
                <Link className="nav-link" to={"/bookmarks/lists"}>
                  <BookmarkSideIcon />
                  Bookmarks
                </Link>
              </li>
            )}
            <li>
              <Link className="nav-link" to="/">
                <PrivacyPolicyIcon />
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-social-container">
          <h2 className="sidebar-title">Socials</h2>
          <div className="sidebar-social" onClick={handleClick}>
            <Link to="https://twitter.com/the_althaf" target="_blank">
              <TwitterIcon />
            </Link>

            <Link to="https://github.com/althaf-ka/MyBlog-App" target="_blank">
              <GithubIcon />
            </Link>

            <Link
              to="https://www.linkedin.com/in/althaf-k-a-073222270"
              target="_blank"
            >
              <LinkedinIcon />
            </Link>

            <Link to="https://www.instagram.com/" target="_blank">
              <InstagramIcon />
            </Link>

            <Link to="https://web.telegram.org/" target="_blank">
              <TelegramIcon />
            </Link>
          </div>
        </div>

        <footer className="sidebar-footer">
          <p>
            <span>MyBlog</span> - A platform for sharing thoughts and ideas.
            Built with
            <br /> love using Node.js and React.
          </p>

          <p>MyBlog &copy; {new Date().getFullYear()} </p>
        </footer>
      </aside>
    </div>
  );
}

export default Sidebar;
