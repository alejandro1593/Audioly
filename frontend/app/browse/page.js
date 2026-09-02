'use client'

import Link from 'next/link'

const GENRES = [
  { name: 'Pop', color: 'from-pink-500 to-rose-500', icon: '🎤' },
  { name: 'Reggaeton', color: 'from-green-500 to-emerald-500', icon: '🎶' },
  { name: 'Electronic', color: 'from-purple-500 to-indigo-500', icon: '🎛️' },
  { name: 'Indie', color: 'from-orange-500 to-amber-500', icon: '🎸' },
  { name: 'Rock', color: 'from-red-500 to-orange-500', icon: '🥁' },
  { name: 'Classical', color: 'from-blue-500 to-cyan-500', icon: '🎻' },
  { name: 'Ambient', color: 'from-cyan-500 to-teal-500', icon: '🌊' },
  { name: 'Folk', color: 'from-yellow-500 to-lime-500', icon: '🌳' },
  { name: 'Chill', color: 'from-fuchsia-500 to-purple-500', icon: '😌' },
  { name: 'Synthwave', color: 'from-violet-500 to-fuchsia-500', icon: '🌆' },
  { name: 'World', color: 'from-teal-500 to-emerald-500', icon: '🌍' },
  { name: 'Lo-Feel', color: 'from-stone-500 to-zinc-500', icon: '☁️' }
]

export default function BrowsePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Explorar</h1>
      <p className="text-cyber-text mb-8">Descubre música por género</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {GENRES.map((genre) => (
          <Link
            key={genre.name}
            href={`/genre/${encodeURIComponent(genre.name)}`}
            className="card group overflow-hidden"
          >
            <div className={`w-full aspect-square bg-gradient-to-br ${genre.color} rounded-xl flex items-center justify-center text-5xl mb-3 group-hover:scale-105 transition-transform duration-500`}>
              {genre.icon}
            </div>
            <h3 className="font-bold truncate group-hover:text-cyber-cyan transition-colors">
              {genre.name}
            </h3>
            <p className="text-cyber-text text-sm">Explorar género</p>
          </Link>
        ))}
      </div>
    </div>
  )
}