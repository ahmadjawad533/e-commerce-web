// config/multer.js
// Configures multer for handling product image uploads.
// Files are saved to /public/uploads with a unique timestamped filename.

const multer = require('multer');
const path   = require('path');

// ── Where and how to store uploaded files ────────────────────────────────────
const storage = multer.diskStorage({

  // Save files into public/uploads so they are served as static assets
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },

  // Build a unique filename: timestamp-originalname  e.g. 1716000000000-shirt.jpg
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  },
});

// ── Only allow image files ────────────────────────────────────────────────────
function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk  = allowed.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);  // accept the file
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = upload;
