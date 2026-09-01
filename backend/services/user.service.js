const { User, Song, Artist, Album, ListeningHistory, UserLikedSong, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class UserService {
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password'],
        include: [
          [
            sequelize.literal('(SELECT COUNT(*) FROM "user_follows" WHERE "following_id" = "User"."id")'),
            'followersCount'
          ],
          [
            sequelize.literal('(SELECT COUNT(*) FROM "user_follows" WHERE "follower_id" = "User"."id")'),
            'followingCount'
          ]
        ]
      },
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
          through: { attributes: [] },
          include: [
            { model: Artist, as: 'artist', attributes: ['id', 'name', 'image'] },
            { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
          ]
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

  // Recomendaciones basadas en historial y me gusta
  async getRecommendations(userId, limit = 12) {
    const songIds = await sequelize.query(
      `SELECT DISTINCT song_id FROM (
        SELECT song_id FROM listening_history WHERE user_id = :userId
        UNION
        SELECT song_id FROM user_liked_songs WHERE user_id = :userId
      ) t`,
      { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
    );
    const listenedIds = songIds.map((s) => s.song_id);

    if (listenedIds.length === 0) {
      // Sin historial: devolver las más escuchadas globales
      return Song.findAll({
        include: [
          { model: Artist, as: 'artist', attributes: ['id', 'name'] },
          { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
        ],
        order: [['plays', 'DESC']],
        limit
      });
    }

    // Obtener géneros/artistas preferidos
    const prefs = await sequelize.query(
      `SELECT genre, artist_id, COUNT(*) AS peso
       FROM songs WHERE id IN (:ids)
       GROUP BY genre, artist_id
       ORDER BY peso DESC`,
      { replacements: { ids: listenedIds }, type: sequelize.QueryTypes.SELECT }
    );
    const genres = [...new Set(prefs.filter((p) => p.genre).map((p) => p.genre))];
    const artistIds = [...new Set(prefs.map((p) => p.artist_id))];

    const where = {
      id: { [Op.notIn]: listenedIds }
    };
    const or = [];
    if (genres.length) or.push({ genre: { [Op.in]: genres } });
    if (artistIds.length) or.push({ artistId: { [Op.in]: artistIds } });
    if (or.length) where[Op.or] = or;

    return Song.findAll({
      where,
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name'] },
        { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
      ],
      order: [['plays', 'DESC']],
      limit
    });
  }
}

module.exports = new UserService();
