import React, { useEffect, useState } from "react";
import "./TopicDetails.css";
import { useParams } from "react-router-dom";
import axios from "../../../config/axios";
import InfiniteScroll from "react-infinite-scroll-component";
import TailSpinLoader from "../TailSpinLoader/TailSpinLoader";
import TopicBlogLists from "../TopicBlogLists/TopicBlogLists";
import EndMessage from "../EndMessage/EndMessage";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton";

function TopicDetails() {
  const { topicId } = useParams();
  const [header, setHeader] = useState(null);
  const [postDetails, setPostDetails] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  let mounted = false;

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        const topicHeader = await axios.get(`/topic/details/${topicId}`);
        const { title, total } = topicHeader.data;
        setHeader({ title, total });
      } catch (err) {
        console.log(err);
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
        `/topic/${topicId}/?skip=${postDetails?.length}`
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
      console.log(err);
    }
  };

  return (
    <>
      <div className="topic-details-header">
        <h2 className="topic-title">
          <i className="fa fa-tag" aria-hidden="true"></i>
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
          loader={<TailSpinLoader />}
          scrollThreshold={0.8}
          style={{ overflow: "none" }}
          endMessage={<EndMessage info={true} />}
        >
          {postDetails?.map((post, index) => (
            <TopicBlogLists key={index} {...post} />
          ))}
        </InfiniteScroll>
        <ScrollToTopButton />
      </div>
    </>
  );
}

export default TopicDetails;
