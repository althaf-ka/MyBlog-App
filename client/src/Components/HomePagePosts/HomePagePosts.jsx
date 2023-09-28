import React, { useContext, useEffect, useMemo, useState } from "react";
import "./HomePagePosts.css";
import Post from "../Post/Post";

import InfiniteScroll from "react-infinite-scroll-component";
import TailSpinLoader from "../Loaders/TailSpinLoader";
import EndMessage from "../EndMessage/EndMessage";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton";
import { UserContext } from "../../../Context/UserContext";

import { PostContext } from "../../../Context/PostContext";

function HomePagePosts() {
  const { userInfo } = useContext(UserContext);
  const { posts, hasMore, loadMorePosts } = useContext(PostContext);

  return (
    <>
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMorePosts}
        hasMore={hasMore}
        loader={<TailSpinLoader size={60} />}
        scrollThreshold={0.7}
        style={{ overflow: "none" }}
        endMessage={<EndMessage info={true} />}
      >
        {posts.length > 0 &&
          posts.map(post => (
            <Post key={post._id} {...post} currentUserId={userInfo?._id} />
          ))}
      </InfiniteScroll>
      <ScrollToTopButton />
    </>
  );
}

export default HomePagePosts;
