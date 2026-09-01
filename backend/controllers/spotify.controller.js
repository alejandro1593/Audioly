const SpotifyService = require('../services/spotify.service');

class SpotifyController {
  // GET /api/spotify/tracks?limit=&offset=
  getTracks = (req, res) => {
    const result = SpotifyService.getTracks({
      limit: parseInt(req.query.limit, 10),
      offset: parseInt(req.query.offset, 10)
    });
    res.json({ success: true, ...result });
  };
}

module.exports = new SpotifyController();