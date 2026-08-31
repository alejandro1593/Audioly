const AlbumService = require('../services/album.service');
const asyncHandler = require('../utils/asyncHandler');

class AlbumController {
  getAllAlbums = asyncHandler(async (req, res) => {
    const result = await AlbumService.getAllAlbums(req.query);
    res.json({ success: true, ...result });
  });

  getAlbumById = asyncHandler(async (req, res) => {
    const album = await AlbumService.getAlbumById(req.params.id);
    res.json({ success: true, album });
  });

  createAlbum = asyncHandler(async (req, res) => {
    const album = await AlbumService.createAlbum(req.body);
    res.status(201).json({ success: true, album });
  });

  updateAlbum = asyncHandler(async (req, res) => {
    const album = await AlbumService.updateAlbum(req.params.id, req.body);
    res.json({ success: true, album });
  });

  deleteAlbum = asyncHandler(async (req, res) => {
    const result = await AlbumService.deleteAlbum(req.params.id);
    res.json({ success: true, ...result });
  });

  getAlbumSongs = asyncHandler(async (req, res) => {
    const songs = await AlbumService.getAlbumSongs(req.params.id);
    res.json({ success: true, songs });
  });
}

module.exports = new AlbumController();
