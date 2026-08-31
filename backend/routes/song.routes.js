const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Public routes
router.get('/', songController.getAllSongs);
router.get('/top', songController.getTopSongs);
router.get('/:id', songController.getSongById);
router.get('/:id/lyrics', songController.getLyrics);

// Protected routes (any authenticated user)
router.post('/:id/play', protect, songController.recordPlay);
router.post('/:id/like', protect, songController.likeSong);
router.delete('/:id/like', protect, songController.unlikeSong);

// Admin/Artist routes
router.post('/',
  protect,
  authorize('admin', 'artist'),
  upload.single('audio'),
  songController.createSong
);

router.put('/:id',
  protect,
  authorize('admin', 'artist'),
  songController.updateSong
);

router.delete('/:id',
  protect,
  authorize('admin'),
  songController.deleteSong
);

module.exports = router;
