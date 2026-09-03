const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album.controller');
const { protect, authorize, optionalAuth } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', albumController.getAllAlbums);
router.get('/saved', protect, albumController.getSavedAlbums);
router.get('/:id', optionalAuth, albumController.getAlbumById);
router.get('/:id/songs', albumController.getAlbumSongs);
router.post('/:id/save', protect, albumController.toggleSaveAlbum);

// Admin/Artist routes
router.post('/',
  protect,
  authorize('admin', 'artist'),
  albumController.createAlbum
);

router.put('/:id',
  protect,
  authorize('admin', 'artist'),
  albumController.updateAlbum
);

router.delete('/:id',
  protect,
  authorize('admin'),
  albumController.deleteAlbum
);

module.exports = router;
