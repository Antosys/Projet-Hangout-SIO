const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const sanitize = require('../middlewares/sanitizeMiddleware');
const rateLimitLogin = require('../middlewares/rateLimitMiddleware');


router.post('/register', sanitize, rateLimitLogin, authController.register);
router.post('/login', sanitize, authController.login);


router.get('/verify', authController.verify);

module.exports = router;
