const { Song, Artist, Album, User, ListeningHistory, UserLikedSong, Comment } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class SongService {
  async getAllSongs({ search, genre, artistId, limit, offset, sort }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { genre: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (genre) where.genre = genre;
    if (artistId) where.artistId = artistId;

    const order = sort === 'popular' ? [['plays', 'DESC']] : [['createdAt', 'DESC']];

    const { count, rows } = await Song.findAndCountAll({
      where,
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name', 'image'] },
        { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
      ],
      order,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    return { total: count, songs: rows };
  }

  async getSongById(id) {
    const song = await Song.findByPk(id, {
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name', 'image'] },
        { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
      ]
    });

    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }

    let similarArtists = song.genre
      ? await Artist.findAll({
          include: [
            {
              model: Song,
              as: 'songs',
              where: { genre: song.genre, artistId: { [Op.ne]: song.artistId } },
              attributes: []
            }
          ],
          limit: 4
        })
      : [];

    // Fallback: artistas populares excluyendo al autor si no hay por género
    if (similarArtists.length < 3) {
      const popular = await Artist.findAll({
        where: { id: { [Op.ne]: song.artistId } },
        order: [['monthlyListeners', 'DESC']],
        limit: 4
      });
      for (const a of popular) {
        if (!similarArtists.some((sa) => sa.id === a.id)) similarArtists.push(a);
        if (similarArtists.length >= 4) break;
      }
    }

    return { ...song.toJSON(), similarArtists };
  }

  async createSong(songData) {
    const song = await Song.create(songData);
    return this.getSongById(song.id);
  }

  async updateSong(id, updateData) {
    const song = await Song.findByPk(id);
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }
    await song.update(updateData);
    return this.getSongById(id);
  }

  async deleteSong(id) {
    const song = await Song.findByPk(id);
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }
    await song.destroy();
    return { success: true };
  }

  async recordPlay(userId, songId, durationPlayed) {
    const song = await Song.findByPk(songId);
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }

    // Incrementar plays
    song.plays += 1;
    await song.save();

    // Registrar en historial si el usuario está autenticado
    if (userId) {
      await ListeningHistory.create({
        userId,
        songId,
        durationPlayed: durationPlayed || 0
      });
    }

    return { success: true, plays: song.plays };
  }

  async likeSong(userId, songId) {
    const song = await Song.findByPk(songId);
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }

    await UserLikedSong.findOrCreate({
      where: { userId, songId }
    });

    return { success: true };
  }

  async unlikeSong(userId, songId) {
    await UserLikedSong.destroy({
      where: { userId, songId }
    });

    return { success: true };
  }

  async getLyrics(id) {
    const song = await Song.findByPk(id, { attributes: ['id', 'title', 'lyrics'] });
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }
    return song;
  }

  async getTopSongs(limit = 20, offset = 0) {
    const { count, rows } = await Song.findAndCountAll({
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name'] },
        { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
      ],
      order: [['plays', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return { total: count, songs: rows };
  }

  async getComments(songId) {
    const song = await Song.findByPk(songId, { attributes: ['id'] });
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }

    return Comment.findAll({
      where: { songId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
  }

  async addComment(userId, songId, text) {
    const song = await Song.findByPk(songId, { attributes: ['id'] });
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }
    if (!text || !text.trim()) {
      throw new ApiError(400, 'El comentario no puede estar vacío');
    }
    if (text.trim().length > 500) {
      throw new ApiError(400, 'El comentario no puede superar los 500 caracteres');
    }

    const comment = await Comment.create({
      userId,
      songId,
      text: text.trim()
    });

    return Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }
      ]
    });
  }

  async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comentario no encontrado');
    }
    if (!isAdmin && comment.userId !== userId) {
      throw new ApiError(403, 'No tienes permiso para eliminar este comentario');
    }
    await comment.destroy();
    return { success: true };
  }
}

module.exports = new SongService();
