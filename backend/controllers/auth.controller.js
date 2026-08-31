const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, ...result });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json({ success: true, ...result });
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    res.json({ success: true, ...result });
  });

  getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user.toSafeObject() });
  });

  followUser = asyncHandler(async (req, res) => {
    const result = await AuthService.followUser(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  });

  unfollowUser = asyncHandler(async (req, res) => {
    const result = await AuthService.unfollowUser(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  });
}

module.exports = new AuthController();
