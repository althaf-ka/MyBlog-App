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
import {
  deleteImageFromImageKit,
  imageKitUpload,
} from "../../Services/imageKitService";

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

  let isOperationInProgress = false;

  const createNewPost = async e => {
    e.preventDefault();

    if (isOperationInProgress) {
      return;
    }

    const toastMessage = toast.loading("Creating post...");
    let imgLink = null;

    try {
      isOperationInProgress = true;
      imgLink = await imageKitUpload(files, "Post-Images");

      const data = createFormData(imgLink);

      const response = await axios.post("/posts/add", data, {
        withCredentials: true,
      });

      if (response.statusText === "OK") {
        toast.update(toastMessage, {
          render: "Post Uploaded Successfully!",
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });
        reFetchPosts();
        navigate("/");
      }
    } catch (error) {
      toast.update(toastMessage, {
        render: error.response?.data || error.message || "An error occurred.", //Error from backend and frontend
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      // Error during post upload, delete the image if it exists
      if (imgLink !== null) {
        await deleteImageFromImageKit(imgLink);
      }

      if (error.response && error.response.status === 401) {
        navigate("/login"); // jwt token not verified, so login again
      }
    } finally {
      isOperationInProgress = false;
    }
  };

  const createFormData = imgLink => {
    const data = new FormData();
    data.set("title", title);
    data.set("content", content);
    selectedTopicsArray.forEach(topic => data.append("topics[]", topic));
    data.set("coverImgURL", imgLink.url);
    data.set("thumbnailUrl", imgLink.thumbnailUrl);
    data.set("imageKitFileId", imgLink.fileId);
    return data;
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
      // Check if the file size is less than 5MB
      if (selectedFile.size <= 5 * 1024 * 1024) {
        setFiles(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
      } else {
        e.target.value = null;
        toast.error("Please select an image file smaller than 5MB.");
        return;
      }
    } else {
      e.target.value = null;
      toast.error("Please select a valid image file.");
      return;
    }
  };

  return (
    <div className="create-post-form-container">
      <h2>Create a Post</h2>
      <form onSubmit={createNewPost} encType="multipart/form-data">
        <div className="input-container">
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
        </div>

        {imagePreview && (
          <div className="create-image-view">
            <img
              src={imagePreview}
              alt="Poster"
              className="create-preview-image"
            />
          </div>
        )}

        {/* <ImageFileUpload /> */}

        <ImageInput
          label="Thumbnail"
          id="thumbnail"
          moreInfo="Upload an image file that is less than 5MB in size."
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
