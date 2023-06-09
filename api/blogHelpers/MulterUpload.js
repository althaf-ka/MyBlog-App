import multer from "multer";

const storage = destination =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${".jpg"}`);
    },
  });

export const postUpload = multer({ storage: storage("./uploads/postImages/") });
export const profileUpload = multer({
  storage: storage("./uploads/profilePicture/"),
});
