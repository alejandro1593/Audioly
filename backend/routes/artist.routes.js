const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artist.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', artistController.getAllArtists);
router.get('/:id', artistController.getArtistById);
router.get('/:id/songs', artistController.getArtistSongs);

// Follow / unfollow (usuario autenticado)
router.post('/:id/follow', protect, artistController.followArtist);
router.delete('/:id/follow', protect, artistController.unfollowArtist);

// Admin/Artist routes
router.post('/',
  protect,
  authorize('admin', 'artist'),
  artistController.createArtist
);

router.put('/:id',
  protect,
  authorize('admin', 'artist'),
  artistController.updateArtist
);

router.delete('/:id',
  protect,
  authorize('admin'),
  artistController.deleteArtist
);

module.exports = router;
