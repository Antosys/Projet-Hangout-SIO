const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestion du profil utilisateur
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     tags: [Users]
 *     summary: Recuperer le profil utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil recupere
 *       401:
 *         description: Non autorise
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     tags: [Users]
 *     summary: Recuperer les statistiques utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques recuperees
 */
router.get('/stats', authMiddleware, userController.getUserStats);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     tags: [Users]
 *     summary: Mettre a jour le profil utilisateur
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
 *       200:
 *         description: Profil mis a jour
 */
router.put('/profile', authMiddleware, userController.updateProfile);

/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Changer le mot de passe utilisateur
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
 *       200:
 *         description: Mot de passe mis a jour
 */
router.post('/change-password', authMiddleware, userController.changePassword);

/**
 * @swagger
 * /api/user/profile:
 *   delete:
 *     tags: [Users]
 *     summary: Supprimer le compte utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte supprime
 */
router.delete('/profile', authMiddleware, userController.deleteAccount);

module.exports = router;
