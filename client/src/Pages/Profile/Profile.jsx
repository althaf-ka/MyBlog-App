import "./Profile.css";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import AuthorBlogLists from "../../Components/AuthorBlogLists/AuthorBlogLists";
import InfiniteScroll from "react-infinite-scroll-component";
import TailSpinLoader from "../../Components/Loaders/TailSpinLoader";
import EndMessage from "../../Components/EndMessage/EndMessage";
import { UserContext } from "../../../Context/UserContext";
import ScrollToTopButton from "../../Components/ScrollToTopButton/ScrollToTopButton";
import {
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
} from "../../assets";
import RoundProfilePicture from "../../Components/RoundProfilePicture/RoundProfilePicture";

function Profile() {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [postDetails, setPostDetails] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/users/profile/${userId}`, {
          signal: controller.signal,
        });
        setUserDetails(response.data);
        await loadMore(); // To load first initial posts

        if (userInfo?._id === response.data?._id) {
          setIsAuthor(true);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserDetails();

    return () => {
      controller.abort();
    };
  }, [userId]);

  const loadMore = async () => {
    try {
      const authorBlogs = await axios.get(
        `/posts/author-posts/${userId}/?skip=${postDetails.length}`
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
            <Link to={`/profile/edit/${userId}`} state={userDetails}>
              <button className="edit-button">Edit Profile</button>
            </Link>
          )}
          <div className="avatar-container">
            <RoundProfilePicture
              size={130}
              imageUrl={`http://localhost:4000/uploads/profilePicture/${userDetails?.profileImageURL}`}
            />
          </div>
          <h2>{userDetails?.name}</h2>
          <p>@ {userDetails?.username}</p>
        </div>
        <div className="profile-details-card">
          <p>{userDetails?.bio}</p>
          <div className="socials-conatiner">
            {userDetails?.socialLinks?.email && (
              <a
                href={`mailto:${userDetails.socialLinks.email}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MailIcon />
              </a>
            )}
            {userDetails?.socialLinks?.twitter && (
              <a
                href={`https://twitter.com/${userDetails.socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
              </a>
            )}
            {userDetails?.socialLinks?.instagram && (
              <a
                href={`https://www.instagram.com/${userDetails.socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </a>
            )}
            {userDetails?.socialLinks?.linkedin && (
              <a
                href={`https://www.linkedin.com/in/${userDetails.socialLinks.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedinIcon />
              </a>
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
            loader={<TailSpinLoader size={60} />}
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

export default Profile;
