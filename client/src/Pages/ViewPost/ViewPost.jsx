import React from "react";
import "./ViewPost.css";
import { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import { format } from "date-fns";
import { UserContext } from "../../../Context/UserContext";
import ClapButton from "../../Components/ClapButton/ClapButton";
import BlogOptions from "../../Components/BlogOptions/BlogOptions";
import BookMark from "../../Components/BookMark/BookMark";
import TailSpinLoader from "../../Components/Loaders/TailSpinLoader";
import RoundProfilePicture from "../../Components/RoundProfilePicture/RoundProfilePicture";
import NotFound from "../../Pages/NotFound/NotFound";
import { toast } from "react-toastify";

function ViewPost() {
  const { id } = useParams();
  const [postInfo, setPostInfo] = useState(null);
  const [isUserClapped, setIsUserClapped] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const clapButtonRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const postResponse = await axios.get(`/posts/${id}`, {
          signal: controller.signal,
        });
        setPostInfo(prevValue => ({ ...prevValue, ...postResponse.data }));

        // Fetch bookmark data if userInfo is present
        if (userInfo && Object.keys(userInfo).length > 0) {
          const bookmarkResponse = await axios.get(
            `/bookmarks/users/${id}/${userInfo._id}`,
            { signal: controller.signal, withCredentials: true }
          );
          setPostInfo(prevValue => ({
            ...prevValue,
            ...bookmarkResponse.data,
          }));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error(error.response.data);
          setErrorOccured(true);
        }
      }
    };
    fetchData();

    return () => {
      controller.abort();
    };
  }, [userInfo?._id]);

  if (errorOccured) {
    return <NotFound message="Post Not Found!" />;
  }

  if (!postInfo)
    return <TailSpinLoader size={70} wrapperClass="center-loader" />;

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
        {postInfo?.createdAt && (
          <time>
            {format(new Date(postInfo.createdAt), "MMM d, yyyy HH:mm")}
          </time>
        )}
        <div className="author">{postInfo.author}</div>

        <div className="image">
          <img
            src={`/api/uploads/postImages/${postInfo.coverImageURL}`}
            alt="PosterImg"
          />
        </div>

        <div className="down-section">
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
              <RoundProfilePicture
                size={60}
                imageUrl={postInfo?.profileImageURL[0]}
              />
            </div>
            <div className="author-name">Written by {postInfo.author}</div>
          </div>

          {userInfo && userInfo._id === postInfo.userId && (
            <div className="edit-row">
              <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                Edit Post
              </Link>
            </div>
          )}
          <div className="options-border">
            <div className="main-blog-options-container">
              <ClapButton
                ref={clapButtonRef}
                currentUserId={userInfo?._id}
                postId={id}
                authorId={postInfo?.userId}
                setIsUserClapped={setIsUserClapped}
              />

              <BookMark
                currentUserId={userInfo?._id}
                postId={id}
                isBookmarked={postInfo?.hasBookmark}
              />

              <BlogOptions
                onCancelClaps={handleCancelAllClaps}
                isUserClapped={isUserClapped}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewPost;
