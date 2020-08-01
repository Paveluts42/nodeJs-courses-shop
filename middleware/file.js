const multer = require("multer");
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "images");
  },
  filename(req, file, cb) {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
const fileFilter = (req, file, callback) => {
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
});
