import React, { useContext, useState } from "react";
import "./CreatePost.css";
import axios from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import EditorQuill from "../EditorQuill/EditorQuill";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");

  const navigate = useNavigate();

  const createNewPost = e => {
    e.preventDefault();
    const data = new FormData();
    data.set("id", id);
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("file", files[0]);

    axios
      .post("/post", data, { withCredentials: true })
      .then(response => {
        console.log(response.data);
        navigate("/");
      })
      .catch(error => {
        //jwt token not verified so login again
        console.log(error.response.data.message);
        navigate("/login");
      });
  };

  return (
    <form onSubmit={createNewPost} encType="multipart/form-data">
      <input
        type="title"
        placeholder="Title"
        value={title}
        onChange={e => {
          setTitle(e.target.value);
        }}
      />
      <input
        type="summary"
        placeholder="Summary"
        value={summary}
        onChange={e => setSummary(e.target.value)}
      />
      <input
        type="file"
        onChange={e => {
          setFiles(e.target.files);
        }}
      />
      <EditorQuill value={content} onChange={setContent} />
      <button className="createbtn">Create Post</button>
    </form>
  );
}

export default CreatePost;
