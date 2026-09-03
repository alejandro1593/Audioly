const UserService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

class UserController {
  getProfile = asyncHandler(async (req, res) => {
    const user = await UserService.getProfile(req.params.id, req.user?.id);
    res.json({ success: true, user });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await UserService.updateProfile(req.user.id, req.body);
    res.json({ success: true, user });
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await UserService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, ...result });
  });

  getLikedSongs = asyncHandler(async (req, res) => {
    const songs = await UserService.getLikedSongs(req.user.id);
    res.json({ success: true, songs });
  });

  getHistory = asyncHandler(async (req, res) => {
    const history = await UserService.getHistory(req.user.id);
    res.json({ success: true, history });
  });

  getRecommendations = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 12;
    const songs = await UserService.getRecommendations(req.user.id, limit);
    res.json({ success: true, songs });
  });

  getTopItems = asyncHandler(async (req, res) => {
    const type = req.query.type === 'artists' ? 'artists' : 'tracks';
    const timeRange = ['short_term', 'medium_term', 'long_term'].includes(req.query.time_range)
      ? req.query.time_range
      : 'medium_term';
    const limit = parseInt(req.query.limit, 10) || 10;
    const items = await UserService.getTopItems(req.user.id, type, timeRange, limit);
    res.json({ success: true, items, type, time_range: timeRange });
  });
}

module.exports = new UserController();
