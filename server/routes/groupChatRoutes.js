const express = require('express');
const router = express.Router();
const groupChatController = require('../controllers/groupChatController');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizationMiddleware = require('../middlewares/authorizationMiddleware');


router.get('/', authMiddleware, groupChatController.getGroupChats);
router.get('/:eventId', authMiddleware, groupChatController.getGroupChatByEventId);

module.exports = router;
