import React, { useEffect, useState } from "react";
import "./EditProfile.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../../../config/axios";
import FormInput from "../../Components/Form/FormInput";
import ImageInput from "../../Components/Form/ImageInput";
import RoundProfilePicture from "../../Components/RoundProfilePicture/RoundProfilePicture";
import {
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
} from "../../assets";
import { toast } from "react-toastify";

const socialLinkState = { email: "", twitter: "", instagram: "", linkedin: "" };

function EditProfile() {
  const { state: userDetails } = useLocation();
  const [name, setName] = useState("");
  const [file, setFile] = useState("");
  const [previewProfilePicture, setPreviewProfilePicture] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState(socialLinkState);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name);
      setEmail(userDetails.email);
      setBio(userDetails.bio);
      setPreviewProfilePicture(
        `http://localhost:4000/uploads/profilePicture/${userDetails.profileImageURL}`
      );
      setSocialLinks(userDetails.socialLinks);
    } else {
      const controller = new AbortController();
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`/users/profile/${userId}`, {
            signal: controller.signal,
          });
          setName(response.data.name);
          setEmail(response.data.email);
          setBio(response.data.bio);
          setPreviewProfilePicture(
            `http://localhost:4000/uploads/profilePicture/${response.data.profileImageURL}`
          );
          setSocialLinks(response.data.socialLinks);
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
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleSubmit = async event => {
    event.preventDefault();
    const data = new FormData();
    data.set("id", userDetails._id);
    data.set("name", name);
    data.set("bio", bio);
    data.set("socialLinks", JSON.stringify(socialLinks));
    if (file) {
      data.set("file", file);
    }

    try {
      await toast.promise(
        axios.put("/users/profile/details", data, { withCredentials: true }),
        {
          pending: "Updating profile...",
          success: "Profile updated successfully!",
          error: "Error updating profile. Please try again later.",
        }
      );
      navigate("/");
      navigate(0); // To reload the page and change the header
    } catch (error) {
      toast.error(error.response.data);
    }
  };

  const MAX_NAME_LENGTH = 25;
  const MAX_BIO_LENGTH = 140;

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        {previewProfilePicture && (
          <div className="preview-profile-picture">
            <RoundProfilePicture size={125} imageUrl={previewProfilePicture} />
          </div>
        )}

        <FormInput label="Email" id="email" value={email} />

        <FormInput
          label="Name"
          placeholder="Name"
          id="name"
          required={true}
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={event => setName(capitalizeFirstLetter(event.target.value))}
        />

        <ImageInput
          label={"Profile Picture"}
          id="profile"
          onChange={handleProfilePictureChange}
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
