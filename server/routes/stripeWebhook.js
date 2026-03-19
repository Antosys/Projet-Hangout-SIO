const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');


router.post('/', express.raw({ type: 'application/json' }), eventController.handleStripeWebhook);

module.exports = router;
