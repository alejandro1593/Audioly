const express = require('express');
const router = express.Router();
const jamendoController = require('../controllers/jamendo.controller');

// Búsqueda global de música en Jamendo (libre de derechos / CC)
// GET /api/jamendo/tracks?q=query&limit=&offset=&tags=&order=
router.get('/tracks', jamendoController.searchTracks);

// Canciones destacadas de Jamendo
// GET /api/jamendo/featured?limit=&tags=
router.get('/featured', jamendoController.featuredTracks);

// Listado de géneros sugeridos
router.get('/genres', jamendoController.genres);

module.exports = router;