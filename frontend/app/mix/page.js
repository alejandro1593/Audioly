'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, History, Play, Loader2 } from 'lucide-react'
import api from '../../lib/api'
import SongCard from '../../components/music/SongCard'
import { usePlayerStore } from '../../store/usePlayerStore'

export default function MixPage() {
  return (
    <Suspense fallback={<div className="flex items-center gap-2 text-cyber-text animate-pulse"><Loader2 size={18} className="animate-spin" /> Preparando tu mix...</div>}>
      <MixContent />
    </Suspense>
  )
}

function MixContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') === 'flashback' ? 'flashback' : 'daily'
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get(`/users/mix?type=${type}`)
      .then(({ data }) => {
        if (!active) return
        setSongs(data.songs || [])
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err.response?.data?.message || 'Error al cargar el mix')
        setLoading(false)
      })
    return () => { active = false }
  }, [type])

  const isDaily = type === 'daily'
  const playAll = () => {
    if (songs.length) usePlayerStore.getState().playSong(songs[0], songs)
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-cyber-purple/25 via-cyber-cyan/10 to-transparent border border-cyber-border">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="w-28 h-28 rounded-2xl bg-gradient-cyber flex items-center justify-center text-white shadow-neon shrink-0">
            {isDaily ? <Sparkles size={44} /> : <History size={44} />}
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-cyber-cyan mb-1">Playlist automática</p>
            <h1 className="text-4xl font-black mb-2">{isDaily ? 'Mix del día' : 'Recuerdos'}</h1>
            <p className="text-cyber-text max-w-lg text-sm">
              {isDaily
                ? 'Según lo que has escuchado últimamente, armado cada vez con tu historial reciente.'
                : 'Tus favoritos de siempre: las canciones que más has reproducido en todo tu historial.'}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={playAll}
                disabled={!songs.length}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Play size={16} /> Reproducir todo
              </button>
              <div className="flex rounded-full overflow-hidden border border-cyber-border">
                <button
                  onClick={() => router.replace('/mix?type=daily')}
                  className={`px-4 py-1.5 text-sm transition-colors ${isDaily ? 'bg-gradient-cyber text-white' : 'bg-cyber-panel text-cyber-text hover:text-white'}`}
                >
                  Mix del día
                </button>
                <button
                  onClick={() => router.replace('/mix?type=flashback')}
                  className={`px-4 py-1.5 text-sm transition-colors ${!isDaily ? 'bg-gradient-cyber text-white' : 'bg-cyber-panel text-cyber-text hover:text-white'}`}
                >
                  Recuerdos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-cyber-text animate-pulse">
          <Loader2 size={18} className="animate-spin" /> Preparando tu mix...
        </div>
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : songs.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-cyber-text">
            Aún no hay suficiente historial. Reproduce algunas canciones para generar tu mix.
          </p>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">{isDaily ? 'Lo que suena hoy' : 'Tus clásicos'}</h2>
            <span className="text-xs uppercase tracking-widest text-cyber-text">{songs.length} canciones</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => usePlayerStore.getState().playSong(song, songs)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}