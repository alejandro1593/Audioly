'use client'

import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useLibraryStore } from '../../store/useLibraryStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import SongCard from '../../components/music/SongCard'
import { normalizeSongs } from '../../lib/normalize'
import Link from 'next/link'

export default function LibraryPage() {
  const [tab, setTab] = useState('playlists')
  const [loading, setLoading] = useState(true)
  const [likedPlaylists, setLikedPlaylists] = useState([])
  const { playlists, likedSongs, history } = useLibraryStore()

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        await Promise.all([
          useLibraryStore.getState().fetchPlaylists(),
          useLibraryStore.getState().fetchLikedSongs(),
          useLibraryStore.getState().fetchHistory(),
          api.get('/playlists/liked').then(({ data }) => setLikedPlaylists(data.playlists || []))
        ])
      } catch (error) {
        console.error('Error fetching library:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const tabs = [
    { id: 'playlists', label: 'Playlists' },
    { id: 'liked', label: 'Canciones' },
    { id: 'history', label: 'Historial' }
  ]

  const playAll = (songs) => {
    if (songs.length) {
      usePlayerStore.getState().playSong(songs[0], songs)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tu Biblioteca</h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-white text-black'
                : 'bg-cyber-dark text-white hover:bg-cyber-darker'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-cyber-text">Cargando...</div>
      ) : (
        <div>
          {tab === 'playlists' && (
            <div>
              {likedPlaylists.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Playlists que te gustan</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {likedPlaylists.map((playlist) => (
                      <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="card group">
                        <div className="mb-3">
                          <div className="w-full aspect-square bg-gradient-to-br from-fuchsia-500 to-purple-500 rounded flex items-center justify-center text-4xl">
                            ♪
                          </div>
                        </div>
                        <h3 className="font-bold truncate group-hover:underline">{playlist.name}</h3>
                        <p className="text-cyber-text text-sm truncate">
                          {playlist.owner?.username}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="card group">
                  <div className="mb-3">
                    <div className="w-full aspect-square bg-gradient-to-br from-green-500 to-blue-500 rounded flex items-center justify-center text-4xl">
                      ♪
                    </div>
                  </div>
                  <h3 className="font-bold truncate group-hover:underline">{playlist.name}</h3>
                  <p className="text-cyber-text text-sm truncate">
                    Playlist • {playlist.owner?.username}
                  </p>
                </Link>
              ))}
              </div>
            </div>
          )}

          {tab === 'liked' && (
            <div>
              {likedSongs.length > 0 && (
                <button onClick={() => playAll(likedSongs)} className="btn-primary mb-6">
                  Reproducir todo
                </button>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {normalizeSongs(likedSongs).map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onPlay={() => playAll([song])}
                  />
                ))}
              </div>
              {likedSongs.length === 0 && (
                <p className="text-cyber-text">Aún no tienes canciones guardadas</p>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="bg-cyber-panel/40 rounded-lg divide-y divide-cyber-border/50">
              {history.map((entry, index) => (
                <div
                  key={`${entry.id}-${index}`}
                  onClick={() => playAll([entry.song])}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-cyber-dark cursor-pointer"
                >
                  {entry.song?.coverImage || entry.song?.album?.coverImage ? (
                    <img src={entry.song?.coverImage || entry.song?.album?.coverImage} alt="" className="w-10 h-10 rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-cyber-darker rounded flex items-center justify-center">♪</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{entry.song?.title}</p>
                    <p className="text-cyber-text text-sm truncate">
                      {entry.song?.artist?.name}
                    </p>
                  </div>
                  <span className="text-cyber-text text-sm">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-cyber-text p-4">No hay historial de escucha aún</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
