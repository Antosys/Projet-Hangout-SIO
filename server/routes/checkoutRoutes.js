const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

/**
 * @swagger
 * tags:
 *   - name: Checkout
 *     description: Verification du paiement Stripe
 */

/**
 * @swagger
 * /api/checkout/verify-checkout:
 *   get:
 *     tags: [Checkout]
 *     summary: Verifier une session de checkout
 *     responses:
 *       200:
 *         description: Session verifiee
 *       400:
 *         description: Session invalide
 */
router.get('/verify-checkout', checkoutController.verifyCheckoutSession);

module.exports = router;
