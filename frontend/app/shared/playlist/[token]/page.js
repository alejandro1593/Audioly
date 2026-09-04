'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../../lib/api'
import Link from 'next/link'
import { useRequireLoginToPlay } from '../../../../hooks/useRequireLoginToPlay'
import { Users, Music } from 'lucide-react'

export default function SharedPlaylistPage() {
  const { token } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const { data } = await api.get(`/playlists/shared/${token}`)
        setPlaylist(data.playlist)
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar la playlist')
      } finally {
        setLoading(false)
      }
    }
    fetchShared()
  }, [token])

  if (loading) return <div className="text-cyber-text">Cargando...</div>
  if (error) return (
    <div className="bg-cyber-panel/40 rounded-lg p-8 text-center">
      <p className="text-cyber-text text-lg mb-2">Error</p>
      <p className="text-cyber-text">{error}</p>
      <Link href="/" className="btn-primary inline-block mt-4">
        Volver al inicio
      </Link>
    </div>
  )
  if (!playlist) return <div className="text-cyber-text">Playlist no encontrada</div>

  const songs = playlist.songs || []

  const playAll = () => {
    if (songs.length) playIfLoggedIn(songs[0], songs)
  }

  const playSong = (song) => {
    playIfLoggedIn(song, songs)
  }

  const totalDuration = songs.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase font-bold text-cyber-cyan mb-2 flex items-center justify-center gap-1">
          <Users size={14} /> Playlist compartida
        </p>
        <h1 className="text-4xl sm:text-5xl font-black mb-3 break-words">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-cyber-text mb-2">{playlist.description}</p>
        )}
        <p className="flex items-center justify-center gap-2 text-cyber-text text-sm">
          <span className="text-white font-bold">{playlist.owner?.username}</span>
          <span>•</span>
          <span>{songs.length} canciones</span>
          <span>•</span>
          <span>{formatDuration(totalDuration)}</span>
        </p>
        {songs.length > 0 && (
          <button onClick={playAll} className="w-14 h-14 bg-gradient-cyber rounded-full flex items-center justify-center text-2xl text-white hover:scale-105 transition-transform shadow-xl mt-6">
            ▶
          </button>
        )}
      </div>

      <div className="bg-cyber-panel/40 rounded-lg">
        <div className="grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-2 text-cyber-text text-sm border-b border-cyber-border/50">
          <span>#</span>
          <span>Título</span>
          <span>Duración</span>
        </div>
        {songs.length === 0 ? (
          <p className="text-cyber-text p-8 text-center flex items-center justify-center gap-2">
            <Music size={16} /> Esta playlist no tiene canciones todavía
          </p>
        ) : (
          songs.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              onClick={() => playSong(song)}
              className="grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-3 text-cyber-text hover:bg-white/5 hover:text-white cursor-pointer items-center group"
            >
              <span className="text-center">{index + 1}</span>
              <div className="flex items-center gap-3 min-w-0">
                {song.album?.coverImage || song.coverImage ? (
                  <img src={song.album?.coverImage || song.coverImage} alt="" className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-cyber-panel rounded flex items-center justify-center">♪</div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-white font-semibold">{song.title}</p>
                  <Link
                    href={`/artist/${song.artist?.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm hover:underline"
                  >
                    {song.artist?.name}
                  </Link>
                </div>
              </div>
              <span>{formatDuration(song.duration)}</span>
            </div>
          ))
        )}
      </div>

      <p className="text-center text-cyber-text text-xs mt-6">
        Compartido desde Audioly — <Link href="/" className="hover:underline">crea la tuya</Link>
      </p>

      {LoginPrompt}
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0 min'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  return `${hours} hr ${rest} min`
}