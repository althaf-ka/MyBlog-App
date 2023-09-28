import "./CreatePost.css";
import React, { useContext, useEffect, useState } from "react";
import axios from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import EditorQuill from "../../Components/EditorQuill/EditorQuill";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormInput from "../../Components/Form/FormInput";
import ImageInput from "../../Components/Form/ImageInput";
import { toast } from "react-toastify";
import { PostContext } from "../../../Context/PostContext";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [selectedTopicsArray, setSelectedTopicsArray] = useState([]);
  const [TopicErrMsg, setTopicErrMsg] = useState("");

  const { reFetchPosts } = useContext(PostContext);

  const navigate = useNavigate();
  const MAX_TITLE_LENGTH = 130;

  useEffect(() => {
    axios.get("/topics/topic-suggestions").then(suggestions => {
      //setting the suggestion topics
      const topics = suggestions.data.map(suggestion => suggestion.title);
      setSuggestedTopics(topics);
    });
  }, []);

  const createNewPost = async e => {
    e.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("content", content);
    selectedTopicsArray.map(topic => data.append("topics[]", topic)); // To make selected topic an array

    const file = files || null;
    data.set("file", file);

    try {
      const response = await toast.promise(
        axios.post("/posts/add", data, { withCredentials: true }),
        {
          pending: "Creating post...",
          success: "Post Uploaded successfully!",
          error: "Error creating post. Please try again later.",
        }
      );

      if (response.statusText === "OK") {
        navigate("/");
        reFetchPosts();
      }
    } catch (error) {
      toast.error(error.response.data);
      if (error.response && error.response.status === 401) {
        navigate("/login"); //jwt token not verified so login again
      }
    }
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
        <FormInput
          label="Title"
          id="title"
          value={title}
          required={true}
          placeholder="Title"
          maxLength={MAX_TITLE_LENGTH}
          onChange={e => {
            setTitle(e.target.value);
          }}
        />

        {imagePreview && (
          <div className="create-image-view">
            <img
              src={imagePreview}
              alt="Poster"
              className="create-preview-image"
            />
          </div>
        )}
        <ImageInput
          label="Thumbnail"
          id="thumbnail"
          moreInfo="Image Only"
          onChange={handleImageChange}
          required={true}
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
