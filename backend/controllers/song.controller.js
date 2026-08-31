const SongService = require('../services/song.service');
const asyncHandler = require('../utils/asyncHandler');

class SongController {
  getAllSongs = asyncHandler(async (req, res) => {
    const result = await SongService.getAllSongs(req.query);
    res.json({ success: true, ...result });
  });

  getTopSongs = asyncHandler(async (req, res) => {
    const songs = await SongService.getTopSongs(req.query.limit || 20);
    res.json({ success: true, songs });
  });

  getSongById = asyncHandler(async (req, res) => {
    const song = await SongService.getSongById(req.params.id);
    res.json({ success: true, song });
  });

  createSong = asyncHandler(async (req, res) => {
    const song = await SongService.createSong(req.body);
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
}

module.exports = new SongController();
