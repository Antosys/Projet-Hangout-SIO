const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');
const rateLowLimitMiddleware = require('../middlewares/rateLowLimitMiddleware');
const sanitizeMiddleware = require('../middlewares/sanitizeMiddleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Inscription } = require('../models');



router.get('/random/three', sanitizeMiddleware, eventController.getRandomEvents);



router.get('/', sanitizeMiddleware, authMiddleware, rateLowLimitMiddleware, eventController.getAllEvents);


router.get('/:id', sanitizeMiddleware, authMiddleware, rateLowLimitMiddleware, eventController.getEventById);


router.post('/', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.createEvent);


router.put('/:id', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.updateEvent);


router.delete('/:id', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.deleteEvent);


router.post('/:eventId/join', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.joinEvent);


router.delete('/:eventId/leave', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.leaveEvent);

module.exports = router;


module.exports = router;
