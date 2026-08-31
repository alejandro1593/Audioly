const { User } = require('../models');
const ApiError = require('../utils/ApiError');

class UserService {
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          association: 'playlists',
          where: { isPublic: true },
          required: false
        }
      ]
    });

    if (!user) {
      throw new ApiError(404, 'Usuario no encontrado');
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const { username, avatar } = updateData;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      if (username) user.username = username;
      if (avatar) user.avatar = avatar;

      await user.save();
      return user.toSafeObject();
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ApiError(409, 'El nombre de usuario ya está en uso');
      }
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'Usuario no encontrado');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Contraseña actual incorrecta');
    }

    user.password = newPassword;
    await user.save();
    return { success: true };
  }

  async getLikedSongs(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          association: 'likedSongs',
          through: { attributes: [] }
        }
      ]
    });

    return user.likedSongs;
  }

  async getHistory(userId) {
    const history = await User.findByPk(userId, {
      include: [
        {
          association: 'listeningHistory',
          include: [
            {
              association: 'song',
              include: [
                { association: 'artist', attributes: ['id', 'name'] },
                { association: 'album', attributes: ['id', 'title', 'coverImage'] }
              ]
            }
          ]
        }
      ]
    });

    return history.listeningHistory;
  }
}

module.exports = new UserService();
