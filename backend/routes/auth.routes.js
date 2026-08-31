const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');

// Register
router.post('/register',
  validate([
    body('username').isLength({ min: 3, max: 50 }).withMessage('Username debe tener entre 3 y 50 caracteres'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['user', 'artist']).withMessage('Rol inválido')
  ]),
  authController.register
);

// Login
router.post('/login',
  validate([
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida')
  ]),
  authController.login
);

// Refresh token
router.post('/refresh-token',
  validate([
    body('refreshToken').notEmpty().withMessage('Refresh token requerido')
  ]),
  authController.refreshToken
);

// Get current user
router.get('/me', protect, authController.getMe);

// Follow/Unfollow
router.post('/:id/follow', protect, authController.followUser);
router.delete('/:id/follow', protect, authController.unfollowUser);

// User profile routes
router.get('/:id/profile', userController.getProfile);

module.exports = router;
