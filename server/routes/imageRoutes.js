const express = require('express');
const multer = require('multer');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/imageController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLowLimitMiddleware = require('../middlewares/rateLowLimitMiddleware');

router.post('/upload', authMiddleware, rateLowLimitMiddleware, (req, res) => {
	upload.single('image')(req, res, (error) => {
		if (error instanceof multer.MulterError) {
			if (error.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ message: 'Image trop volumineuse. Taille maximale: 8 Mo.' });
			}

			return res.status(400).json({ message: 'Seules les images JPG, PNG et WebP sont autorisées.' });
		}

		if (error) {
			return res.status(400).json({ message: error.message || 'Téléversement de l\'image impossible.' });
		}

		return uploadImage(req, res);
	});
});

module.exports = router;
