const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const sanitize = require('../middlewares/sanitizeMiddleware');
const rateLimitLogin = require('../middlewares/rateLimitMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentification et verification JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Inscrire un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Utilisateur cree
 *       400:
 *         description: Requete invalide
 */

router.post('/register', sanitize, rateLimitLogin, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connecter un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Connexion reussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', sanitize, authController.login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags: [Auth]
 *     summary: Verifier le token JWT courant
 *     responses:
 *       200:
 *         description: Token valide
 *       401:
 *         description: Token invalide ou absent
 */

router.get('/verify', authController.verify);

module.exports = router;
