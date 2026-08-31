const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcast.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', podcastController.getAllPodcasts);

// Protected routes (any user can listen)
router.get('/:id', protect, podcastController.getPodcastById);
router.get('/:id/episodes/:episodeId', protect, podcastController.getEpisode);

// Admin/Artist routes
router.post('/',
  protect,
  authorize('admin', 'artist'),
  podcastController.createPodcast
);

router.post('/:id/episodes',
  protect,
  authorize('admin', 'artist'),
  podcastController.addEpisode
);

router.put('/:id',
  protect,
  authorize('admin', 'artist'),
  podcastController.updatePodcast
);

router.delete('/:id',
  protect,
  authorize('admin'),
  podcastController.deletePodcast
);

module.exports = router;
