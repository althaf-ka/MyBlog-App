import { useEffect, useState } from "react";

const defaultImg =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtmST7lbuieRgVQMkB35mMjIOQw5_d2V84WeZMax6O63VpPB4ZpQNfVZecOIxkCAvzUYM&usqp=CAU";

function RoundProfilePicture({ size, imageUrl }) {
  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const [imgSrc, setImgSrc] = useState(imageUrl);

  const onImgErr = () => {
    setImgSrc(defaultImg);
  };

  useEffect(() => {
    // Check if the imageUrl is an external URL
    if (imageUrl && imageUrl.startsWith("http")) {
      setImgSrc(imageUrl);
    } else {
      setImgSrc(`/api/uploads/profilePicture/${imageUrl}`);
    }
  }, [imageUrl]);

  return (
    <div style={style} className="round-profile-picture">
      <img src={imgSrc} alt="Profile" style={imgStyle} onError={onImgErr} />
    </div>
  );
}

export default RoundProfilePicture;
