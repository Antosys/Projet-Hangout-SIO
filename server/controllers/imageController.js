const path = require('path');
const multer = require('multer');
const {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  UPLOAD_DIR,
  buildStoredFilename,
  ensureUploadDir,
} = require('../utils/imageStorage');

ensureUploadDir();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, buildStoredFilename(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
      return;
    }

    cb(null, true);
  },
});

const uploadImage = (req, res) => {
  try {
    const allowedRoles = new Set(['admin', 'organizer', 'organisateur']);

    if (!req.user || !allowedRoles.has(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé pour le téléchargement d\'images.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image téléchargée.' });
    }
    
    res.status(201).json({
      message: 'Image téléchargée avec succès.',
      filename: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du téléchargement de l\'image.' });
  }
};

module.exports = {
  upload,
  uploadImage,
};
