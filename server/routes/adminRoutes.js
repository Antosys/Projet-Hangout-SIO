const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const sanitizeMiddleware = require('../middlewares/sanitizeMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');
const adminRateLimitMiddleware = require('../middlewares/adminRateLimitMiddleware');

router.use(sanitizeMiddleware, authMiddleware, roleMiddleware(['admin']));

router.get('/overview', adminRateLimitMiddleware, adminController.getOverview);

router.get('/users', adminRateLimitMiddleware, adminController.getUsers);
router.patch('/users/:id/role', rateLimitMiddleware, adminController.updateUserRole);
router.delete('/users/:id', rateLimitMiddleware, adminController.deleteUser);

router.get('/events', adminRateLimitMiddleware, adminController.getEvents);
router.delete('/events/:id', rateLimitMiddleware, adminController.deleteEvent);

router.get('/inscriptions', adminRateLimitMiddleware, adminController.getInscriptions);
router.delete('/inscriptions/:id', rateLimitMiddleware, adminController.deleteInscription);

module.exports = router;