'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '../../lib/api'
import { useAuthStore } from '../../store/useAuthStore'
import { Clock, Headphones, Disc3, Mic2, Trophy } from 'lucide-react'

export default function RecapPage() {
  const { isAuthenticated } = useAuthStore()
  const [ready, setReady] = useState(false)
  const [recap, setRecap] = useState(null)
  const [isEmpty, setIsEmpty] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready || !isAuthenticated) return
    setLoading(true)
    api.get('/users/me/recap')
      .then((res) => {
        if (res.data.isEmpty) setIsEmpty(true)
        else setRecap(res.data.recap)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [ready, isAuthenticated])

  if (!ready) return <div className="text-cyber-text animate-pulse">Cargando...</div>

  if (!isAuthenticated) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-4">
        <div className="text-6xl">🎧</div>
        <h1 className="text-3xl font-black">Tu Recap te espera</h1>
        <p className="text-cyber-text max-w-md mx-auto">
          Inicia sesión para ver tu resumen personal: minutos escuchados, artistas favoritos y logros.
        </p>
        <Link href="/login" className="btn-primary inline-block">Iniciar sesión</Link>
      </div>
    )
  }

  if (loading) return <div className="text-cyber-text animate-pulse">Cargando...</div>
  if (error) return <div className="text-cyber-text">No se pudo cargar tu recap. Intenta de nuevo.</div>
  if (recap === null && !isEmpty) return <div className="text-cyber-text animate-pulse">Cargando...</div>

  if (isEmpty) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-4">
        <div className="text-6xl">📈</div>
        <h1 className="text-3xl font-black">Aún no tienes historial</h1>
        <p className="text-cyber-text max-w-md mx-auto">
          Escucha algunas canciones para que empecemos a armar tu recap personalizado.
        </p>
        <Link href="/" className="btn-primary inline-block">Escuchar música</Link>
      </div>
    )
  }

  const totalMinutes = Math.round(recap.totalSeconds / 60)
  const maxMonth = Math.max(...recap.months.map((m) => m.count), 1)
  const maxDay = Math.max(...Object.values(recap.dayTimes), 1)
  const dayLabels = [
    { key: 'night', label: 'Madrugada', color: 'bg-indigo-500' },
    { key: 'morning', label: 'Mañana', color: 'bg-amber-400' },
    { key: 'afternoon', label: 'Tarde', color: 'bg-cyber-cyan' },
    { key: 'evening', label: 'Noche', color: 'bg-cyber-purple' }
  ]
  const stats = [
    { icon: Clock, label: 'Minutos escuchados', value: formatMinutes(totalMinutes) },
    { icon: Headphones, label: 'Reproducciones', value: recap.plays },
    { icon: Disc3, label: 'Canciones distintas', value: recap.uniqueSongs },
    { icon: Mic2, label: 'Artistas', value: recap.uniqueArtists }
  ]

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyber-purple via-cyber-pink to-cyber-cyan p-8 sm:p-12 shadow-neon">
        <div className="relative z-10">
          <p className="text-white/80 text-sm uppercase tracking-widest mb-2">Tu resumen personal</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Tu Recap</h1>
          <p className="text-white/90">
            {formatMinutes(totalMinutes)} de música · {recap.plays} reproducciones · {recap.uniqueArtists} artistas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-panel p-5 rounded-2xl">
            <Icon size={22} className="text-cyber-cyan mb-3" />
            <p className="text-3xl font-black">{value}</p>
            <p className="text-cyber-text text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {recap.topSongs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={22} className="text-cyber-yellow" /> Tus canciones más escuchadas
          </h2>
          <div className="bg-cyber-panel/40 rounded-2xl overflow-hidden border border-cyber-border/50">
            {recap.topSongs.map((song, i) => (
              <div key={song.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                <span className={`w-8 text-center font-black text-lg ${i === 0 ? 'text-cyber-yellow' : i === 1 ? 'text-cyber-text' : i === 2 ? 'text-amber-600' : 'text-cyber-text/60'}`}>
                  {i + 1}
                </span>
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-gradient-cyber flex items-center justify-center">
                  {song.album?.coverImage ? (
                    <img src={song.album.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white">♪</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{song.title}</p>
                  <p className="text-cyber-text text-sm truncate">{song.artist?.name}</p>
                </div>
                <span className="text-cyber-text text-sm whitespace-nowrap">{song.times}×</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Tus artistas</h2>
          <div className="space-y-3">
            {recap.topArtists.map((artist, i) => (
              <Link key={artist.id} href={`/artist/${artist.id}`} className="flex items-center gap-4 glass-panel p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-gradient-cyber flex items-center justify-center text-white font-black shrink-0">
                  {artist.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate group-hover:text-cyber-cyan transition-colors">{artist.name}</p>
                  <p className="text-cyber-text text-sm">#{i + 1} más escuchado</p>
                </div>
                <span className="text-cyber-text text-sm">{artist.times}×</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Tus géneros</h2>
          <div className="space-y-3">
            {recap.topGenres.map((genre, i) => (
              <div key={genre.genre + i} className="flex items-center gap-4 glass-panel p-4 rounded-2xl">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-cyber-purple/30 text-cyber-purple' : 'bg-cyber-panel text-cyber-text'}`}>
                  {genre.genre?.[0]?.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold capitalize truncate">{genre.genre}</p>
                  <p className="text-cyber-text text-sm">{genre.count} reproducciones</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Actividad por mes</h2>
          <div className="glass-panel p-6 rounded-2xl flex items-end justify-between gap-3 h-44">
            {recap.months.map((m) => (
              <div key={m.month} className="flex flex-col items-center gap-2 flex-1 group">
                <div
                  className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-cyber-purple to-cyber-cyan group-hover:opacity-80 transition-opacity"
                  style={{ height: `${Math.max((m.count / maxMonth) * 120, 8)}px` }}
                />
                <span className="text-cyber-text text-xs">{monthLabel(m.month)}</span>
                <span className="text-xs font-bold">{m.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">¿Cuándo escuchas?</h2>
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            {dayLabels.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-16 text-cyber-text text-sm">{label}</span>
                <div className="flex-1 h-3 bg-cyber-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${((recap.dayTimes[key] || 0) / maxDay) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-8 text-right">{recap.dayTimes[key] || 0}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {recap.badges.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Tus logros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recap.badges.map((badge) => (
              <div key={badge.title} className="glass-panel p-5 rounded-2xl flex items-start gap-4 border border-cyber-border/50">
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <p className="font-bold">{badge.title}</p>
                  <p className="text-cyber-text text-sm mt-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function monthLabel(monthStr) {
  const [, m] = monthStr.split('-')
  return MONTHS[parseInt(m, 10) - 1] || monthStr
}