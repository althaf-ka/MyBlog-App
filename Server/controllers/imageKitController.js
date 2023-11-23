import { imagekitDeleteFile } from "../services/imageKitService.js";
import imagekit from "../utils/imageKit.js";

export const imagekitAuthenticator = async (req, res, next) => {
  try {
    const authResponse = imagekit.getAuthenticationParameters();
    res.send(authResponse);
  } catch (err) {
    next(err);
  }
};

export const imageKitRemoveFile = async (req, res, next) => {
  const { fileId } = req.body;
  try {
    await imagekitDeleteFile(fileId);
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting image" });
  }
};
