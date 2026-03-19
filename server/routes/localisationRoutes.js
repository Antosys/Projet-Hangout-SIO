const express = require('express');
const router = express.Router();
const localisationController = require('../controllers/localisationController');
const rateLowLimitMiddleware = require('../middlewares/rateLowLimitMiddleware');


router.get('/', rateLowLimitMiddleware, localisationController.getAllLocalisations);



module.exports = router;
