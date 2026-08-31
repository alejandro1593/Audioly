'use client'

import Link from 'next/link'

export default function ArtistCard({ artist }) {
  return (
    <Link href={`/artist/${artist.id}`} className="card group">
      <div className="mb-3 flex justify-center">
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-cyber-purple/40 group-hover:ring-cyber-cyan transition-all"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-cyber flex items-center justify-center text-3xl shadow-neon">
            <span>{artist.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>

      <h3 className="font-bold text-center truncate group-hover:text-cyber-cyan transition-colors">{artist.name}</h3>
      <p className="text-cyber-text text-sm text-center mt-1">Artista</p>
      <p className="text-cyber-text text-xs text-center mt-1">
        {formatListeners(artist.monthlyListeners)} oyentes mensuales
      </p>
    </Link>
  )
}

function formatListeners(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num?.toString()
}
