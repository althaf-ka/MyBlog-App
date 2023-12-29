import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "../config/axios";

export const PostContext = createContext(null);

export function PostContextProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  let mounted = false;

  useEffect(() => {
    if (posts.length === 0 && !mounted) {
      loadMorePosts();
      mounted = true;
    }
  }, [posts]);

  const loadMorePosts = async () => {
    try {
      const blogPosts = await axios.get(`/posts?skip=${posts.length}`, {
        withCredentials: true,
      });

      if (blogPosts.data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...blogPosts.data]);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data);
    }
  };

  const reFetchPosts = () => {
    setPosts([]); //Fetchs Posts in UseEffect
    setHasMore(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removePostFromHome = (postId) => {
    const postIndex = posts.findIndex((post) => post._id === postId);

    if (postIndex !== -1) {
      setPosts((prevPosts) => {
        const updatedPosts = [...prevPosts];
        updatedPosts.splice(postIndex, 1);
        return updatedPosts;
      });
    }
  };

  const toggleBookmarkIcon = (postId, toggle) => {
    const postIndex = posts.findIndex((post) => post._id === postId);

    if (postIndex !== -1) {
      setPosts((prevPosts) => {
        const updatedPosts = [...prevPosts];
        updatedPosts[postIndex].isBookmarked = toggle;
        return updatedPosts;
      });
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loadMorePosts,
        reFetchPosts,
        hasMore,
        removePostFromHome,
        toggleBookmarkIcon,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}
