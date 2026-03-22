const express = require('express');
const router = express.Router();
const localisationController = require('../controllers/localisationController');
const rateLowLimitMiddleware = require('../middlewares/rateLowLimitMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Localisations
 *     description: Gestion des localisations
 */

/**
 * @swagger
 * /api/localisations:
 *   get:
 *     tags: [Localisations]
 *     summary: Recuperer toutes les localisations
 *     responses:
 *       200:
 *         description: Liste des localisations
 */

router.get('/', rateLowLimitMiddleware, localisationController.getAllLocalisations);



module.exports = router;
