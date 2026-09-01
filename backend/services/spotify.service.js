// Spotify embeds - reproducción de éxitos mediante el player oficial de Spotify.
// No requiere clave ni licencia: el audio lo sirve Spotify en un iframe (<iframe>).
// Spotify prohíbe la reproducción del audio fuera de su reproductor;
// por eso usamos el embed embebido y no nuestro propio player.

// Lote fijo de éxitos con sus IDs de Spotify (sin búsqueda dinámica).
// Para ampliar: añade una entrada con el track id de cualquier canción
// (botón "Compartir > Copiar enlace" de Spotify contiene el /track/xxxxx).
const PLAYLIST = [
  { title: 'Tití Me Preguntó', artist: 'Bad Bunny', genre: 'Reggaeton', trackId: '3YYeGKdfKdAZQeotl9J9Y3' },
  { title: 'Efecto', artist: 'Bad Bunny', genre: 'Reggaeton', trackId: '5uZx8ZRKY6lVuEg4nqTexY' },
  { title: 'La Corriente', artist: 'Bad Bunny', genre: 'Reggaeton', trackId: '30BFPMWCT7qYBhLdQ5vHMT' },
  { title: 'DESPECHÁ', artist: 'Rosalía', genre: 'Pop', trackId: '5jDf7gtn6vAFHNqL9qIH7Z' },
  { title: 'Los Ángeles', artist: 'Rosalía', genre: 'Pop', trackId: '7cgY9MkwTNC2XDtG1nT8dB' },
  { title: 'Motomami', artist: 'Rosalía', genre: 'Pop', trackId: '5Zh5lRKHnbDFayVgA4BAym' },
  { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', trackId: '0VjIjW4GlUZAMYd2vXMi3b' },
  { title: 'DÁKITI', artist: 'Bad Bunny & Jhayco', genre: 'Reggaeton', trackId: '4MzXwWMhyBbMu6wOjEAHIx' },
  { title: 'YHLQMDLG', artist: 'Bad Bunny', genre: 'Reggaeton', trackId: '5y3yK0bWXK9j1lVsUjWl9Q' },
  { title: 'Safari', artist: 'J Balvin, Pharrell, BIA', genre: 'Reggaeton', trackId: '456xE5FQVihG3mEA2ItJ0d' }
];

function buildTracks() {
  return PLAYLIST.map((item, index) => ({
    id: `spotify-${index + 1}`,
    source: 'spotify',
    title: item.title,
    artistName: item.artist,
    genre: item.genre,
    trackId: item.trackId,
    // iframe del reproductor oficial de Spotify
    embedUrl: `https://open.spotify.com/embed/track/${item.trackId}`,
    // para ampliaciones futuras
    openUrl: `https://open.spotify.com/track/${item.trackId}`,
    // El player de Spotify no expone una url de audio directa; usamos el embed.
    url: `https://open.spotify.com/embed/track/${item.trackId}`,
    artist: { id: `spotify-artist-${index + 1}`, name: item.artist },
    // Sin portada local: el iframe del embed muestra su propia imagen.
    coverImage: null,
    // Marcamos explícitamente que se reproduce vía embed de Spotify
    embed: true
  }));
}

class SpotifyService {
  getTracks({ limit = 20, offset = 0 } = {}) {
    const all = buildTracks();
    const start = offset || 0;
    const end = start + (limit || all.length);
    return {
      total: all.length,
      source: 'spotify-embed',
      tracks: all.slice(start, end)
    };
  }
}

module.exports = new SpotifyService();