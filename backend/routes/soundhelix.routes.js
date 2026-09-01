const express = require('express');
const router = express.Router();
const soundhelixController = require('../controllers/soundhelix.controller');

// Música libre de derechos (SoundHelix) para llenar la web
// GET /api/soundhelix/tracks?limit=&offset=
router.get('/tracks', soundhelixController.getTracks);

// GET /api/soundhelix/tracks/:id
router.get('/tracks/:id', soundhelixController.getTrackById);

module.exports = router;