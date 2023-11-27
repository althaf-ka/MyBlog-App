import "./EditPost.css";
import React, { useState, useEffect, useContext } from "react";
import axios from "../../../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import EditorQuill from "../../Components/EditorQuill/EditorQuill";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormInput from "../../Components/Form/FormInput";
import ImageInput from "../../Components/Form/ImageInput";
import TailSpinLoader from "../../Components/Loaders/TailSpinLoader";
import { toast } from "react-toastify";
import { PostContext } from "../../../Context/PostContext";
import {
  deleteImageFromImageKit,
  imageKitUpload,
} from "../../Services/imageKitService";

function EditPost() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
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
    axios
      .get(`/posts/${id}`)
      .then(postInfo => {
        postInfo = postInfo.data;
        setState(prevState => ({
          ...prevState,
          title: postInfo.title,
          content: postInfo.content,
          topics: postInfo.topics?.map(topic => topic.title),
          prevTopics: postInfo.topics?.map(topic => topic.title),
          imageURL: postInfo.coverImageURL,
        }));
        setLoading(false);
      })
      .catch(err => {
        toast.error(err.message || "Error Occured");
        navigate(-1);
      });

    axios.get("/topics/topic-suggestions").then(suggestions => {
      //setting the suggestion topics in state
      setState(prevState => ({
        ...prevState,
        suggestedTopics: suggestions.data.map(suggestion => suggestion.title),
      }));
    });
  }, []);

  let isUpdateInProgress = false;

  const updatePost = async e => {
    e.preventDefault();

    if (isUpdateInProgress) {
      return;
    }

    const toastMessage = toast.loading("Updating post...");
    let imgLink = null;

    try {
      isUpdateInProgress = true;

      if (files?.[0]) {
        const updateImg = files[0];
        imgLink = await imageKitUpload(updateImg, "Post-Images");
      }

      const data = createJsonData(imgLink);

      const response = await axios.put("/posts/edit", data, {
        withCredentials: true,
      });

      if (response?.status === 200) {
        toast.update(toastMessage, {
          render: "Post Updated Successfully!",
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

      if (imgLink !== null) {
        await deleteImageFromImageKit(imgLink);
      }

      if (error.response && error.response.status === 401) {
        navigate("/login"); // JWT token not verified, so redirect to login
      }
      navigate("/");
    } finally {
      isUpdateInProgress = false;
    }
  };

  const createJsonData = imgLink => {
    const data = {
      id,
      title,
      content,
    };

    if (removedTopics && removedTopics.length > 0) {
      data.removedTopics = removedTopics;
    }
    if (newTopics && newTopics.length > 0) {
      data.newTopics = newTopics;
    }
    if (topics && topics.length > 0) {
      data.allTopics = topics;
    }

    if (imgLink !== null) {
      data.coverImgURL = imgLink.url;
      data.thumbnailUrl = imgLink.thumbnailUrl;
      data.imageKitFileId = imgLink.fileId;
    }

    return data;
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
        console.log(removed, "Removed ");
        const added = modifiedTopics?.filter(
          topic => !prevTopics?.includes(topic)
        );
        console.log(added, "ADDED");

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
      // Check if the file size is less than 5MB
      if (selectedFile.size <= 5 * 1024 * 1024) {
        setState(prevState => {
          return {
            ...prevState,
            files: e.target.files,
            imageURL: URL.createObjectURL(e.target.files[0]),
          };
        });
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

  if (loading) {
    return <TailSpinLoader size={70} wrapperClass="center-loader" />;
  }

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
          moreInfo="Upload an image file that is less than 5MB in size."
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
