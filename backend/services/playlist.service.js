const { Playlist, Song, Artist, Album, User, PlaylistSong, PlaylistLike, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

class PlaylistService {
  async getAllPlaylists({ userId, limit, offset }) {
    const where = userId ? { userId } : { isPublic: true };

    const { count, rows } = await Playlist.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username'] }
      ],
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM "playlist_likes" WHERE "playlist_id" = "Playlist"."id")'), 'likesCount']
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    return { total: count, playlists: rows };
  }

  async getPlaylistById(id, currentUserId) {
    const playlist = await Playlist.findByPk(id, {
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM "playlist_likes" WHERE "playlist_id" = "Playlist"."id")'), 'likesCount'],
          [sequelize.literal(`EXISTS (SELECT 1 FROM "playlist_likes" WHERE "playlist_id" = "Playlist"."id" AND "user_id" = ${parseInt(currentUserId) || 0})`), 'likedByCurrentUser']
        ]
      },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username', 'avatar'] },
        {
          model: Song,
          as: 'songs',
          through: { attributes: [] },
          include: [
            { model: Artist, as: 'artist', attributes: ['id', 'name'] },
            { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
          ]
        }
      ]
    });

    if (!playlist) {
      throw new ApiError(404, 'Playlist no encontrada');
    }

    // Si la playlist es privada y el usuario no es el dueño
    if (!playlist.isPublic && playlist.userId !== currentUserId) {
      throw new ApiError(403, 'No tienes permisos para ver esta playlist');
    }

    return playlist;
  }

  async createPlaylist(userId, playlistData) {
    const playlist = await Playlist.create({
      ...playlistData,
      userId
    });

    return this.getPlaylistById(playlist.id, userId);
  }

  async updatePlaylist(id, userId, updateData) {
    const playlist = await Playlist.findByPk(id);

    if (!playlist) {
      throw new ApiError(404, 'Playlist no encontrada');
    }

    if (playlist.userId !== userId) {
      throw new ApiError(403, 'No tienes permisos para editar esta playlist');
    }

    await playlist.update(updateData);
    return this.getPlaylistById(id, userId);
  }

  async deletePlaylist(id, userId) {
    const playlist = await Playlist.findByPk(id);

    if (!playlist) {
      throw new ApiError(404, 'Playlist no encontrada');
    }

    if (playlist.userId !== userId) {
      throw new ApiError(403, 'No tienes permisos para eliminar esta playlist');
    }

    await playlist.destroy();
    return { success: true };
  }

  async addSong(playlistId, userId, songId) {
    const playlist = await this.getPlaylistById(playlistId, userId);

    // Solo el dueño o colaboradores (si es colaborativa) pueden añadir
    const canEdit = playlist.userId === userId || playlist.isCollaborative;
    if (!canEdit) {
      throw new ApiError(403, 'No tienes permisos para añadir canciones a esta playlist');
    }

    const song = await Song.findByPk(songId);
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }

    await PlaylistSong.findOrCreate({
      where: { playlistId, songId }
    });

    return this.getPlaylistById(playlistId, userId);
  }

  async removeSong(playlistId, userId, songId) {
    const playlist = await this.getPlaylistById(playlistId, userId);

    const canEdit = playlist.userId === userId || playlist.isCollaborative;
    if (!canEdit) {
      throw new ApiError(403, 'No tienes permisos para quitar canciones de esta playlist');
    }

    await PlaylistSong.destroy({
      where: { playlistId, songId }
    });

    return this.getPlaylistById(playlistId, userId);
  }

  async toggleLike(playlistId, userId) {
    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) {
      throw new ApiError(404, 'Playlist no encontrada');
    }

    const [like, created] = await PlaylistLike.findOrCreate({
      where: { playlistId, userId }
    });

    if (!created) {
      await like.destroy();
    }

    return { success: true, liked: created };
  }

  async getLikedPlaylists(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          association: 'likedPlaylists',
          where: { isPublic: true },
          required: false,
          include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }]
        }
      ]
    });

    return user.likedPlaylists;
  }
}

module.exports = new PlaylistService();
