const https = require('https');

// Cliente ligero de la API Jamendo (música libre de derechos / CC).
// Docs: https://developer.jamendo.com/v3.0/tracks
// Para usarlo, añade JAMENDO_CLIENT_ID a backend/.env (clave gratuita en https://devportal.jamendo.com)

const BASE_URL = 'https://api.jamendo.com/v3.0';

function getClientId() {
  return process.env.JAMENDO_CLIENT_ID || '';
}

// #fetch - GET a la API Jamendo con timeout
function fetch(path, params = {}) {
  const clientId = getClientId();
  const url = new URL(BASE_URL + path);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('format', 'json');
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      if (v.length) url.searchParams.set(k, v.join('+'));
    } else if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Jamendo timeout')));
    req.on('error', reject);
  });
}

// Mapea un track de Jamendo al formato de canción que ya usa Audioly
function mapTrack(t) {
  return {
    id: `jamendo-${t.id}`,
    source: 'jamendo',
    externalId: t.id,
    title: (t.name || '').trim(),
    duration: parseInt(t.duration, 10) || 0,
    url: t.audio || '',
    coverImage: t.album_image || t.image || '',
    image: t.image || t.album_image || '',
    genre: (t.musicinfo?.tags?.genres || [])[0] || (t.musicinfo?.tags?.instruments || [])[0] || '',
    releaseDate: t.releasedate || null,
    license: t.license_ccurl || '',
    licenseName: t.license_ccurl || '',
    artist: { id: `jamendo-artist-${t.artist_id}`, name: t.artist_name || '' },
    album: t.album_name
      ? { id: `jamendo-album-${t.album_id}`, title: t.album_name || '', coverImage: t.album_image || '' }
      : null,
    isExplicit: false,
    plays: 0
  };
}

class JamendoService {
  async searchTracks(query, { limit = 20, offset = 0, tags, order } = {}) {
    const clientId = getClientId();
    if (!clientId) {
      return { error: 'JAMENDO_CLIENT_ID no configurado', tracks: [], total: 0 };
    }

    const params = {
      limit,
      offset,
      namesearch: query || undefined,
      search: query || undefined,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      include: 'musicinfo,licenses',
      featured: undefined
    };

    // Orden por popularidad si no se pide otra cosa
    if (order) params.order = order;

    const res = await fetch('/tracks', params);
    if (res.status !== 200) {
      return { error: `Jamendo HTTP ${res.status}`, tracks: [], total: 0 };
    }

    let json;
    try {
      json = JSON.parse(res.body);
    } catch (e) {
      return { error: 'Respuesta inválida de Jamendo', tracks: [], total: 0 };
    }

    if (!json.results) {
      return { error: json.headers?.error_message || 'Sin resultados', tracks: [], total: 0 };
    }

    const tracks = json.results.map(mapTrack);
    return {
      tracks,
      total: tracks.length,
      fullcount: json.headers?.results_fullcount || tracks.length,
      error: null
    };
  }

  async getFeaturedTracks({ limit = 20, offset = 0, tags, order } = {}) {
    const clientId = getClientId();
    if (!clientId) {
      return { error: 'JAMENDO_CLIENT_ID no configurado', tracks: [], total: 0 };
    }

    const params = {
      limit,
      offset,
      featured: '1',
      tags,
      include: 'musicinfo,licenses'
    };
    if (order) params.order = order;

    const res = await fetch('/tracks', params);
    if (res.status !== 200) {
      return { error: `Jamendo HTTP ${res.status}`, tracks: [], total: 0 };
    }

    let json;
    try {
      json = JSON.parse(res.body);
    } catch (e) {
      return { error: 'Respuesta inválida de Jamendo', tracks: [], total: 0 };
    }

    if (!json.results) {
      return { error: json.headers?.error_message || 'Sin resultados', tracks: [], total: 0 };
    }

    return {
      tracks: json.results.map(mapTrack),
      total: json.results.length,
      error: null
    };
  }

  async getGenres() {
    return {
      genres: ['pop', 'rock', 'classical', 'electronic', 'jazz', 'hiphop', 'relaxation', 'metal', 'soundtrack', 'world'],
      error: null
    };
  }
}

module.exports = new JamendoService();