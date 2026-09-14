import multer from "multer";
const storage = multer.memoryStorage();

// ✅ Updated fileFilter: ab images aur videos dono allow hain
function fileFilter(req, file, cb) {
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  const videoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
  const allowedTypes = [...imageTypes, ...videoTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV, AVI) files are allowed!"), false);
  }
}

export const upload = multer({ storage, fileFilter });
export const uploadWithLimits = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // ✅ 50MB file size for videos
    files: 5,
  },
});
export const uploadProductAndVariants = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // ✅ 50MB file size for videos
    files: 12, // 5 images + 1 video + 6 variant images
  },
});
