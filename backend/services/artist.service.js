const { Artist, Album, Song, UserFollow } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class ArtistService {
  async getAllArtists({ search, limit, offset, sort }) {
    const where = {};
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const order = sort === 'popular' ? [['monthlyListeners', 'DESC']] : [['createdAt', 'DESC']];

    const { count, rows } = await Artist.findAndCountAll({
      where,
      order,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    return { total: count, artists: rows };
  }

  async getArtistById(id, currentUserId = null) {
    const artist = await Artist.findByPk(id, {
      include: [
        {
          model: Album,
          as: 'albums',
          include: [
            {
              model: Song,
              as: 'songs',
              include: [
                { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
              ]
            }
          ]
        }
      ]
    });

    if (!artist) {
      throw new ApiError(404, 'Artista no encontrado');
    }

    let isFollowing = false;
    if (currentUserId && artist.userId && artist.userId !== currentUserId) {
      const follow = await UserFollow.findOne({
        where: { followerId: currentUserId, followingId: artist.userId }
      });
      isFollowing = !!follow;
    }

    return { ...artist.toJSON(), isFollowing };
  }

  async createArtist(artistData) {
    const artist = await Artist.create(artistData);
    return artist;
  }

  async updateArtist(id, updateData) {
    const artist = await Artist.findByPk(id);
    if (!artist) {
      throw new ApiError(404, 'Artista no encontrado');
    }
    await artist.update(updateData);
    return artist;
  }

  async deleteArtist(id) {
    const artist = await Artist.findByPk(id);
    if (!artist) {
      throw new ApiError(404, 'Artista no encontrado');
    }
    await artist.destroy();
    return { success: true };
  }

  async getArtistSongs(id) {
    const artist = await Artist.findByPk(id);
    if (!artist) {
      throw new ApiError(404, 'Artista no encontrado');
    }

    const songs = await Song.findAll({
      where: { artistId: id },
      include: [
        { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
      ],
      order: [['plays', 'DESC']]
    });

    return songs;
  }

  async followArtist(userId, artistId) {
    const artist = await Artist.findByPk(artistId);
    if (!artist) {
      throw new ApiError(404, 'Artista no encontrado');
    }
    if (!artist.userId) {
      throw new ApiError(400, 'Este artista no tiene cuenta de usuario para seguir');
    }
    if (userId === artist.userId) {
      throw new ApiError(400, 'No puedes seguirte a ti mismo');
    }

    await UserFollow.findOrCreate({
      where: { followerId: userId, followingId: artist.userId }
    });

    return { success: true };
  }

  async unfollowArtist(userId, artistId) {
    const artist = await Artist.findByPk(artistId);
    if (!artist) {
      throw new ApiError(404, 'Artista no encontrado');
    }
    if (!artist.userId) {
      throw new ApiError(400, 'Este artista no tiene cuenta de usuario para dejar de seguir');
    }

    await UserFollow.destroy({
      where: { followerId: userId, followingId: artist.userId }
    });

    return { success: true };
  }
}

module.exports = new ArtistService();
