const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.get('/verify-checkout', checkoutController.verifyCheckoutSession);

module.exports = router;
