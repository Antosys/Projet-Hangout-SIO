const express = require('express');
const router = express.Router();
const groupChatController = require('../controllers/groupChatController');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizationMiddleware = require('../middlewares/authorizationMiddleware');


router.get('/:groupchatId', authMiddleware, messageController.getMessagesByGroupChatId);
router.post('/', authMiddleware, messageController.createMessage);
router.delete('/:id', authMiddleware, authorizationMiddleware, messageController.deleteMessage);

module.exports = router;
