const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Get own liked songs
router.get('/liked-songs', userController.getLikedSongs);

// Get listening history
router.get('/history', userController.getHistory);

// Get recommendations
router.get('/recommendations', userController.getRecommendations);
router.get('/me/top', userController.getTopItems);
router.get('/me/recap', userController.getRecap);

// Update profile
router.put('/profile', userController.updateProfile);

// Change password
router.put('/change-password', userController.changePassword);

// Get user profile
router.get('/:id', userController.getProfile);

module.exports = router;
