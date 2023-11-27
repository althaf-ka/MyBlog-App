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
import { imageKitUpload } from "../../Services/imageKitService";

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
      setPreviewProfilePicture(userDetails.profileImageURL);
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
          setPreviewProfilePicture(response.data.profileImageURL);
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

    // Check if the file type is an image
    if (file && file.type.startsWith("image/")) {
      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = () => {
        const minWidth = 400;
        const minHeight = 400;

        // Check if the file size is less than 5MB
        if (file.size <= 5 * 1024 * 1024) {
          if (image.width <= minWidth && image.height <= minHeight) {
            setFile(file);
            setPreviewProfilePicture(URL.createObjectURL(file));
          } else {
            event.target.value = null;
            toast.error(
              "The Profile Picture should be less than 400 x 400 pixels"
            );
          }
        } else {
          event.target.value = null;
          toast.error("Please select an image file smaller than 5MB.");
        }
      };
    } else {
      event.target.value = null;
      toast.error("Please select a valid image file.");
    }
  };

  const handleSocialLinks = (event, linkType) => {
    const newLink = event.target.value;
    setSocialLinks(prevLinks => ({ ...prevLinks, [linkType]: newLink }));
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let updationInProgress = false;

  const handleSubmit = async event => {
    event.preventDefault();

    if (updationInProgress) return;

    const toastMessage = toast.loading("Updating profile...");
    let imgLink = null;

    try {
      updationInProgress = true;
      if (file) {
        imgLink = await imageKitUpload(file, "Profile-Images");
      }

      const data = createJsonData(imgLink);

      const response = await axios.put("/users/profile/details", data, {
        withCredentials: true,
      });

      if (response?.status === 200) {
        toast.update(toastMessage, {
          render: "Profile updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        setTimeout(() => {
          navigate("/");
          navigate(0); // To reload the page and change the header
        }, 1500);
      }

      // To reload the page and change the header
    } catch (error) {
      toast.update(toastMessage, {
        render:
          error.response?.data.message ||
          error.message ||
          "Error updating profile. Please try again later.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      updationInProgress = false;
    }
  };

  const createJsonData = imgLink => {
    const data = {
      id: userDetails._id,
      name: name,
      bio: bio,
      socialLinks: JSON.stringify(socialLinks),
    };

    if (imgLink !== null) {
      data.profileImageURL = imgLink.url;
      data.profileThumbnailUrl = imgLink.thumbnailUrl;
      data.imageKitFileId = imgLink.fileId;
    }

    return data;
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
          moreInfo="Upload an image file that is less than 5MB in size."
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
