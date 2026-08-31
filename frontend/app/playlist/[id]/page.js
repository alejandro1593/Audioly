'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import Link from 'next/link'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'
import { useAuthStore } from '../../../store/useAuthStore'

export default function PlaylistPage() {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const { data } = await api.get(`/playlists/${id}`)
        setPlaylist(data.playlist)
      } catch (error) {
        console.error('Error fetching playlist:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylist()
  }, [id])

  if (loading) return <div className="text-cyber-text">Cargando...</div>
  if (!playlist) return <div className="text-cyber-text">Playlist no encontrada</div>

  const isOwner = user?.id === playlist.userId
  const songs = playlist.songs || []

  const playAll = () => {
    if (songs.length) {
      playIfLoggedIn(songs[0], songs)
    }
  }

  const playSong = (song) => {
    playIfLoggedIn(song, songs)
  }

  const removeSong = async (songId, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/playlists/${id}/songs/${songId}`)
      const { data } = await api.get(`/playlists/${id}`)
      setPlaylist(data.playlist)
    } catch (error) {
      console.error('Error removing song:', error)
    }
  }

  const totalDuration = songs.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div>
      <div className="flex items-end gap-6 mb-8">
        {playlist.coverImage ? (
          <img src={playlist.coverImage} alt={playlist.name} className="w-48 h-48 rounded shadow-2xl object-cover" />
        ) : (
          <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded shadow-2xl flex items-center justify-center text-7xl">
            ♪
          </div>
        )}
        <div>
          <p className="text-xs uppercase font-bold text-cyber-text mb-1">Playlist</p>
          <h1 className="text-5xl font-black mb-3">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-cyber-text mb-2">{playlist.description}</p>
          )}
          <p className="flex items-center gap-2 text-cyber-text">
            <span className="text-white font-bold">{playlist.owner?.username}</span>
            <span>•</span>
            <span>{songs.length} canciones</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={playAll} className="w-14 h-14 bg-gradient-cyber rounded-full flex items-center justify-center text-2xl text-white hover:scale-105 transition-transform shadow-xl">
          ▶
        </button>
        <span className="text-cyber-text text-xl">♡</span>
        <span className="text-cyber-text text-xl">…</span>
      </div>

      {songs.length === 0 ? (
        <div className="bg-cyber-panel/40 rounded-lg p-8 text-center">
          <p className="text-2xl font-bold mb-2">Esta playlist está vacía</p>
          <p className="text-cyber-text">Añade canciones para empezar a escuchar</p>
        </div>
      ) : (
        <div className="bg-cyber-panel/40 rounded-lg">
          <div className="grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-2 text-cyber-text text-sm border-b border-cyber-border/50">
            <span>#</span>
            <span>Título</span>
            <span>Duración</span>
          </div>

          {songs.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              onClick={() => playSong(song)}
              className="grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-3 text-cyber-text hover:bg-white/5 hover:text-white cursor-pointer items-center group"
            >
              <span className="text-center">{index + 1}</span>
              <div className="flex items-center gap-3 min-w-0">
                {song.coverImage ? (
                  <img src={song.coverImage} alt="" className="w-10 h-10 rounded object-cover" />
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
              <div className="flex items-center gap-3">
                <span>{formatDuration(song.duration)}</span>
                {isOwner && (
                  <button
                    onClick={(e) => removeSong(song.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-cyber-text hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {LoginPrompt}
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0 min'
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}
