// Música libre de derechos de SoundHelix (pistas de demostración MP3).
// No requiere clave ni registro. URLs públicas y estables.
// Perfecto para desarrollo/demo: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-N.mp3

const BASE_URL = 'https://www.soundhelix.com/examples/mp3';

// Metadatos de muestra para acompañar los MP3 de SoundHelix.
// (Puedes sustituir estos nombres por los que quieras en tu web.)
const META = [
  { artist: 'Solar Drift', genre: 'Electronic', album: 'Aurora', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80', duration: 403 },
  { artist: 'Denali Echo', genre: 'Ambient', album: 'Summit', cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80', duration: 382 },
  { artist: 'Northbound', genre: 'Rock', album: 'Highway', cover: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', duration: 380 },
  { artist: 'Velvet Circuit', genre: 'Electronic', album: 'Voltage', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', duration: 377 },
  { artist: 'Midnight Atlas', genre: 'Lo-Feel', album: 'Constellations', cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80', duration: 396 },
  { artist: 'Cobalt Sky', genre: 'Synthwave', album: 'Neon Flight', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80', duration: 388 },
  { artist: 'Riverstone', genre: 'Folk', album: 'Watershed', cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80', duration: 375 },
  { artist: 'Aurora Pulse', genre: 'Electronic', album: 'Rhythm', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80', duration: 406 },
  { artist: 'Iron Meadow', genre: 'Indie', album: 'Fields', cover: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&q=80', duration: 391 },
  { artist: 'Prism Coast', genre: 'Pop', album: 'Wavelength', cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&q=80', duration: 364 },
  { artist: 'Static Bloom', genre: 'Electronic', album: 'Petals', cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80', duration: 372 },
  { artist: 'Last Cartographer', genre: 'Ambient', album: 'Voyage', cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80', duration: 400 },
  { artist: 'Tidal Trace', genre: 'Chill', album: 'Currents', cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80', duration: 394 },
  { artist: 'Echo Chamber', genre: 'Electronic', album: 'Reverb', cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80', duration: 369 },
  { artist: 'Nomad Signal', genre: 'World', album: 'Horizon', cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80', duration: 378 },
  { artist: 'Glacier Motif', genre: 'Classical', album: 'Winter', cover: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80', duration: 410 },
  { artist: 'Neon Canyon', genre: 'Synthwave', album: 'Desert Lights', cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', duration: 384 }
];

const TRACK_TITLES = [
  'Night Drive', 'Lost Signal', 'Electric Tide', 'Horizon Miles', 'Glass Horizons',
  'Chromium', 'Paper Planes', 'Solar Flare', 'Winding Path', 'Midnight Bloom',
  'Static Skies', 'Last Voyage', 'Current Winds', 'Chamber Echo', 'Nomad Lights',
  'Glacier Rythm', 'Desert Lights'
];

function buildTracks() {
  return META.map((meta, index) => {
    const n = index + 1;
    return {
      id: `soundhelix-${n}`,
      source: 'soundhelix',
      title: `${meta.artist} - ${TRACK_TITLES[index]}`,
      duration: meta.duration,
      url: `${BASE_URL}/SoundHelix-Song-${n}.mp3`,
      coverImage: meta.cover,
      image: meta.cover,
      genre: meta.genre,
      artist: { id: `sh-artist-${n}`, name: meta.artist },
      album: { id: `sh-album-${n}`, title: meta.album, coverImage: meta.cover },
      releaseDate: new Date(2021, index % 12, 1).toISOString().slice(0, 10),
      license: 'SoundHelix demo (free for use)',
      licenseName: 'SoundHelix demo',
      isExplicit: false,
      plays: 400000 - index * 15000
    };
  });
}

// Lista completa (determinista)
const ALL_TRACKS = buildTracks();

class SoundhelixService {
  getAllTracks({ limit = 20, offset = 0 } = {}) {
    const start = offset || 0;
    const end = start + (limit || ALL_TRACKS.length);
    return {
      total: ALL_TRACKS.length,
      tracks: ALL_TRACKS.slice(start, end)
    };
  }

  getById(id) {
    return ALL_TRACKS.find((t) => t.id === id) || null;
  }
}

module.exports = new SoundhelixService();