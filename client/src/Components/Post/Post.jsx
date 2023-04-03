import React from "react";
import "./Post.css";

function Post() {
  return (
    <div className="post">
      <div className="image">
        <img
          src="https://techcrunch.com/wp-content/uploads/2023/03/GettyImages-1462188043.jpg?w=1390&crop=1"
          alt="PosterImg"
        />
      </div>
      <div className="text">
        <h2>OpenAI geoblocks ChatGPT in Italy</h2>
        <p className="info">
          <a href="" className="author">
            Elon
          </a>
          <time>2023-1-06 11:30</time>
        </p>
        <p className="summary">
          OpenAI appears to be applying a simple geoblock at this point — which
          means that using a VPN to switch to a non-Italian IP address
        </p>
      </div>
    </div>
  );
}

export default Post;
