import "./ViewSinglePost.css";
import { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import { format } from "date-fns";
import { UserContext } from "../../../Context/UserContext";
import ClapButton from "../ClapButton/ClapButton";
import BlogOptions from "../BlogOptions/BlogOptions";

function ViewSinglePost() {
  const { id } = useParams();
  const [postInfo, setPostInfo] = useState(null);
  const [isUserClapped, setIsUserClapped] = useState(false);
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const clapButtonRef = useRef(null);

  useEffect(() => {
    axios.get(`/post/${id}`).then(response => {
      setPostInfo(response.data);
    });
  }, []);

  if (!postInfo) return "";

  const handleAuthorClick = () => {
    navigate(`/profile/${postInfo.userId}`);
  };

  const handleCancelAllClaps = () => {
    // function lifted from ClapButton
    if (clapButtonRef.current) {
      clapButtonRef.current.cancelAllPreviousClaps();
    }
  };

  return (
    <>
      <div className="post-page">
        <h1>{postInfo.title}</h1>
        <time>{format(new Date(postInfo.createdAt), "MMM d, yyyy HH:mm")}</time>
        <div className="author">{postInfo.author}</div>
        <div className="image">
          <img
            src={`http://localhost:4000/uploads/postImages/${postInfo.coverImageURL}`}
            alt="PosterImg"
          />
        </div>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: postInfo.content }}
        ></div>
        <div className="topics-btn-container">
          {postInfo?.topics?.map((topic, index) => {
            const topicQuery = topic.title.replace(/\s+/g, "-").toLowerCase();
            return (
              <Link
                to={`/topics/${topicQuery}/${topic._id}`}
                key={index}
                className="topic-pill-btn-singlepost"
              >
                {topic.title}
              </Link>
            );
          })}
        </div>

        {postInfo?.updatedAt && (
          <div className="updatedInfo">
            <p>Updated </p>
            <time>
              {format(new Date(postInfo.updatedAt), "MMM d, yyyy HH:mm")}
            </time>
          </div>
        )}

        <div className="blog-author" onClick={handleAuthorClick}>
          <div className="author-image">
            <img
              src={`http://localhost:4000/uploads/profilePicture/${postInfo?.profileImageURL}`}
              alt="Author"
            />
          </div>
          <div className="author-name">Written by {postInfo.author}</div>
        </div>

        {userInfo && userInfo._id === postInfo.userId && (
          <div className="edit-row">
            <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              Edit Post
            </Link>
          </div>
        )}
        <div className="main-blog-options-container">
          <ClapButton
            ref={clapButtonRef}
            currentUserId={userInfo?._id}
            postId={id}
            authorId={postInfo?.userId}
            setIsUserClapped={setIsUserClapped}
          />
          <BlogOptions
            onCancelClaps={handleCancelAllClaps}
            isUserClapped={isUserClapped}
          />
        </div>
      </div>
    </>
  );
}

export default ViewSinglePost;
