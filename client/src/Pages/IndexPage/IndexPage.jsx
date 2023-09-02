import React from "react";
import HomePagePosts from "../../Components/HomePagePosts/HomePagePosts";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./index.css";

function IndexPage() {
  return (
    <div className="home-layout-container">
      <Sidebar />
      <HomePagePosts />
    </div>
  );
}

export default IndexPage;
