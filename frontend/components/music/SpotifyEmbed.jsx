'use client'

// Reproductor oficial de Spotify embebido (iframe).
// El audio lo sirve Spotify; no requiere licencia adicional.
// Docs: https://developer.spotify.com/documentation/embeds

const HEIGHTS = {
  track: 80,
  compact: 152,
  default: 352
}

export default function SpotifyEmbed({ trackId, theme = 'dark', style = 'track' }) {
  const height = HEIGHTS[style] || HEIGHTS.track
  const src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=${theme}`

  return (
    <iframe
      title="Spotify"
      src={src}
      width="100%"
      height={height}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl"
    />
  )
}