'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import Link from 'next/link'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'
import { useAuthStore } from '../../../store/useAuthStore'

export default function AlbumPage() {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const { data } = await api.get(`/albums/${id}`)
        setAlbum(data.album)
      } catch (error) {
        console.error('Error fetching album:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAlbum()
  }, [id])

  if (loading) return <div className="text-cyber-text">Cargando...</div>
  if (!album) return <div className="text-cyber-text">Álbum no encontrado</div>

  const playAll = () => {
    if (album.songs?.length) {
      playIfLoggedIn(album.songs[0], album.songs)
    }
  }

  const playSong = (song) => {
    playIfLoggedIn(song, album.songs)
  }

  const toggleSave = async () => {
    try {
      await api.post(`/albums/${id}/save`)
      setAlbum((a) => ({ ...a, isSaved: !a.isSaved }))
    } catch (error) {
      console.error('Error toggling saved album:', error)
    }
  }

  const totalDuration = album.songs?.reduce((sum, s) => sum + s.duration, 0) || 0

  return (
    <div>
      <div className="flex items-end gap-6 mb-8">
        {album.coverImage ? (
          <img src={album.coverImage} alt={album.title} className="w-48 h-48 rounded shadow-2xl object-cover" />
        ) : (
          <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded shadow-2xl flex items-center justify-center text-7xl">
            ♪
          </div>
        )}
        <div>
          <p className="text-xs uppercase font-bold text-cyber-text mb-1">Álbum</p>
          <h1 className="text-5xl font-black mb-3 text-white">{album.title}</h1>
          <p className="flex items-center gap-2 text-cyber-text">
            <Link href={`/artist/${album.artist?.id}`} className="text-cyber-cyan font-bold hover:underline">
              {album.artist?.name}
            </Link>
            <span>•</span>
            <span>{album.releaseDate?.slice(0, 4)}</span>
            <span>•</span>
            <span>{album.songs?.length} canciones</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={playAll} className="w-14 h-14 bg-gradient-cyber rounded-full flex items-center justify-center text-2xl text-white hover:scale-105 hover:shadow-neon transition-transform shadow-xl">
          ▶
        </button>
        {user && (
          <button
            onClick={toggleSave}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all hover:scale-105 ${album.isSaved
              ? 'bg-white text-black border-white'
              : 'border-cyber-text text-cyber-text hover:border-white hover:text-white'}`}
            title={album.isSaved ? 'Quitar de tu biblioteca' : 'Guardar en tu biblioteca'}
          >
            {album.isSaved ? '✓' : '+'}
          </button>
        )}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_auto] gap-4 px-6 py-3 text-cyber-text text-sm border-b border-cyber-border/50">
          <span>#</span>
          <span>Título</span>
          <span>Duración</span>
        </div>

        {album.songs?.map((song, index) => (
          <div
            key={song.id}
            onClick={() => playSong(song)}
            className="grid grid-cols-[40px_1fr_auto] gap-4 px-6 py-3 text-cyber-text hover:bg-white/5 hover:text-white cursor-pointer items-center transition-colors"
          >
            <span className="text-center">{index + 1}</span>
            <div className="flex items-center gap-3 min-w-0">
              <span className={song.isExplicit ? 'bg-cyber-panel text-white px-2 py-0.5 rounded text-xs border border-cyber-border' : 'hidden'}>
                E
              </span>
              <span className="truncate text-white font-semibold">{song.title}</span>
            </div>
            <span>{formatDuration(song.duration)}</span>
          </div>
        ))}
      </div>

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
