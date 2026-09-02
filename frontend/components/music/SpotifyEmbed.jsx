'use client'

// Reproductor oficial de Spotify embebido (iframe).
// El audio lo sirve Spotify; no requiere licencia adicional.
// Docs: https://developer.spotify.com/documentation/embeds

const HEIGHTS = {
  track: 80,
  compact: 152,
  default: 352
}

export default function SpotifyEmbed({ trackId, theme = 'dark', style = 'track', allowAutoplay = false }) {
  const height = HEIGHTS[style] || HEIGHTS.track
  // Los embeds de Spotify cargan más rápido con frame busting activado
  const autoplay = allowAutoplay ? '&autoplay=true' : ''
  const src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=${theme}${autoplay}`

  return (
    <iframe
      title="Spotify"
      src={src}
      width="100%"
      height={height}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      style={{ border: 'none' }}
      className="rounded-xl"
    />
  )
}