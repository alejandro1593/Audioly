'use client'

import { useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useLibraryStore } from '../../store/useLibraryStore'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Play, Heart, ListMusic, Plus, MoreHorizontal, Library } from 'lucide-react'

export default function SongCard({ song, onPlay }) {
  const { toggleLike } = useLibraryStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [playlistModal, setPlaylistModal] = useState(false)
  const [userPlaylists, setUserPlaylists] = useState([])
  const { isAuthenticated } = useAuthStore()
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

  const openPlaylistModal = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    api.get('/playlists?byUser=true')
      .then(({ data }) => {
        setUserPlaylists(data.playlists || [])
        setPlaylistModal(true)
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Error al cargar playlists'))
  }

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/songs`, { songId: song.id })
      toast.success('Añadida a la playlist')
      setPlaylistModal(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al añadir a la playlist')
    }
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
            {isAuthenticated && (
              <button
                onClick={openPlaylistModal}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-cyber-text hover:text-white hover:bg-cyber-dark transition-colors"
              >
                <Library size={16} className="text-cyber-green" /> Añadir a playlist
              </button>
            )}
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

      {playlistModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <div className="bg-cyber-panel p-6 rounded-2xl w-96 border border-cyber-border shadow-neon" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Añadir a playlist</h3>
            {userPlaylists.length === 0 ? (
              <p className="text-cyber-text mb-4">No tienes playlists. Crea una desde tu Biblioteca.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                {userPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => addToPlaylist(playlist.id)}
                    className="w-full flex items-center gap-3 p-2 text-cyber-text hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center text-white text-sm shrink-0">♪</div>
                    <span className="truncate">{playlist.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setPlaylistModal(false)} className="text-cyber-text hover:text-white px-4 py-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
