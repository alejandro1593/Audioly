const PlaylistService = require('../services/playlist.service');
const asyncHandler = require('../utils/asyncHandler');

class PlaylistController {
  getAllPlaylists = asyncHandler(async (req, res) => {
    const userId = req.query.byUser === 'true' ? req.user.id : null;
    const result = await PlaylistService.getAllPlaylists({ userId, ...req.query });
    res.json({ success: true, ...result });
  });

  getPlaylistById = asyncHandler(async (req, res) => {
    const playlist = await PlaylistService.getPlaylistById(req.params.id, req.user.id);
    res.json({ success: true, playlist });
  });

  createPlaylist = asyncHandler(async (req, res) => {
    const playlist = await PlaylistService.createPlaylist(req.user.id, req.body);
    res.status(201).json({ success: true, playlist });
  });

  updatePlaylist = asyncHandler(async (req, res) => {
    const playlist = await PlaylistService.updatePlaylist(req.params.id, req.user.id, req.body);
    res.json({ success: true, playlist });
  });

  deletePlaylist = asyncHandler(async (req, res) => {
    const result = await PlaylistService.deletePlaylist(req.params.id, req.user.id);
    res.json({ success: true, ...result });
  });

  addSong = asyncHandler(async (req, res) => {
    const playlist = await PlaylistService.addSong(req.params.id, req.user.id, req.body.songId);
    res.json({ success: true, playlist });
  });

  removeSong = asyncHandler(async (req, res) => {
    const playlist = await PlaylistService.removeSong(req.params.id, req.user.id, req.params.songId);
    res.json({ success: true, playlist });
  });

  toggleLike = asyncHandler(async (req, res) => {
    const result = await PlaylistService.toggleLike(req.params.id, req.user.id);
    res.json({ success: true, ...result });
  });

  getLikedPlaylists = asyncHandler(async (req, res) => {
    const playlists = await PlaylistService.getLikedPlaylists(req.user.id);
    res.json({ success: true, playlists });
  });
}

module.exports = new PlaylistController();
