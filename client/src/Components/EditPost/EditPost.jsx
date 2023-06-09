import React, { useState, useEffect } from "react";
import "./EditPost.css";
import axios from "../../../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import EditorQuill from "../EditorQuill/EditorQuill";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function EditPost() {
  const { id } = useParams();
  const [state, setState] = useState({
    title: "",
    content: "",
    topics: [],
    files: "",
    imageURL: "",
    prevTopics: "",
    suggestedTopics: [],
    removedTopics: [],
    newTopics: [],
    topicErrMsg: "",
  });

  const {
    title,
    content,
    topics,
    files,
    imageURL,
    prevTopics,
    suggestedTopics,
    removedTopics,
    newTopics,
    topicErrMsg,
  } = state;

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/post/${id}`).then(postInfo => {
      postInfo = postInfo.data;
      setState(prevState => ({
        ...prevState,
        title: postInfo.title,
        content: postInfo.content,
        topics: postInfo.topics?.map(topic => topic.title),
        prevTopics: postInfo.topics,
        imageURL: `http://localhost:4000/uploads/postImages/${postInfo.coverImageURL}`,
      }));
    });

    axios.get("/topic-suggestions").then(suggestions => {
      //setting the suggestion topics in state
      setState(prevState => ({
        ...prevState,
        suggestedTopics: suggestions.data.map(suggestion => suggestion.title),
      }));
    });
  }, []);

  const updatePost = e => {
    e.preventDefault();
    const data = new FormData();
    data.set("id", id);
    data.set("title", title);
    data.set("content", content);
    removedTopics?.map(topic => data.append("removedTopics[]", topic)); //To make selected topic to Array if no change no data
    newTopics?.map(topic => data.append("newTopics[]", topic));
    topics?.map(topic => data.append("allTopics[]", topic));
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
        console.log(error);
        navigate("/login");
      });
  };

  const handleTopicChange = (event, topics) => {
    // Check if topics array has more than 5 elements
    if (topics.length > 5) {
      topics.pop();
      setState(prevState => ({
        ...prevState,
        topicErrMsg:
          "Please note that only a maximum of five topics can be selected for each blog post.",
      }));
    } else {
      // Filter out topics that start with a number or special character ^
      const filteredTopics = topics.filter(topic => /^[a-zA-Z]/.test(topic));
      if (filteredTopics.length !== topics.length) {
        setState(prevState => ({
          ...prevState,
          topicErrMsg: "Topic names can only start with letters.",
        }));
      } else {
        // Capitalize the first letter of each word in the remaining topics
        const modifiedTopics = filteredTopics.map(topic => {
          return topic
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        });

        const removed = prevTopics?.filter(
          topic => !modifiedTopics.includes(topic)
        );
        const added = modifiedTopics?.filter(
          topic => !prevTopics?.includes(topic)
        );

        setState(prevState => ({
          ...prevState,
          removedTopics: removed,
          newTopics: added,
          topicErrMsg: null,
          topics: modifiedTopics, //To change value in autocomplete also
        }));
      }
    }
  };

  return (
    <form onSubmit={updatePost} encType="multipart/form-data">
      <input
        type="title"
        placeholder="Title"
        value={title}
        onChange={e => {
          setState(prevState => {
            return { ...prevState, title: e.target.value };
          });
        }}
      />
      <div className="image-view">
        <img src={imageURL} alt="Poster" />
      </div>
      <input
        type="file"
        onChange={e => {
          setState(prevState => {
            return {
              ...prevState,
              files: e.target.files,
              imageURL: URL.createObjectURL(e.target.files[0]),
            };
          });
        }}
      />

      <EditorQuill
        value={content}
        onChange={value =>
          setState(prevState => ({ ...prevState, content: value }))
        }
      />

      {/* Topics Section */}

      {topicErrMsg && <p className="error">{topicErrMsg}</p>}
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
        value={topics ? topics : []}
        onChange={handleTopicChange}
      />

      <button className="createbtn">Update Post</button>
    </form>
  );
}

export default EditPost;
