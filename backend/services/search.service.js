const { Song, Artist, Album, Playlist, Podcast } = require('../models');
const sequelize = require('../config/database');
const { Op, QueryTypes } = require('sequelize');

const SEARCH_QUERY = `
  SELECT
    'song' AS type,
    s.id,
    s.title AS title,
    s.duration,
    s.genre,
    s.plays,
    s.url,
    s.lyrics,
    a.id AS artist_id,
    a.name AS artist_name,
    al.id AS album_id,
    al.title AS album_title,
    al.cover_image AS album_cover,
    ts_rank(to_tsvector('spanish', coalesce(s.title,'')), websearch_to_tsquery('spanish', :query)) AS rank
  FROM songs s
  LEFT JOIN artists a ON a.id = s.artist_id
  LEFT JOIN albums al ON al.id = s.album_id
  WHERE to_tsvector('spanish', coalesce(s.title,'') || ' ' || coalesce(a.name,''))
    @@ websearch_to_tsquery('spanish', :query)
  ORDER BY rank DESC, plays DESC
  LIMIT :limit
`;

// Fallback simple (ILIKE) cuando el query no produce tokens válidos
const SEARCH_QUERY_FALLBACK = `
  SELECT
    'song' AS type,
    s.id,
    s.title AS title,
    s.duration,
    s.genre,
    s.plays,
    s.url,
    s.lyrics,
    a.id AS artist_id,
    a.name AS artist_name,
    al.id AS album_id,
    al.title AS album_title,
    al.cover_image AS album_cover,
    0 AS rank
  FROM songs s
  LEFT JOIN artists a ON a.id = s.artist_id
  LEFT JOIN albums al ON al.id = s.album_id
  WHERE s.title ILIKE :like OR a.name ILIKE :like OR al.title ILIKE :like
  ORDER BY s.plays DESC
  LIMIT :limit
`;

// Búsqueda de artistas con ranking full-text (parámetros, sin concatenación)
const ARTISTS_QUERY = `
  SELECT
    ar.id,
    ar.user_id,
    ar.name,
    ar.image,
    ar.bio,
    ar.verified,
    ar.monthly_listeners,
    ts_rank(to_tsvector('spanish', coalesce(ar.name, '')), websearch_to_tsquery('spanish', :query)) AS rank
  FROM artists ar
  WHERE to_tsvector('spanish', coalesce(ar.name, ''))
    @@ websearch_to_tsquery('spanish', :query)
  ORDER BY rank DESC, ar.monthly_listeners DESC
  LIMIT :limit
`;

const ARTISTS_QUERY_FALLBACK = `
  SELECT
    ar.id,
    ar.user_id,
    ar.name,
    ar.image,
    ar.bio,
    ar.verified,
    ar.monthly_listeners,
    0 AS rank
  FROM artists ar
  WHERE ar.name ILIKE :like
  ORDER BY ar.monthly_listeners DESC
  LIMIT :limit
`;

class SearchService {
  async search(query, { limit = 10, type } = {}) {
    const results = {};

    if (!type || type === 'songs') {
      try {
        results.songs = await sequelize.query(SEARCH_QUERY, {
          replacements: { query, limit },
          type: QueryTypes.SELECT
        });
      } catch (e) {
        try {
          results.songs = await sequelize.query(SEARCH_QUERY_FALLBACK, {
            replacements: { query, like: `%${query}%`, limit },
            type: QueryTypes.SELECT
          });
        } catch (e2) {
          results.songs = [];
        }
      }
    }

    if (!type || type === 'artists') {
      try {
        results.artists = await sequelize.query(ARTISTS_QUERY, {
          replacements: { query, limit },
          type: QueryTypes.SELECT
        });
      } catch (e) {
        try {
          results.artists = await sequelize.query(ARTISTS_QUERY_FALLBACK, {
            replacements: { query, like: `%${query}%`, limit },
            type: QueryTypes.SELECT
          });
        } catch (e2) {
          results.artists = [];
        }
      }
    }

    if (!type || type === 'albums') {
      results.albums = await Album.findAll({
        where: {
          title: { [Op.iLike]: `%${query}%` }
        },
        include: [
          { model: Artist, as: 'artist', attributes: ['id', 'name'] }
        ],
        order: [['title', 'ASC']],
        limit
      });
    }

    if (!type || type === 'playlists') {
      results.playlists = await Playlist.findAll({
        where: {
          isPublic: true,
          name: { [Op.iLike]: `%${query}%` }
        },
        limit
      });
    }

    if (!type || type === 'podcasts') {
      results.podcasts = await Podcast.findAll({
        where: {
          title: { [Op.iLike]: `%${query}%` }
        },
        limit
      });
    }

    return results;
  }
}

module.exports = new SearchService();
