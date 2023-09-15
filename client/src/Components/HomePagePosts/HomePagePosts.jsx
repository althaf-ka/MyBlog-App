import React, { useContext, useEffect, useMemo, useState } from "react";
import "./HomePagePosts.css";
import Post from "../Post/Post";
import axios from "../../../config/axios";
import InfiniteScroll from "react-infinite-scroll-component";
import TailSpinLoader from "../Loaders/TailSpinLoader";
import EndMessage from "../EndMessage/EndMessage";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton";
import { UserContext } from "../../../Context/UserContext";

function HomePagePosts() {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { userInfo } = useContext(UserContext);

  let mounted = false;

  useEffect(() => {
    if (!mounted) {
      loadMore();
      mounted = true;
    }
  }, []);

  const loadMore = async () => {
    try {
      const blogPosts = await axios.get(`/posts?skip=${posts.length}`, {
        withCredentials: true,
      });

      if (blogPosts.data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => [...prevPosts, ...blogPosts.data]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<TailSpinLoader size={60} />}
        scrollThreshold={0.7}
        style={{ overflow: "none" }}
        endMessage={<EndMessage info={true} />}
      >
        {posts.length > 0 &&
          posts.map(post => (
            <Post key={post._id} {...post} currentUserId={userInfo._id} />
          ))}
      </InfiniteScroll>
      <ScrollToTopButton />
    </>
  );
}

export default HomePagePosts;
