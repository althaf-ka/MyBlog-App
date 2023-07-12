import React, { useEffect, useState } from "react";
import "./CreatePost.css";
import axios from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import EditorQuill from "../EditorQuill/EditorQuill";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [selectedTopicsArray, setSelectedTopicsArray] = useState([]);
  const [TopicErrMsg, setTopicErrMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/topic-suggestions").then(suggestions => {
      //setting the suggestion topics
      const topics = suggestions.data.map(suggestion => suggestion.title);
      setSuggestedTopics(topics);
    });
  }, []);

  const createNewPost = e => {
    e.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("content", content);
    selectedTopicsArray.map(topic => data.append("topics[]", topic)); //To make selected topic to Array

    const file = files[0] || null;
    data.set("file", file);

    axios
      .post("/post", data, { withCredentials: true })
      .then(response => {
        console.log(response.data);
        navigate("/");
      })
      .catch(error => {
        //jwt token not verified so login again
        // console.log(error.response.data.message);
        navigate("/login"); //HERE ERROR FIX NEEEDDED notification
      });
  };

  const handleTopicChange = (event, topics) => {
    //topics is in the form of array and to limit only 5 topics
    if (topics.length > 5) {
      topics.pop();
      setTopicErrMsg(
        "Please note that only a maximum of five topics can be selected for each blog post."
      );
    } else {
      // Filter out topics that start with special characters or numbers ^
      const filteredTopics = topics.filter(topic => /^[a-zA-Z]/.test(topic));

      if (filteredTopics.length !== topics.length) {
        setTopicErrMsg("Topic names can only start with letters.");
      } else {
        // Capitalize the first letter of each word in the remaining topics
        const modifiedTopics = filteredTopics.map(topic => {
          return topic
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        });

        setSelectedTopicsArray(modifiedTopics);
        setTopicErrMsg(null);
      }
    }
  };

  const handleImageChange = e => {
    const selectedFile = e.target.files[0];
    // Check if the file type is an image
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFiles(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      e.target.value = null;
      alert("Please select a valid image file.");
      return;
    }
  };

  return (
    <div className="create-post-form-container">
      <h2>Create a Post</h2>
      <form onSubmit={createNewPost} encType="multipart/form-data">
        <label htmlFor="title" className="create-form-label">
          Title
        </label>
        <input
          type="title"
          placeholder="Title"
          value={title}
          required
          className="create-form-input"
          onChange={e => {
            setTitle(e.target.value);
          }}
        />

        <label className="create-form-label">
          Thumbnail <span>(Image Only)</span>
        </label>
        {imagePreview && (
          <div className="create-image-view">
            <img
              src={imagePreview}
              alt="Poster"
              className="create-preview-image"
            />
          </div>
        )}

        <input
          type="file"
          required
          accept="image/*"
          className="create-image-input create-form-input"
          onChange={handleImageChange}
        />

        <label className="create-form-label">Tell your story..</label>
        <EditorQuill value={content} onChange={setContent} />

        <div className="create-topics-container">
          <label className="create-form-label">Topics in story</label>
          {TopicErrMsg && <p className="error">{TopicErrMsg}</p>}
          <Autocomplete
            multiple
            id="tags-filled"
            options={suggestedTopics}
            limitTags={5}
            freeSolo
            autoSelect
            disablePortal={true}
            renderInput={params => (
              <TextField
                {...params}
                variant="filled"
                label="Please select a minimum of five blog topics from the list or create your own topic."
              />
            )}
            value={selectedTopicsArray}
            onChange={handleTopicChange}
          />
        </div>

        <div className="create-btn-container">
          <button className="create-btn">Create Post</button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
