const SongService = require('../services/song.service');
const asyncHandler = require('../utils/asyncHandler');

class SongController {
  getAllSongs = asyncHandler(async (req, res) => {
    const result = await SongService.getAllSongs(req.query);
    res.json({ success: true, ...result });
  });

  getTopSongs = asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const result = await SongService.getTopSongs(limit || 20, offset || 0);
    res.json({ success: true, ...result });
  });

  getSongById = asyncHandler(async (req, res) => {
    const song = await SongService.getSongById(req.params.id);
    res.json({ success: true, song });
  });

  createSong = asyncHandler(async (req, res) => {
    const songData = { ...req.body };
    if (req.file) {
      songData.url = `/uploads/${req.file.filename}`;
    }
    const song = await SongService.createSong(songData);
    res.status(201).json({ success: true, song });
  });

  updateSong = asyncHandler(async (req, res) => {
    const song = await SongService.updateSong(req.params.id, req.body);
    res.json({ success: true, song });
  });

  deleteSong = asyncHandler(async (req, res) => {
    const result = await SongService.deleteSong(req.params.id);
    res.json({ success: true, ...result });
  });

  recordPlay = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const result = await SongService.recordPlay(userId, req.params.id, req.body.durationPlayed);
    res.json({ success: true, ...result });
  });

  likeSong = asyncHandler(async (req, res) => {
    const result = await SongService.likeSong(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  });

  unlikeSong = asyncHandler(async (req, res) => {
    const result = await SongService.unlikeSong(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  });

  getLyrics = asyncHandler(async (req, res) => {
    const song = await SongService.getLyrics(req.params.id);
    res.json({ success: true, song });
  });

  getComments = asyncHandler(async (req, res) => {
    const comments = await SongService.getComments(req.params.id);
    res.json({ success: true, comments });
  });

  addComment = asyncHandler(async (req, res) => {
    const comment = await SongService.addComment(req.user.id, req.params.id, req.body.text);
    res.status(201).json({ success: true, comment });
  });

  deleteComment = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === 'admin';
    const result = await SongService.deleteComment(req.params.commentId, req.user.id, isAdmin);
    res.json({ success: true, ...result });
  });
}

module.exports = new SongController();
