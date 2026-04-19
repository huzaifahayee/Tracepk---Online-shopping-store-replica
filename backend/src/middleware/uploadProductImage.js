const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../../public/uploads/products");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext : ".jpg";
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype || "");
  if (!ok) {
    cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed"));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = {
  uploadProductImageOnce: upload.single("image"),
};
