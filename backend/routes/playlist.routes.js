const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// Create playlist
router.post('/', playlistController.createPlaylist);

// Get playlists (public or by user)
router.get('/', playlistController.getAllPlaylists);

// Get liked playlists by current user
router.get('/liked', playlistController.getLikedPlaylists);

// Collaborators
router.get('/:id/collaborators', playlistController.getCollaborators);
router.post('/:id/collaborators', playlistController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', playlistController.removeCollaborator);

// Get single playlist
router.get('/:id', playlistController.getPlaylistById);

// Like / unlike playlist
router.post('/:id/like', playlistController.toggleLike);

// Update playlist
router.put('/:id', playlistController.updatePlaylist);

// Delete playlist
router.delete('/:id', playlistController.deletePlaylist);

// Add song to playlist
router.post('/:id/songs', playlistController.addSong);

// Remove song from playlist
router.delete('/:id/songs/:songId', playlistController.removeSong);

// Reorder songs in playlist
router.put('/:id/reorder', playlistController.reorderSongs);

module.exports = router;
