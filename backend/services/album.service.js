const { Album, Artist, Song, SavedAlbum, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class AlbumService {
  async getAllAlbums({ search, genre, artistId, limit, offset }) {
    const where = {};

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    if (genre) where.genre = genre;
    if (artistId) where.artistId = artistId;

    const { count, rows } = await Album.findAndCountAll({
      where,
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    return { total: count, albums: rows };
  }

  async getAlbumById(id, currentUserId) {
    const album = await Album.findByPk(id, {
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name', 'image'] },
        {
          model: Song,
          as: 'songs',
          include: [
            { model: Artist, as: 'artist', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    if (!album) {
      throw new ApiError(404, 'Álbum no encontrado');
    }

    if (currentUserId) {
      const saved = await SavedAlbum.findOne({ where: { albumId: id, userId: currentUserId } });
      album.dataValues.isSaved = !!saved;
    }

    return album;
  }

  async createAlbum(albumData) {
    const album = await Album.create(albumData);
    return this.getAlbumById(album.id);
  }

  async updateAlbum(id, updateData) {
    const album = await Album.findByPk(id);
    if (!album) {
      throw new ApiError(404, 'Álbum no encontrado');
    }
    await album.update(updateData);
    return this.getAlbumById(id);
  }

  async deleteAlbum(id) {
    const album = await Album.findByPk(id);
    if (!album) {
      throw new ApiError(404, 'Álbum no encontrado');
    }
    await album.destroy();
    return { success: true };
  }

  async getAlbumSongs(id) {
    const album = await this.getAlbumById(id);
    return album.songs;
  }

  async isAlbumSaved(albumId, userId) {
    const found = await SavedAlbum.findOne({ where: { albumId, userId } });
    return !!found;
  }

  async toggleSaveAlbum(albumId, userId) {
    const album = await Album.findByPk(albumId);
    if (!album) {
      throw new ApiError(404, 'Álbum no encontrado');
    }
    const existing = await SavedAlbum.findOne({ where: { albumId, userId } });
    if (existing) {
      await existing.destroy();
      return { saved: false };
    }
    await SavedAlbum.create({ albumId, userId });
    return { saved: true };
  }

  async getSavedAlbums(userId, limit = 20) {
    const user = await User.findByPk(userId, {
      include: [{
        association: 'savedAlbums',
        include: [
          { model: Artist, as: 'artist', attributes: ['id', 'name'] }
        ]
      }]
    });
    if (!user) return [];
    const albums = user.savedAlbums || [];
    const ordered = albums.slice(-limit).reverse();
    return ordered;
  }
}

module.exports = new AlbumService();
