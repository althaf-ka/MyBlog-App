import React, { useEffect, useState } from "react";
import "./TopicDetails.css";
import { Link, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import { format } from "date-fns";

function TopicDetails() {
  const { topicName } = useParams();
  const parser = new DOMParser();
  const [header, setHeader] = useState(null);
  const [postDetails, setPostDetails] = useState([]);

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        const response = await axios.get(`/topics/${topicName}`);
        const { _id: title, total } = response.data;
        setHeader({ title, total });
        setPostDetails(response.data.postsDetails);
      } catch (err) {
        console.log(err);
      }
    };
    fetchTopicDetails();
  }, []);
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
        {postDetails.map(post => {
          const content = parser.parseFromString(post.content, "text/html");
          return (
            <div key={post._id} className="post-card">
              <div className="post-content">
                <Link to={`/post/${post._id}`}>
                  <h3>{post.title}</h3>
                  <p className="post-description">
                    {content.documentElement.textContent.substring(0, 200) +
                      "....."}
                  </p>
                  <div className="post-meta">
                    <div className="author">{post.author}</div>
                    <time className="date">
                      {format(new Date(post.createdAt), "MMM d, yyyy HH:mm")}
                    </time>
                  </div>
                </Link>
              </div>
              <div className="post-image">
                <Link to={`/post/${post._id}`}>
                  <img
                    src={`http://localhost:4000/uploads/postImages/${post.coverImageURL}`}
                    alt="Post Image"
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default TopicDetails;
