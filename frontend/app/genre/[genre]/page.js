'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import SongCard from '../../../components/music/SongCard'
import { normalizeSongs } from '../../../lib/normalize'
import { useAuthStore } from '../../../store/useAuthStore'
import { usePlayerStore } from '../../../store/usePlayerStore'

export default function GenrePage() {
  const { genre } = useParams()
  const decoded = decodeURIComponent(genre || '')
  const [songs, setSongs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const fetchSongs = async (reset = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const limit = 12
      const currentOffset = reset ? 0 : offset
      const { data } = await api.get('/songs', {
        params: { genre: decoded, limit, offset: currentOffset }
      })
      setSongs(reset ? normalizeSongs(data.songs) : (prev) => [...prev, ...normalizeSongs(data.songs)])
      setTotal(data.total || 0)
      if (!reset) setOffset(currentOffset + limit)
    } catch (error) {
      console.error('Error fetching genre songs:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!decoded) return
    setOffset(0)
    fetchSongs(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decoded])

  const playAll = () => {
    if (songs.length) {
      usePlayerStore.getState().playSong(songs[0], songs)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase font-bold text-cyber-text mb-1">Género</p>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-4xl sm:text-5xl font-black">{decoded}</h1>
          <span className="text-cyber-text">{total} canciones</span>
        </div>
      </div>

      {songs.length > 0 && (
        <button onClick={playAll} className="btn-primary mb-6">
          ▶ Reproducir todo
        </button>
      )}

      {loading ? (
        <div className="text-cyber-text animate-pulse">Cargando...</div>
      ) : songs.length === 0 ? (
        <div className="text-cyber-text">No hay canciones en este género todavía.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => {
                  if (!isAuthenticated) return usePlayerStore.getState().playSong(song, songs)
                  usePlayerStore.getState().playSong(song, songs)
                }}
              />
            ))}
          </div>
          {total > songs.length && (
            <div className="mt-6 text-center">
              <button onClick={() => fetchSongs(false)} disabled={loadingMore} className="btn-secondary disabled:opacity-50">
                {loadingMore ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}