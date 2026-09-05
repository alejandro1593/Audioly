const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Mine notifications
router.get('/', notificationController.getMine);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markRead);

module.exports = router;