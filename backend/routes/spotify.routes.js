const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');

// Éxitos de Spotify reproducibles vía player oficial (embed, sin licencia)
// GET /api/spotify/tracks?limit=&offset=
router.get('/tracks', spotifyController.getTracks);

module.exports = router;