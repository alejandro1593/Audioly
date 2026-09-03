'use client'

import { useState, useEffect } from 'react'
import api from '../../lib/api'
import Link from 'next/link'
import { useAuthStore } from '../../store/useAuthStore'
import { usePlayerStore } from '../../store/usePlayerStore'

export default function TopPage() {
  const { isAuthenticated } = useAuthStore()
  const [type, setType] = useState('tracks')
  const [timeRange, setTimeRange] = useState('medium_term')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const timeOptions = [
    { id: 'short_term', label: '4 semanas' },
    { id: 'medium_term', label: '6 meses' },
    { id: 'long_term', label: 'Todo el tiempo' }
  ]

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchTop = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/users/me/top', { params: { type, time_range: timeRange, limit: 20 } })
        setItems(data.items || [])
      } catch (error) {
        console.error('Error fetching top:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTop()
  }, [type, timeRange, isAuthenticated])

  if (!isAuthenticated) return null

  const playTrack = (song) => {
    const songs = items.filter((i) => i.id)
    usePlayerStore.getState().playSong(song, songs)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase font-bold text-cyber-text mb-1">Tu actividad</p>
        <h1 className="text-4xl font-black mb-2">Tu Top</h1>
        <p className="text-cyber-text">Tus canciones y artistas más escuchados.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {['tracks', 'artists'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                type === t ? 'bg-white text-black' : 'bg-cyber-dark text-white hover:bg-cyber-darker'
              }`}
            >
              {t === 'tracks' ? 'Canciones' : 'Artistas'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {timeOptions.map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                timeRange === t.id
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                  : 'text-cyber-text hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-cyber-text">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="bg-cyber-panel/40 rounded-lg p-8 text-center text-cyber-text">
          Aún no hay reproducciones en este periodo. Reproduce algunas canciones para ver tu top.
        </div>
      ) : type === 'tracks' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              onClick={() => playTrack(item)}
              className="card group cursor-pointer"
            >
              <div className="relative mb-3">
                {item.album?.coverImage ? (
                  <img src={item.album.coverImage} alt="" className="w-full aspect-square object-cover rounded" />
                ) : (
                  <div className="w-full aspect-square bg-gradient-cyber rounded flex items-end justify-start p-2 text-3xl">
                    {i + 1}
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  #{i + 1}
                </span>
                <span className="absolute bottom-2 right-2 text-xs text-cyber-text bg-black/60 px-2 py-0.5 rounded-full">
                  {item.weight} {item.weight === 1 ? 'reproducción' : 'reproducciones'}
                </span>
              </div>
              <Link
                href={`/artist/${item.artist?.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-cyber-text text-sm truncate hover:underline"
              >
                {item.artist?.name}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item, i) => (
            <Link key={item.id} href={`/artist/${item.id}`} className="card group">
              <div className="relative mb-3">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full aspect-square object-cover rounded-full" />
                ) : (
                  <div className="w-full aspect-square bg-gradient-cyber rounded-full flex items-center justify-center text-3xl">
                    {i + 1}
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  #{i + 1}
                </span>
              </div>
              <h3 className="font-bold truncate group-hover:underline">{item.name}</h3>
              <p className="text-cyber-text text-sm">
                {item.weight} {item.weight === 1 ? 'reproducción' : 'reproducciones'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
