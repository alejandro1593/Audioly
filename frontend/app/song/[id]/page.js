'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '../../../lib/api'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'
import { usePlayerStore } from '../../../store/usePlayerStore'

export default function SongPage() {
  const { id } = useParams()
  const [song, setSong] = useState(null)
  const [lyrics, setLyrics] = useState('')
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()

  useEffect(() => {
    if (!id) return
    const fetchSong = async () => {
      setLoading(true)
      try {
        const [songRes, lyricsRes] = await Promise.all([
          api.get(`/songs/${id}`),
          api.get(`/songs/${id}/lyrics`).catch(() => ({ data: {} }))
        ])
        setSong(songRes.data.song)
        setLyrics(lyricsRes.data?.song?.lyrics || '')

        // Canciones relacionadas del mismo artista o álbum
        const artistId = songRes.data.song?.artistId
        const albumId = songRes.data.song?.albumId
        if (artistId || albumId) {
          const rel = await api.get('/songs', {
            params: { artistId: artistId || undefined, limit: 8 }
          }).catch(() => ({ data: {} }))
          setRelated(rel.data?.songs || [])
        }
      } catch (error) {
        console.error('Error fetching song:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSong()
  }, [id])

  if (loading) return <div className="text-cyber-text">Cargando...</div>
  if (!song) return <div className="text-cyber-text">Canción no encontrada</div>

  const queue = [song, ...related]
  const play = () => playIfLoggedIn(song, related.length ? queue : [song])

  return (
    <div>
      <div className="flex items-end gap-6 mb-8 flex-wrap">
        {song.coverImage ? (
          <img src={song.coverImage} alt={song.title} className="w-52 h-52 rounded shadow-2xl object-cover bg-cyber-panel" />
        ) : (
          <div className="w-52 h-52 bg-gradient-to-br from-purple-500 to-pink-500 rounded shadow-2xl flex items-center justify-center text-7xl">
            ♪
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold text-cyber-text mb-1">Canción</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 text-white break-words">{song.title}</h1>
          <p className="flex flex-wrap items-center gap-2 text-cyber-text">
            {song.artist?.name && (
              <>
                <Link href={`/artist/${song.artist.id}`} className="text-cyber-cyan font-bold hover:underline">
                  {song.artist.name}
                </Link>
                <span>•</span>
              </>
            )}
            {song.album?.title && (
              <Link href={`/album/${song.album.id}`} className="hover:underline">
                {song.album.title}
              </Link>
            )}
            {song.genre && <><span>•</span><span>{song.genre}</span></>}
            <span>•</span>
            <span>{formatDuration(song.duration)}</span>
            {song.isExplicit && <span className="bg-cyber-panel text-white px-2 py-0.5 rounded text-xs border border-cyber-border">E</span>}
          </p>
          <p className="text-cyber-text/70 text-sm mt-1">{song.plays} reproducciones</p>
        </div>
      </div>

      <button
        onClick={play}
        className="mb-8 w-14 h-14 bg-gradient-cyber rounded-full flex items-center justify-center text-2xl text-white hover:scale-105 hover:shadow-neon transition-transform shadow-xl"
        title="Reproducir"
      >
        ▶
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Letra</h2>
          {lyrics ? (
            <pre className="whitespace-pre-wrap font-body text-cyber-text leading-relaxed">{lyrics}</pre>
          ) : (
            <p className="text-cyber-text/70">Esta canción no tiene letra disponible.</p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-white">Más de {song.artist?.name || 'este artista'}</h2>
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_auto] gap-4 px-6 py-3 text-cyber-text text-sm border-b border-cyber-border/50">
              <span>#</span>
              <span>Título</span>
              <span>Duración</span>
            </div>
            {related.filter((s) => s.id !== song.id).slice(0, 10).map((s, index) => (
              <div
                key={s.id}
                onClick={() => playIfLoggedIn(s, related.length ? queue : [s])}
                className={`grid grid-cols-[40px_1fr_auto] gap-4 px-6 py-3 text-cyber-text hover:bg-white/5 hover:text-white cursor-pointer items-center transition-colors ${s.id === song.id ? 'bg-cyber-purple/10' : ''}`}
              >
                <span className="text-center">{index + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  {s.coverImage && <img src={s.coverImage} alt="" className="w-9 h-9 rounded object-cover" />}
                  <span className="truncate text-white font-semibold">{s.title}</span>
                </div>
                <span>{formatDuration(s.duration)}</span>
              </div>
            ))}
            {related.filter((s) => s.id !== song.id).length === 0 && (
              <p className="text-cyber-text/70 px-6 py-4">No hay más canciones de este artista.</p>
            )}
          </div>
        </section>
      </div>

      {LoginPrompt}
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}