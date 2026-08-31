const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Create playlist
router.post('/', playlistController.createPlaylist);

// Get playlists (public or by user)
router.get('/', playlistController.getAllPlaylists);

// Get single playlist
router.get('/:id', playlistController.getPlaylistById);

// Update playlist
router.put('/:id', playlistController.updatePlaylist);

// Delete playlist
router.delete('/:id', playlistController.deletePlaylist);

// Add song to playlist
router.post('/:id/songs', playlistController.addSong);

// Remove song from playlist
router.delete('/:id/songs/:songId', playlistController.removeSong);

module.exports = router;
