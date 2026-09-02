// Spotify embeds - reproducción de éxitos mediante el player oficial de Spotify.
// No requiere clave ni licencia: el audio lo sirve Spotify en un iframe (<iframe>).
// Spotify prohíbe la reproducción del audio fuera de su reproductor;
// por eso usamos el embed embebido y no nuestro propio player.

// Lote fijo de éxitos con sus IDs de Spotify (sin búsqueda dinámica).
// Para ampliar: añade una entrada con el track id de cualquier canción
// (botón "Compartir > Copiar enlace" de Spotify contiene el /track/xxxxx).
// Todos los IDs de abajo fueron verificados contra el embed de Spotify.
const PLAYLIST = [
  { title: 'Tití Me Preguntó', artist: 'Bad Bunny', genre: 'Reggaeton', trackId: '1IHWl5LamUGEuP4ozKQSXZ' },
  { title: 'Efecto', artist: 'Bad Bunny', genre: 'Reggaeton', trackId: '5Eax0qFko2dh7Rl2lYs3bx' },
  { title: 'La Corriente', artist: 'Bad Bunny & Tony Dize', genre: 'Reggaeton', trackId: '1797zYiX4cKosMH836X9Gt' },
  { title: 'DESPECHÁ', artist: 'Rosalía', genre: 'Pop', trackId: '5ildQOEKmJuWGl2vRkFdYc' },
  { title: 'MOTOMAMI', artist: 'Rosalía', genre: 'Pop', trackId: '6ygEPi8EtVkUO0Xarcgs63' },
  { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', trackId: '0VjIjW4GlUZAMYd2vXMi3b' },
  { title: 'DÁKITI', artist: 'Bad Bunny & Jhayco', genre: 'Reggaeton', trackId: '47EiUVwUp4C9fGccaPuUCS' },
  { title: 'YHLQMDLG', artist: 'Bad Bunny', genre: 'Reggaeton', trackId: '41wtwzCZkXwpnakmwJ239F' },
  { title: 'Safari', artist: 'J Balvin, Pharrell Williams & BIA', genre: 'Reggaeton', trackId: '456xBIOmLRoLzCvCzZrWge' }
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