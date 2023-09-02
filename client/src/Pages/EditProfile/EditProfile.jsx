import React, { useEffect, useState } from "react";
import "./EditProfile.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import FormInput from "../../Components/Form/FormInput";
import ImageInput from "../../Components/Form/ImageInput";
import {
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
} from "../../assets";

const socialLinkState = { email: "", twitter: "", instagram: "", linkedin: "" };

function EditProfile() {
  const { state: userDetails } = useLocation();
  const [name, setName] = useState("");
  const [file, setFile] = useState("");
  const [previewProfilePicture, setPreviewProfilePicture] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState(socialLinkState);
  const [errorMessage, setErrorMessage] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    if (userDetails) {
      setUsername(userDetails.username);
      setName(userDetails.name);
      setBio(userDetails.bio);
      setPreviewProfilePicture(
        `http://localhost:4000/uploads/profilePicture/${userDetails.profileImageURL}`
      );
      setSocialLinks(userDetails.socialLinks);
      setErrorMessage(false);
    } else {
      const controller = new AbortController();
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`/users/profile/${userId}`, {
            signal: controller.signal,
          });
          setUsername(response.data.username);
          setName(response.data.name);
          setBio(response.data.bio);
          setPreviewProfilePicture(
            `http://localhost:4000/uploads/profilePicture/${response.data.profileImageURL}`
          );
          setSocialLinks(response.data.socialLinks);
          setErrorMessage(false);
        } catch (err) {
          console.log(err);
        }
      };
      fetchUserDetails();

      return () => {
        controller.abort();
      };
    }
  }, [userDetails, userId]);

  const handleProfilePictureChange = event => {
    const file = event.target.files[0];
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
      const minWidth = 400;
      const minHeight = 400;

      if (image.width <= minWidth && image.height <= minHeight) {
        setFile(file);
        setPreviewProfilePicture(URL.createObjectURL(file));
      } else {
        alert("The Profile Picture should be less than 400 x 400 pixels");
      }
    };
  };

  const handleSocialLinks = (event, linkType) => {
    const newLink = event.target.value;
    setSocialLinks(prevLinks => ({ ...prevLinks, [linkType]: newLink }));
  };

  function capitalizeFirstLetter(string) {
    return string
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const handleSubmit = event => {
    event.preventDefault();
    const data = new FormData();
    data.set("id", userDetails._id);
    data.set("name", name);
    data.set("username", username);
    data.set("bio", bio);
    data.set("socialLinks", JSON.stringify(socialLinks));
    if (file) {
      console.log("accessed");
      data.set("file", file);
    }

    axios
      .put("/users/profile/details", data, { withCredentials: true })
      .then(response => {
        navigate("/");
        navigate(0); //to reload the page and change the header
      })
      .catch(err => {
        if (err.response.status === 409) {
          setErrorMessage(true);
          return;
        }
        setErrorMessage(false);
      });
  };

  const MAX_NAME_LENGTH = 20;
  const MAX_USERNAME_LENGTH = 20;
  const MAX_BIO_LENGTH = 140;
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        {previewProfilePicture && (
          <img
            src={previewProfilePicture}
            alt="Profile Preview"
            className="preview-profile-picture"
          />
        )}

        <FormInput
          label="Name"
          placeholder="Name"
          id="name"
          required={true}
          value={name}
          moreInfo="Max 20 Characters"
          maxLength={MAX_NAME_LENGTH}
          onChange={event => setName(capitalizeFirstLetter(event.target.value))}
        />

        <ImageInput
          label={"Profile Picture"}
          id="profile"
          onChange={handleProfilePictureChange}
        />

        {errorMessage && (
          <p className="error-message-profile">Username has already taken</p>
        )}
        <FormInput
          label="Username"
          id="username"
          placeholder="Username"
          required={true}
          value={username}
          moreInfo="Please use only letters, numbers, and underscores."
          maxLength={MAX_USERNAME_LENGTH}
          onChange={event => {
            const { value } = event.target;
            if (USERNAME_REGEX.test(value) || value === "") {
              setUsername(value);
            }
          }}
        />

        <div className="bio-input">
          <label htmlFor="bio" className="bio-label">
            Bio
          </label>
          <div className="input-container">
            <textarea
              id="bio"
              value={bio}
              onChange={event => setBio(event.target.value)}
              maxLength={MAX_BIO_LENGTH}
              className={
                bio?.length >= MAX_BIO_LENGTH
                  ? "profile-input  error"
                  : " profile-input  "
              }
            />
            <div className="bio-char-count">
              {bio?.length}/{MAX_BIO_LENGTH}
            </div>
          </div>
        </div>

        <div className="socials-container">
          <div className="socials">
            <div className="social-wrapper">
              <div className="socials-box">
                <MailIcon />
              </div>
              <input
                className="profile-input social"
                type="email"
                placeholder="Enter Email"
                onChange={event => handleSocialLinks(event, "email")}
                value={socialLinks?.email}
              />
            </div>

            <div className="social-wrapper">
              <div className="socials-box">
                <TwitterIcon />
              </div>
              <input
                className="profile-input social"
                type="text"
                placeholder="Twitter Username"
                onChange={event => handleSocialLinks(event, "twitter")}
                value={socialLinks?.twitter}
              />
            </div>
          </div>
          <div className="socials">
            <div className="social-wrapper">
              <div className="socials-box">
                <InstagramIcon />
              </div>
              <input
                className="profile-input social"
                type="text"
                placeholder="Instagram Username"
                onChange={event => handleSocialLinks(event, "instagram")}
                value={socialLinks?.instagram}
              />
            </div>

            <div className="social-wrapper">
              <div className="socials-box">
                <LinkedinIcon />
              </div>
              <input
                className="profile-input social"
                type="text"
                placeholder="Linkedin Username"
                onChange={event => handleSocialLinks(event, "linkedin")}
                value={socialLinks?.linkedin}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="save-changes-button">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
