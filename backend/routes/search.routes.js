const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Global search
router.get('/', searchController.search);

// Autocomplete suggestions
router.get('/suggestions', searchController.suggestions);

module.exports = router;
