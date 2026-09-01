const SoundhelixService = require('../services/soundhelix.service');

class SoundhelixController {
  // GET /api/soundhelix/tracks?limit=&offset=
  getTracks = (req, res) => {
    const result = SoundhelixService.getAllTracks({
      limit: parseInt(req.query.limit, 10),
      offset: parseInt(req.query.offset, 10)
    });
    res.json({ success: true, ...result });
  };

  // GET /api/soundhelix/tracks/:id
  getTrackById = (req, res) => {
    const track = SoundhelixService.getById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Canción no encontrada' });
    }
    res.json({ success: true, track });
  };
}

module.exports = new SoundhelixController();