const { Playlist, Song, Artist, Album, User, PlaylistSong, PlaylistLike, PlaylistCollaborator, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');

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
          through: { attributes: ['position'] },
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

    let isCollaborator = false;
    if (currentUserId) {
      const collab = await PlaylistCollaborator.findOne({
        where: { playlistId: id, userId: currentUserId }
      });
      isCollaborator = !!collab;
    }

    // Si la playlist es privada y el usuario no es el dueño ni colaborador
    if (!playlist.isPublic && playlist.userId !== currentUserId && !isCollaborator) {
      throw new ApiError(403, 'No tienes permisos para ver esta playlist');
    }

    const isOwner = playlist.userId === currentUserId;
    playlist.dataValues.isCollaborator = isCollaborator;
    playlist.dataValues.isOwner = isOwner;
    playlist.dataValues.canEdit = isOwner || (playlist.isCollaborative && isCollaborator);

    if (playlist.songs && playlist.songs.length) {
      const needsOrder = playlist.songs.every((s) => !s.PlaylistSong || s.PlaylistSong.position === 0);
      if (needsOrder) {
        for (let i = 0; i < playlist.songs.length; i++) {
          await PlaylistSong.update(
            { position: i + 1 },
            { where: { playlistId: id, songId: playlist.songs[i].id } }
          );
        }
      }
      playlist.songs.sort((a, b) => (a.PlaylistSong?.position || 0) - (b.PlaylistSong?.position || 0));
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
    const canEdit = await this.canEditPlaylist(playlistId, userId, playlist);
    if (!canEdit) {
      throw new ApiError(403, 'No tienes permisos para añadir canciones a esta playlist');
    }

    const song = await Song.findByPk(songId);
    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }

    const [entry, created] = await PlaylistSong.findOrCreate({
      where: { playlistId, songId }
    });
    if (created) {
      const maxPos = await PlaylistSong.max('position', { where: { playlistId } });
      await entry.update({ position: (maxPos || 0) + 1 });
    }

    return this.getPlaylistById(playlistId, userId);
  }

  async removeSong(playlistId, userId, songId) {
    const playlist = await this.getPlaylistById(playlistId, userId);

    const canEdit = await this.canEditPlaylist(playlistId, userId, playlist);
    if (!canEdit) {
      throw new ApiError(403, 'No tienes permisos para quitar canciones de esta playlist');
    }

    await PlaylistSong.destroy({
      where: { playlistId, songId }
    });

    return this.getPlaylistById(playlistId, userId);
  }

  async reorderSongs(playlistId, userId, orderedSongIds) {
    const playlist = await this.getPlaylistById(playlistId, userId);

    const canEdit = await this.canEditPlaylist(playlistId, userId, playlist);
    if (!canEdit) {
      throw new ApiError(403, 'No tienes permisos para reordenar esta playlist');
    }

    if (!Array.isArray(orderedSongIds) || orderedSongIds.length === 0) {
      throw new ApiError(400, 'Lista de canciones inválida');
    }

    const existing = await PlaylistSong.findAll({ where: { playlistId } });
    const existingIds = new Set(existing.map((e) => e.songId));
    const positions = orderedSongIds.filter((id) => existingIds.has(id));

    for (let i = 0; i < positions.length; i++) {
      await PlaylistSong.update(
        { position: i + 1 },
        { where: { playlistId, songId: positions[i] } }
      );
    }

    let offset = positions.length;
    for (const e of existing) {
      if (!positions.includes(e.songId)) {
        await PlaylistSong.update({ position: ++offset }, { where: { id: e.id } });
      }
    }

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

  async canEditPlaylist(playlistId, userId, playlist = null) {
    if (!playlist) {
      playlist = await Playlist.findByPk(playlistId);
    }
    if (playlist.userId === userId) return true;
    if (!playlist.isCollaborative) return false;
    const collaborator = await PlaylistCollaborator.findOne({
      where: { playlistId, userId }
    });
    return !!collaborator;
  }

  async getCollaborators(playlistId, userId) {
    const playlist = await Playlist.findByPk(playlistId, {
      include: [{
        association: 'collaborators',
        attributes: ['id', 'username']
      }]
    });
    if (!playlist) throw new ApiError(404, 'Playlist no encontrada');
    if (playlist.userId !== userId) {
      throw new ApiError(403, 'Solo el propietario puede ver los colaboradores');
    }
    return playlist.collaborators || [];
  }

  async addCollaborator(playlistId, userId, collaboratorId) {
    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) throw new ApiError(404, 'Playlist no encontrada');
    if (playlist.userId !== userId) {
      throw new ApiError(403, 'Solo el propietario puede añadir colaboradores');
    }
    if (collaboratorId === playlist.userId) {
      throw new ApiError(400, 'El propietario no puede ser colaborador');
    }
    const target = await User.findByPk(collaboratorId);
    if (!target) throw new ApiError(404, 'Usuario no encontrado');

    await PlaylistCollaborator.findOrCreate({
      where: { playlistId, userId: collaboratorId }
    });
    return this.getCollaborators(playlistId, userId);
  }

  async removeCollaborator(playlistId, userId, collaboratorId) {
    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) throw new ApiError(404, 'Playlist no encontrada');
    if (playlist.userId !== userId) {
      throw new ApiError(403, 'Solo el propietario puede quitar colaboradores');
    }
    await PlaylistCollaborator.destroy({
      where: { playlistId, userId: collaboratorId }
    });
    return this.getCollaborators(playlistId, userId);
  }

  async generateShareToken(playlistId, userId) {
    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) throw new ApiError(404, 'Playlist no encontrada');
    if (playlist.userId !== userId) {
      throw new ApiError(403, 'Solo el propietario puede compartir esta playlist');
    }
    const token = jwt.sign(
      { playlistId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    return token;
  }

  async getSharedPlaylist(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError(400, 'Enlace de playlist inválido o expirado');
    }
    if (!decoded.playlistId) {
      throw new ApiError(400, 'Enlace de playlist inválido');
    }

    const playlist = await Playlist.findByPk(decoded.playlistId, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username', 'avatar'] },
        {
          model: Song,
          as: 'songs',
          through: { attributes: ['position'] },
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

    if (playlist.songs && playlist.songs.length) {
      const needsOrder = playlist.songs.every((s) => !s.PlaylistSong || s.PlaylistSong.position === 0);
      if (needsOrder) {
        for (let i = 0; i < playlist.songs.length; i++) {
          await PlaylistSong.update(
            { position: i + 1 },
            { where: { playlistId: playlist.id, songId: playlist.songs[i].id } }
          );
        }
      }
      playlist.songs.sort((a, b) => (a.PlaylistSong?.position || 0) - (b.PlaylistSong?.position || 0));
    }

    return playlist;
  }
}

module.exports = new PlaylistService();
