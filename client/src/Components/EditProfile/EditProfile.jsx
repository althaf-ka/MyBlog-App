import React, { useEffect, useState } from "react";
import "./EditProfile.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../config/axios";

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

  useEffect(() => {
    setUsername(userDetails?.username);
    setName(userDetails?.name);
    setBio(userDetails?.bio);
    setPreviewProfilePicture(
      `http://localhost:4000/uploads/profilePicture/${userDetails?.profileImageURL}`
    );
    setSocialLinks(userDetails?.socialLinks);
  }, []);

  const handleProfilePictureChange = event => {
    const file = event.target.files[0];
    setFile(file);
    setPreviewProfilePicture(URL.createObjectURL(file));
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
        }
        setErrorMessage(false);
        console.log(err);
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
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <div className="input-container">
            <input
              required
              type="text"
              id="name"
              className={`profile-input ${
                name?.length >= MAX_NAME_LENGTH ? "error" : ""
              }`}
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={event =>
                setName(capitalizeFirstLetter(event.target.value))
              }
            />
            <div className="char-count">
              {name?.length}/{MAX_NAME_LENGTH}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="profile-picture">Profile Picture</label>
          <input
            type="file"
            id="profile-picture"
            className="profile-input"
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
        </div>
        <div className="form-group">
          {errorMessage && (
            <p className="error-message">Username has already taken</p>
          )}
          <label htmlFor="username">
            Username{" "}
            <span className="message-span">
              (Please use only letters, numbers, and underscores.)
            </span>
          </label>
          <div className="input-container">
            <input
              required
              type="text"
              id="username"
              value={username}
              maxLength={MAX_USERNAME_LENGTH}
              className={`profile-input ${
                username?.length >= MAX_USERNAME_LENGTH ? "error" : ""
              }`}
              onChange={event => {
                const { value } = event.target;
                if (USERNAME_REGEX.test(value) || value === "") {
                  setUsername(value);
                }
              }}
            />
            <div className="char-count">
              {username?.length}/{MAX_USERNAME_LENGTH}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
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
            <div className="char-count">
              {bio?.length}/{MAX_BIO_LENGTH}
            </div>
          </div>
          {bio?.length >= MAX_BIO_LENGTH && (
            <div className="error-message">
              You have reached the maximum character limit.
            </div>
          )}
        </div>
        <div className="form-group">
          <div className="socials">
            <div className="social-wrapper">
              <div className="socials-box">
                <i className="fa fa-envelope" aria-hidden="true"></i>
              </div>
              <input
                className="profile-input social"
                type="email"
                placeholder="Enter Email"
                onChange={event => handleSocialLinks(event, "email")}
                value={socialLinks?.email}
              />
            </div>
            <span></span>
            <div className="social-wrapper">
              <div className="socials-box">
                <i className="fa fa-twitter" aria-hidden="true"></i>
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
                <i className="fa fa-instagram" aria-hidden="true"></i>
              </div>
              <input
                className="profile-input social"
                type="text"
                placeholder="Instagram Username"
                onChange={event => handleSocialLinks(event, "instagram")}
                value={socialLinks?.instagram}
              />
            </div>
            <span></span>
            <div className="social-wrapper">
              <div className="socials-box">
                <i className="fa fa-linkedin" aria-hidden="true"></i>
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
