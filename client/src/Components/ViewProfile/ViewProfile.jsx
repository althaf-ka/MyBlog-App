import React, { useContext, useEffect, useState } from "react";
import "./ViewProfile.css";
import { Link, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import AuthorBlogLists from "../AuthorBlogLists/AuthorBlogLists";
import InfiniteScroll from "react-infinite-scroll-component";
import TailSpinLoader from "../TailSpinLoader/TailSpinLoader";
import EndMessage from "../EndMessage/EndMessage";
import { UserContext } from "../../../Context/UserContext";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton";

function ViewProfile() {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [postDetails, setPostDetails] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    let ignore = false;
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/profile/${userId}`);
        if (!ignore) {
          setUserDetails(response.data);
          await loadMore(); //To load first initial posts

          if (userInfo?._id === response.data?._id) {
            setIsAuthor(true);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserDetails();

    return () => {
      ignore = true;
    };
  }, [userId]);

  const loadMore = async () => {
    try {
      const authorBlogs = await axios.get(
        `/author-posts/${userId}/?skip=${postDetails.length}`
      );
      if (authorBlogs.data.length === 0) {
        setHasMore(false);
      } else {
        setPostDetails(prevPostDetails => [
          ...prevPostDetails,
          ...authorBlogs.data,
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-card">
          {isAuthor && (
            <button className="edit-button">
              <Link to={`/profile/edit/${userId}`} state={userDetails}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
              </Link>
            </button>
          )}
          <div className="avatar-container">
            <img
              src={`http://localhost:4000/uploads/profilePicture/${userDetails?.profileImageURL}`}
              alt="Avatar"
              className="avatar"
            />
          </div>
          <h2>{userDetails?.name}</h2>
          <p>@ {userDetails?.username}</p>
        </div>
        <div className="profile-details-card">
          <p>{userDetails?.bio}</p>
          <div className="socials-conatiner">
            {userDetails?.socialLinks?.email && (
              <Link to={`mailto:${userDetails.socialLinks.email}`}>
                <i className="fa fa-envelope" aria-hidden="true"></i>
              </Link>
            )}
            {userDetails?.socialLinks?.twitter && (
              <Link to={`/${userDetails.socialLinks.twitter}`}>
                <i className="fa fa-twitter" aria-hidden="true"></i>
              </Link>
            )}
            {userDetails?.socialLinks?.instagram && (
              <Link to={`/${userDetails.socialLinks.instagram}`}>
                <i className="fa fa-instagram" aria-hidden="true"></i>
              </Link>
            )}
            {userDetails?.socialLinks?.linkedin && (
              <Link to={`/${userDetails.socialLinks.linkedin}`}>
                <i className="fa fa-linkedin" aria-hidden="true"></i>
              </Link>
            )}
          </div>
        </div>

        <div className="author-post-header-total">
          <h2 className="post-title"> Posts</h2>
          <h2>{userDetails?.totalBlogs}</h2>
        </div>
        <hr />
        <div className="my-post-container">
          <InfiniteScroll
            dataLength={postDetails.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<TailSpinLoader />}
            scrollThreshold={0.8}
            style={{ overflow: "none" }}
            endMessage={<EndMessage />}
          >
            {postDetails?.map((post, index) => (
              <AuthorBlogLists
                key={index}
                {...post}
                setPostDetails={setPostDetails}
                isAuthor={isAuthor}
              />
            ))}
          </InfiniteScroll>
          <ScrollToTopButton />
        </div>
      </div>
    </>
  );
}

export default ViewProfile;
