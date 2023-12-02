import React, { useEffect, useState } from "react";
import "./TopicDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import InfiniteScroll from "react-infinite-scroll-component";
import TailSpinLoader from "../../Components/Loaders/TailSpinLoader";
import EndMessage from "../../Components/EndMessage/EndMessage";
import ScrollToTopButton from "../../Components/ScrollToTopButton/ScrollToTopButton";
import Post from "../../Components/Post/Post";
import { TopicIcon } from "../../assets";
import { toast } from "react-toastify";

function TopicDetails() {
  const { topicId } = useParams();
  const [header, setHeader] = useState(null);
  const [postDetails, setPostDetails] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  let mounted = false;

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        const topicHeader = await axios.get(`/topics/details/${topicId}`);
        const { title, total } = topicHeader.data;
        setHeader({ title, total });
      } catch (err) {
        if (err) {
          navigate(-1);
        }
      }
    };
    if (!mounted) {
      fetchTopicDetails();
      loadMore();
      mounted = true;
    }
  }, []);

  const loadMore = async () => {
    try {
      const topicBlogs = await axios.get(
        `/topics/posts/${topicId}/?skip=${postDetails?.length}`
      );
      if (topicBlogs.data.length === 0) {
        setHasMore(false);
      } else {
        setPostDetails(prevPostDetails => [
          ...prevPostDetails,
          ...topicBlogs.data,
        ]);
      }
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  if (postDetails?.length === 0) {
    return <TailSpinLoader size={70} wrapperClass="center-loader" />;
  }

  return (
    <div className="topic-details-container">
      <div className="topic-details-header">
        <h2 className="topic-title">
          <TopicIcon />
          {header?.title}
        </h2>
        <h2 className="topic-total">
          {header?.total}
          <span className="stories-span">Stories</span>
        </h2>
      </div>

      <div className="post-list">
        <InfiniteScroll
          dataLength={postDetails.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<TailSpinLoader size={60} />}
          scrollThreshold={0.8}
          style={{ overflow: "none" }}
          endMessage={<EndMessage info={true} />}
        >
          {postDetails?.map((post, index) => (
            <Post key={index} {...post} hideBookmark={true} />
          ))}
        </InfiniteScroll>
        <ScrollToTopButton />
      </div>
    </div>
  );
}

export default TopicDetails;
