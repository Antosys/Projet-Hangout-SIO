const express = require('express');
const router = express.Router();
const groupChatController = require('../controllers/groupChatController');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   - name: GroupChats
 *     description: Gestion des conversations de groupe
 */

/**
 * @swagger
 * /api/groupchats:
 *   get:
 *     tags: [GroupChats]
 *     summary: Recuperer les group chats de l utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des group chats
 */

router.get('/', authMiddleware, groupChatController.getGroupChats);

/**
 * @swagger
 * /api/groupchats/{eventId}:
 *   get:
 *     tags: [GroupChats]
 *     summary: Recuperer un group chat par evenement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group chat trouve
 *       404:
 *         description: Group chat introuvable
 */
router.get('/:eventId', authMiddleware, groupChatController.getGroupChatByEventId);

module.exports = router;
