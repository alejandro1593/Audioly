'use client'

import { useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useLibraryStore } from '../../store/useLibraryStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Play, Heart, ListMusic, Plus, MoreHorizontal } from 'lucide-react'

export default function SongCard({ song, onPlay }) {
  const { toggleLike } = useLibraryStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const isLiked = useLibraryStore(state =>
    state.likedSongs.some(s => s.id === song.id)
  )

  const handleLike = async (e) => {
    e.stopPropagation()
    try {
      if (isLiked) {
        await api.delete(`/songs/${song.id}/like`)
        toast.success('Quitada de tus canciones')
      } else {
        await api.post(`/songs/${song.id}/like`)
        toast.success('Añadida a tus canciones')
      }
      toggleLike(song)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error')
    }
  }

  const handlePlayNext = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    usePlayerStore.getState().addToQueueNext(song)
    toast.success('Se reproducirá a continuación')
  }

  const handleAddToQueue = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    usePlayerStore.getState().addToQueue(song)
    toast.success('Añadida a la cola')
  }

  return (
    <div onClick={onPlay} className="card group">
      <div className="relative mb-3 overflow-hidden rounded-xl">
        {song.coverImage ? (
          <img
            src={song.coverImage}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-cyber rounded-xl flex items-center justify-center text-4xl opacity-80">
            ♪
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="w-10 h-10 bg-gradient-cyber rounded-full flex items-center justify-center text-white shadow-neon">
            <Play size={18} className="ml-0.5" />
          </div>
        </div>

        <button
          onClick={handleLike}
          className={`absolute top-2 right-2 transition-all ${isLiked ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-white/50 hover:text-white'}`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
          className="absolute top-10 right-2 text-white/50 hover:text-white transition-all"
          title="Más opciones"
        >
          <MoreHorizontal size={20} />
        </button>

        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-14 right-2 bg-cyber-darker/95 backdrop-blur-xl border border-cyber-border rounded-xl shadow-2xl py-1 z-20 min-w-[180px]"
          >
            <button
              onClick={handlePlayNext}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-cyber-text hover:text-white hover:bg-cyber-dark transition-colors"
            >
              <Plus size={16} className="text-cyber-cyan" /> Reproducir a continuación
            </button>
            <button
              onClick={handleAddToQueue}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-cyber-text hover:text-white hover:bg-cyber-dark transition-colors"
            >
              <ListMusic size={16} className="text-cyber-purple" /> Añadir a la cola
            </button>
          </div>
        )}
      </div>

      <h3 className="font-bold truncate group-hover:text-cyber-cyan transition-colors">{song.title}</h3>
      <Link
        href={`/artist/${song.artist?.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-cyber-text text-sm truncate hover:underline hover:text-white"
      >
        {song.artist?.name}
      </Link>
    </div>
  )
}
