import imagekit from "../utils/imageKit.js";

export const imagekitDeleteFile = imagekitFileId => {
  imagekit
    .deleteFile(imagekitFileId)
    .then(result => {
      return true;
    })
    .catch(error => {
      console.log(error);
      console.error("Error deleting file");
      return false;
    });
};
