const JamendoService = require('../services/jamendo.service');

class JamendoController {
  searchTracks = async (req, res, next) => {
    try {
      const { q, limit, offset, tags, order } = req.query;
      const result = await JamendoService.searchTracks(q, {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
        tags,
        order
      });
      if (result.error) {
        return res.status(200).json({ success: true, tracks: [], total: 0, message: result.error });
      }
      res.json({ success: true, tracks: result.tracks, total: result.fullcount, error: null });
    } catch (err) {
      next(err);
    }
  };

  featuredTracks = async (req, res, next) => {
    try {
      const { limit, offset, tags, order } = req.query;
      const result = await JamendoService.getFeaturedTracks({
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
        tags,
        order
      });
      if (result.error) {
        return res.status(200).json({ success: true, tracks: [], total: 0, message: result.error });
      }
      res.json({ success: true, tracks: result.tracks, total: result.total, error: null });
    } catch (err) {
      next(err);
    }
  };

  genres = async (req, res, next) => {
    try {
      const result = await JamendoService.getGenres();
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new JamendoController();