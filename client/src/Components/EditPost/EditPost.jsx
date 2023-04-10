import React, { useState, useEffect } from "react";
import "./EditPost.css";
import axios from "../../../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import EditorQuill from "../EditorQuill/EditorQuill";

function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [imageURL, setImageURL] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/post/${id}`).then(postInfo => {
      postInfo = postInfo.data;
      setTitle(postInfo.title);
      setSummary(postInfo.summary);
      setContent(postInfo.content);
      setImageURL(
        `http://localhost:4000/uploads/postImages/${postInfo.coverImageURL}`
      );
    });
  }, []);

  const updatePost = e => {
    e.preventDefault();
    const data = new FormData();
    data.set("id", id);
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (files?.[0]) {
      data.set("file", files?.[0]);
    }

    axios
      .put("/post", data, { withCredentials: true })
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
    <form onSubmit={updatePost} encType="multipart/form-data">
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
      <div className="image-view">
        <img src={imageURL} alt="Poster" />
      </div>
      <input
        type="file"
        onChange={e => {
          setFiles(e.target.files);
          setImageURL(URL.createObjectURL(e.target.files[0]));
        }}
      />
      <EditorQuill value={content} onChange={setContent} />
      <button className="createbtn">Update Post</button>
    </form>
  );
}

export default EditPost;
