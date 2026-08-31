const PodcastService = require('../services/podcast.service');
const asyncHandler = require('../utils/asyncHandler');

class PodcastController {
  getAllPodcasts = asyncHandler(async (req, res) => {
    const result = await PodcastService.getAllPodcasts(req.query);
    res.json({ success: true, ...result });
  });

  getPodcastById = asyncHandler(async (req, res) => {
    const podcast = await PodcastService.getPodcastById(req.params.id);
    res.json({ success: true, podcast });
  });

  createPodcast = asyncHandler(async (req, res) => {
    const podcast = await PodcastService.createPodcast(req.body);
    res.status(201).json({ success: true, podcast });
  });

  updatePodcast = asyncHandler(async (req, res) => {
    const podcast = await PodcastService.updatePodcast(req.params.id, req.body);
    res.json({ success: true, podcast });
  });

  deletePodcast = asyncHandler(async (req, res) => {
    const result = await PodcastService.deletePodcast(req.params.id);
    res.json({ success: true, ...result });
  });

  addEpisode = asyncHandler(async (req, res) => {
    const episode = await PodcastService.addEpisode(req.params.id, req.body);
    res.status(201).json({ success: true, episode });
  });

  getEpisode = asyncHandler(async (req, res) => {
    const episode = await PodcastService.getEpisodeById(req.params.id, req.params.episodeId);
    res.json({ success: true, episode });
  });
}

module.exports = new PodcastController();
