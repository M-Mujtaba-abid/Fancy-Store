import multer from "multer";
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
}

export const upload = multer({ storage, fileFilter });
