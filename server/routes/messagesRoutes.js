const express = require('express');
const router = express.Router();
const groupChatController = require('../controllers/groupChatController');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: Gestion des messages de group chat
 */

/**
 * @swagger
 * /api/messages/{groupchatId}:
 *   get:
 *     tags: [Messages]
 *     summary: Recuperer les messages d un group chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupchatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages
 */

router.get('/:groupchatId', authMiddleware, messageController.getMessagesByGroupChatId);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Creer un message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Message cree
 */
router.post('/', authMiddleware, messageController.createMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     tags: [Messages]
 *     summary: Supprimer un message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message supprime
 *       403:
 *         description: Action interdite
 */
router.delete('/:id', authMiddleware, authorizationMiddleware, messageController.deleteMessage);

module.exports = router;
