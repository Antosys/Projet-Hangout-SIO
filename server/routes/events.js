const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');
const rateLowLimitMiddleware = require('../middlewares/rateLowLimitMiddleware');
const sanitizeMiddleware = require('../middlewares/sanitizeMiddleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Inscription } = require('../models');

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Gestion des evenements
 */

/**
 * @swagger
 * /api/events/random/three:
 *   get:
 *     tags: [Events]
 *     summary: Recuperer trois evenements aleatoires
 *     responses:
 *       200:
 *         description: Liste des evenements
 */

router.get('/random/three', sanitizeMiddleware, eventController.getRandomEvents);


/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Recuperer tous les evenements
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des evenements
 *       401:
 *         description: Non autorise
 */

router.get('/', sanitizeMiddleware, authMiddleware, rateLowLimitMiddleware, eventController.getAllEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Recuperer un evenement par ID
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
 *         description: Detail de l evenement
 *       404:
 *         description: Evenement introuvable
 */

router.get('/:id', sanitizeMiddleware, authMiddleware, rateLowLimitMiddleware, eventController.getEventById);

/**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Creer un evenement
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
 *         description: Evenement cree
 *       400:
 *         description: Requete invalide
 */

router.post('/', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Mettre a jour un evenement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Evenement mis a jour
 *       404:
 *         description: Evenement introuvable
 */

router.put('/:id', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Supprimer un evenement
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
 *         description: Evenement supprime
 *       404:
 *         description: Evenement introuvable
 */

router.delete('/:id', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.deleteEvent);

/**
 * @swagger
 * /api/events/{eventId}/join:
 *   post:
 *     tags: [Events]
 *     summary: Rejoindre un evenement
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
 *         description: Participation enregistree
 */

router.post('/:eventId/join', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.joinEvent);

/**
 * @swagger
 * /api/events/{eventId}/leave:
 *   delete:
 *     tags: [Events]
 *     summary: Quitter un evenement
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
 *         description: Participation supprimee
 */

router.delete('/:eventId/leave', sanitizeMiddleware, authMiddleware, rateLimitMiddleware, eventController.leaveEvent);

module.exports = router;
