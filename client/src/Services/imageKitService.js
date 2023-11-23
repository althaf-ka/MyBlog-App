import ImageKit from "imagekit-javascript";
import axios from "../../config/axios";

export const imageKitUpload = async (file, folderName) => {
  try {
    const imageKitAuth = await axios.get("/imagekit/auth");

    const imagekit = new ImageKit({
      publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
    });

    const response = await imagekit.upload({
      file: file,
      signature: imageKitAuth.data.signature,
      expire: imageKitAuth.data.expire,
      token: imageKitAuth.data.token,
      fileName: file.name,
      useUniqueFileName: true,
      folder: `/My-Blog/${folderName}`,
    });

    return {
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      fileId: response.fileId,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Image Upload Error");
  }
};

export const deleteImageFromImageKit = async imgLink => {
  try {
    const response = await axios.post("/imagekit/delete", imgLink, {
      withCredentials: true,
    });

    return response.status === 204;
  } catch (err) {
    return false;
  }
};
