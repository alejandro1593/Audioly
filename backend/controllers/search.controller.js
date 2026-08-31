const SearchService = require('../services/search.service');
const asyncHandler = require('../utils/asyncHandler');

class SearchController {
  search = asyncHandler(async (req, res) => {
    const { q, type, limit } = req.query;
    const results = await SearchService.search(q, { type, limit });
    res.json({ success: true, query: q, ...results });
  });

  suggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const results = await SearchService.search(q, { limit: 5 });
    res.json({ success: true, query: q, ...results });
  });
}

module.exports = new SearchController();
