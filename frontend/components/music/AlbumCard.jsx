'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'

export default function AlbumCard({ album }) {
  return (
    <Link href={`/album/${album.id}`} className="card group">
      <div className="relative mb-3 overflow-hidden rounded-xl">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.title}
            className="w-full aspect-square object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-cyber-purple via-cyber-magenta to-cyber-cyan rounded-xl flex items-center justify-center text-4xl">
            ♪
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="w-10 h-10 bg-gradient-cyber rounded-full flex items-center justify-center text-white shadow-neon">
            <Play size={18} className="ml-0.5" />
          </div>
        </div>
      </div>

      <h3 className="font-bold truncate group-hover:text-cyber-cyan transition-colors">{album.title}</h3>
      <p className="text-cyber-text text-sm truncate">{album.artist?.name}</p>
      <p className="text-cyber-text text-xs mt-1">{album.releaseDate?.slice(0, 4)}</p>
    </Link>
  )
}
