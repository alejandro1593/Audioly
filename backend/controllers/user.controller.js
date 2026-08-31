const UserService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

class UserController {
  getProfile = asyncHandler(async (req, res) => {
    const user = await UserService.getProfile(req.params.id);
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
}

module.exports = new UserController();
