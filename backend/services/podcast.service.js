const { Podcast, PodcastEpisode, Artist } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class PodcastService {
  async getAllPodcasts({ search, genre, limit, offset }) {
    const where = {};

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    if (genre) where.genre = genre;

    const { count, rows } = await Podcast.findAndCountAll({
      where,
      include: [
        { model: Artist, as: 'host', attributes: ['id', 'name'] }
      ],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    return { total: count, podcasts: rows };
  }

  async getPodcastById(id) {
    const podcast = await Podcast.findByPk(id, {
      include: [
        { model: Artist, as: 'host', attributes: ['id', 'name', 'image'] },
        {
          model: PodcastEpisode,
          as: 'episodes',
          order: [['releaseDate', 'DESC']]
        }
      ]
    });

    if (!podcast) {
      throw new ApiError(404, 'Podcast no encontrado');
    }

    return podcast;
  }

  async createPodcast(podcastData) {
    const podcast = await Podcast.create(podcastData);
    return podcast;
  }

  async updatePodcast(id, updateData) {
    const podcast = await Podcast.findByPk(id);
    if (!podcast) {
      throw new ApiError(404, 'Podcast no encontrado');
    }
    await podcast.update(updateData);
    return this.getPodcastById(id);
  }

  async deletePodcast(id) {
    const podcast = await Podcast.findByPk(id);
    if (!podcast) {
      throw new ApiError(404, 'Podcast no encontrado');
    }
    await podcast.destroy();
    return { success: true };
  }

  async addEpisode(podcastId, episodeData) {
    const podcast = await Podcast.findByPk(podcastId);
    if (!podcast) {
      throw new ApiError(404, 'Podcast no encontrado');
    }

    const episode = await PodcastEpisode.create({
      ...episodeData,
      podcastId
    });

    return episode;
  }

  async getEpisodeById(podcastId, episodeId) {
    const episode = await PodcastEpisode.findOne({
      where: { id: episodeId, podcastId }
    });

    if (!episode) {
      throw new ApiError(404, 'Episodio no encontrado');
    }

    return episode;
  }
}

module.exports = new PodcastService();
