const ArtistService = require('../services/artist.service');
const asyncHandler = require('../utils/asyncHandler');

class ArtistController {
  getAllArtists = asyncHandler(async (req, res) => {
    const result = await ArtistService.getAllArtists(req.query);
    res.json({ success: true, ...result });
  });

  getArtistById = asyncHandler(async (req, res) => {
    const artist = await ArtistService.getArtistById(req.params.id, req.user?.id || null);
    res.json({ success: true, artist });
  });

  createArtist = asyncHandler(async (req, res) => {
    const artist = await ArtistService.createArtist(req.body);
    res.status(201).json({ success: true, artist });
  });

  updateArtist = asyncHandler(async (req, res) => {
    const artist = await ArtistService.updateArtist(req.params.id, req.body);
    res.json({ success: true, artist });
  });

  deleteArtist = asyncHandler(async (req, res) => {
    const result = await ArtistService.deleteArtist(req.params.id);
    res.json({ success: true, ...result });
  });

  getArtistSongs = asyncHandler(async (req, res) => {
    const songs = await ArtistService.getArtistSongs(req.params.id);
    res.json({ success: true, songs });
  });

  followArtist = asyncHandler(async (req, res) => {
    const result = await ArtistService.followArtist(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  });

  unfollowArtist = asyncHandler(async (req, res) => {
    const result = await ArtistService.unfollowArtist(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  });
}

module.exports = new ArtistController();
