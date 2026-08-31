const jwt = require('jsonwebtoken');
const { User, Artist, UserFollow } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt.util');

class AuthService {
  async register(userData) {
    const { username, email, password, role } = userData;

    const existing = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    });

    if (existing) {
      throw new ApiError(409, 'El email o username ya está registrado');
    }

    const user = await User.create({ username, email, password, role });
    const tokens = generateTokens(user);

    return { user: user.toSafeObject(), ...tokens };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    // Si el usuario es artista, incluir su perfil de artista
    let artistProfile = null;
    if (user.role === 'artist') {
      artistProfile = await Artist.findOne({ where: { userId: user.id } });
    }

    const tokens = generateTokens(user);
    return { user: user.toSafeObject(), artistProfile, ...tokens };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new ApiError(401, 'Usuario no encontrado');
      }

      const tokens = generateTokens(user);
      return { user: user.toSafeObject(), ...tokens };
    } catch (error) {
      throw new ApiError(401, 'Refresh token inválido o expirado');
    }
  }

  async followUser(userId, targetUserId) {
    if (userId === targetUserId) {
      throw new ApiError(400, 'No puedes seguirte a ti mismo');
    }

    await UserFollow.findOrCreate({
      where: { followerId: userId, followingId: targetUserId }
    });

    return { success: true };
  }

  async unfollowUser(userId, targetUserId) {
    await UserFollow.destroy({
      where: { followerId: userId, followingId: targetUserId }
    });

    return { success: true };
  }
}

module.exports = new AuthService();
