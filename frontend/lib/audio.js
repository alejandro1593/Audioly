const API_URL = process.env.NEXT_PUBLIC_API_URL

// Construye la URL de reproducción de una canción.
// Si la canción tiene url local (/uploads/ o /api/stream) usa streaming con Range.
// Si es URL externa, la usa directamente.
export function getAudioUrl(song) {
  if (!song) return null

  if (!song.url) return null

  // URL ya apunta al API de streaming
  if (song.url.includes('/api/stream/')) return song.url

  // URL local en el servidor: usamos streaming con Range para permitir seek
  if (song.url.startsWith('/uploads/') && song.id) {
    return `${API_URL}/stream/songs/${song.id}`
  }

  // URL absoluta externa (ej. https://...)
  if (song.url.startsWith('http')) return song.url

  // Path relativo en uploads → lo servimos con streaming
  return `${API_URL}/stream/songs/${song.id}`
}
