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
    data.set("file", files[0]);

    axios
      .post("/post", data, { withCredentials: true })
      .then(response => {
        console.log(response.data);
        navigate("/");
      })
      .catch(error => {
        //jwt token not verified so login again
        // console.log(error.response.data.message);
        navigate("/login"); //HERE ERROR FIX NEEEDDED
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

  return (
    <form onSubmit={createNewPost} encType="multipart/form-data">
      <input
        type="title"
        placeholder="Title"
        value={title}
        required
        onChange={e => {
          setTitle(e.target.value);
        }}
      />

      {imagePreview && (
        <div className="image-view">
          <img src={imagePreview} alt="Poster" />
        </div>
      )}

      <input
        type="file"
        required
        onChange={e => {
          setFiles(e.target.files);
          setImagePreview(URL.createObjectURL(e.target.files[0]));
        }}
      />
      <EditorQuill value={content} onChange={setContent} required />

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

      <button className="createbtn">Create Post</button>
    </form>
  );
}

export default CreatePost;
