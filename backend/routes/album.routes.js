const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);
router.get('/:id/songs', albumController.getAlbumSongs);

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
