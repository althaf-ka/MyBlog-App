import "./EditPost.css";
import React, { useState, useEffect, useContext } from "react";
import axios from "../../../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import EditorQuill from "../../Components/EditorQuill/EditorQuill";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormInput from "../../Components/Form/FormInput";
import ImageInput from "../../Components/Form/ImageInput";
import { toast } from "react-toastify";
import { PostContext } from "../../../Context/PostContext";

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
  const { reFetchPosts } = useContext(PostContext);

  const navigate = useNavigate();
  const MAX_TITLE_LENGTH = 130;

  useEffect(() => {
    axios.get(`/posts/${id}`).then(postInfo => {
      postInfo = postInfo.data;
      setState(prevState => ({
        ...prevState,
        title: postInfo.title,
        content: postInfo.content,
        topics: postInfo.topics?.map(topic => topic.title),
        prevTopics: postInfo.topics?.map(topic => topic.title),
        imageURL: `http://localhost:4000/uploads/postImages/${postInfo.coverImageURL}`,
      }));
    });

    axios.get("/topics/topic-suggestions").then(suggestions => {
      //setting the suggestion topics in state
      setState(prevState => ({
        ...prevState,
        suggestedTopics: suggestions.data.map(suggestion => suggestion.title),
      }));
    });
  }, []);

  const updatePost = async e => {
    e.preventDefault();
    const data = new FormData();
    data.set("id", id);
    data.set("title", title);
    data.set("content", content);
    removedTopics?.map(topic => data.append("removedTopics[]", topic)); // To make selected topic to Array if no change no data
    newTopics?.map(topic => data.append("newTopics[]", topic));
    topics?.map(topic => data.append("allTopics[]", topic));
    if (files?.[0]) {
      data.set("file", files?.[0]);
    }

    try {
      const response = await toast.promise(
        axios.put("/posts/edit", data, { withCredentials: true }),
        {
          pending: "Updating post...",
          success: "Post updated successfully!",
          error: "Error updating post. Please try again later.",
        }
      );

      if (response.statusText === "OK") {
        reFetchPosts();
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login"); // JWT token not verified, so redirect to login
      }
      console.error(error);
      navigate("/login");
    }
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

  const handleImageChange = e => {
    const selectedFile = e.target.files[0];
    // Check if the file type is an image
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setState(prevState => {
        return {
          ...prevState,
          files: e.target.files,
          imageURL: URL.createObjectURL(e.target.files[0]),
        };
      });
    } else {
      e.target.value = null;
      alert("Please select a valid image file.");
      return;
    }
  };

  return (
    <div className="edit-post-form-conatiner">
      <h2>Edit Post</h2>
      <form onSubmit={updatePost} encType="multipart/form-data">
        <FormInput
          id="title"
          label="Title"
          placeholder="Title"
          value={title}
          required={true}
          maxLength={MAX_TITLE_LENGTH}
          onChange={e => {
            setState(prevState => {
              return { ...prevState, title: e.target.value };
            });
          }}
        />

        <div className="edit-image-view">
          <img src={imageURL} alt="Poster" className="edit-preview-image" />
        </div>
        <ImageInput
          label="Thumbnail"
          id="thumbnail"
          moreInfo="Image Only"
          onChange={handleImageChange}
        />

        <label className="edit-form-label">Tell your story..</label>
        <EditorQuill
          value={content}
          onChange={value =>
            setState(prevState => ({ ...prevState, content: value }))
          }
        />

        {/* Topics Section */}

        <div className="edit-topics-container">
          <label className="edit-form-label">Topics in story</label>
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
        </div>

        <div className="edit-btn-container">
          <button className="edit-btn">Update Post</button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
