const { User, Song, Artist, Album, ListeningHistory, UserLikedSong, UserFollow, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class UserService {
  async getProfile(userId, currentUserId = null) {
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

    if (currentUserId) {
      const follow = await UserFollow.findOne({
        where: { followerId: currentUserId, followingId: userId }
      });
      user.dataValues.isFollowing = !!follow;
    } else {
      user.dataValues.isFollowing = false;
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

  // Top del usuario: canciones o artistas más escuchados
  // timeRange: 'short_term' (4 semanas) | 'medium_term' (6 meses) | 'long_term' (todo)
  async getTopItems(userId, type = 'tracks', timeRange = 'medium_term', limit = 10) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let since = null;
    if (timeRange === 'short_term') since = new Date(now - 28 * day);
    else if (timeRange === 'medium_term') since = new Date(now - 182 * day);

    const sinceClause = since ? 'AND lh.created_at >= :since' : '';
    const sinceVal = since ? new Date(since).toISOString() : null;

    if (type === 'artists') {
      const rows = await sequelize.query(
        `SELECT s.artist_id, COUNT(*) AS weight
         FROM listening_history lh
         JOIN songs s ON s.id = lh.song_id
         WHERE lh.user_id = :userId ${sinceClause}
         GROUP BY s.artist_id
         ORDER BY weight DESC
         LIMIT :limit`,
        { replacements: { userId, since: sinceVal, limit: parseInt(limit) }, type: sequelize.QueryTypes.SELECT }
      );
      const ids = rows.map((r) => r.artist_id);
      if (ids.length === 0) return [];
      const artists = await Artist.findAll({ where: { id: { [Op.in]: ids } } });
      return ids
        .map((id) => artists.find((a) => a.id === id))
        .filter(Boolean)
        .map((artist, i) => ({ ...artist.dataValues, weight: rows[i].weight }));
    }

    const rows = await sequelize.query(
      `SELECT lh.song_id, COUNT(*) AS weight
       FROM listening_history lh
       WHERE lh.user_id = :userId ${sinceClause}
       GROUP BY lh.song_id
       ORDER BY weight DESC
       LIMIT :limit`,
      { replacements: { userId, since: sinceVal, limit: parseInt(limit) }, type: sequelize.QueryTypes.SELECT }
    );
    const ids = rows.map((r) => r.song_id);
    if (ids.length === 0) return [];
    const songs = await Song.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name'] },
        { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
      ]
    });
    return ids
      .map((id) => songs.find((s) => s.id === id))
      .filter(Boolean)
      .map((song, i) => ({ ...song.dataValues, weight: rows[i].weight }));
  }
}

module.exports = new UserService();
