const { Song, Artist, Album, Playlist, Podcast } = require('../models');
const { Op } = require('sequelize');

class SearchService {
  async search(query, { limit = 10, type } = {}) {
    const searchTerm = `%${query}%`;
    const results = {};

    if (!type || type === 'songs') {
      results.songs = await Song.findAll({
        where: {
          title: { [Op.iLike]: searchTerm }
        },
        include: [
          { model: Artist, as: 'artist', attributes: ['id', 'name'] },
          { model: Album, as: 'album', attributes: ['id', 'title', 'coverImage'] }
        ],
        limit,
        order: [['plays', 'DESC']]
      });
    }

    if (!type || type === 'artists') {
      results.artists = await Artist.findAll({
        where: {
          name: { [Op.iLike]: searchTerm }
        },
        limit,
        order: [['monthlyListeners', 'DESC']]
      });
    }

    if (!type || type === 'albums') {
      results.albums = await Album.findAll({
        where: {
          title: { [Op.iLike]: searchTerm }
        },
        include: [
          { model: Artist, as: 'artist', attributes: ['id', 'name'] }
        ],
        limit
      });
    }

    if (!type || type === 'playlists') {
      results.playlists = await Playlist.findAll({
        where: {
          isPublic: true,
          name: { [Op.iLike]: searchTerm }
        },
        limit
      });
    }

    if (!type || type === 'podcasts') {
      results.podcasts = await Podcast.findAll({
        where: {
          title: { [Op.iLike]: searchTerm }
        },
        limit
      });
    }

    return results;
  }
}

module.exports = new SearchService();
