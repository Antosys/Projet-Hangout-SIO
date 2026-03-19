const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');


router.get('/profile', authMiddleware, userController.getProfile);

router.get('/stats', authMiddleware, userController.getUserStats);


router.put('/profile', authMiddleware, userController.updateProfile);


router.post('/change-password', authMiddleware, userController.changePassword);


router.delete('/profile', authMiddleware, userController.deleteAccount);

module.exports = router;
