'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'

export default function PodcastPage() {
  const { id } = useParams()
  const [podcast, setPodcast] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const { data } = await api.get(`/podcasts/${id}`)
        setPodcast(data.podcast)
      } catch (error) {
        console.error('Error fetching podcast:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPodcast()
  }, [id])

  if (loading) return <div className="text-cyber-text">Cargando...</div>
  if (!podcast) return <div className="text-cyber-text">Podcast no encontrado</div>

  const episodes = podcast.episodes || []

  const playEpisode = (episode) => {
    const queue = episodes.map((e) => ({
      id: e.id,
      title: e.title,
      artist: { id: podcast.host?.id, name: podcast.host?.name || 'Podcast' },
      album: { id: podcast.id, title: podcast.title, coverImage: podcast.coverImage },
      url: e.audioUrl,
      coverImage: podcast.coverImage,
      duration: e.duration,
      isPodcast: true
    }))
    playIfLoggedIn(queue.find((q) => q.id === episode.id), queue)
  }

  return (
    <div>
      <div className="flex items-end gap-6 mb-8 flex-wrap">
        {podcast.coverImage ? (
          <img src={podcast.coverImage} alt={podcast.title} className="w-48 h-48 rounded shadow-2xl object-cover" />
        ) : (
          <div className="w-48 h-48 bg-gradient-to-br from-cyber-purple to-cyber-magenta rounded shadow-2xl flex items-center justify-center text-7xl">
            🎙
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold text-cyber-text mb-1">Podcast</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 text-white break-words">{podcast.title}</h1>
          <p className="flex flex-wrap items-center gap-2 text-cyber-text">
            {podcast.host?.name && <span className="text-cyber-cyan font-bold">{podcast.host.name}</span>}
            {podcast.genre && <><span>•</span><span>{podcast.genre}</span></>}
            <span>•</span>
            <span>{episodes.length} episodios</span>
          </p>
        </div>
      </div>

      {podcast.description && (
        <p className="text-cyber-text mb-8 max-w-2xl">{podcast.description}</p>
      )}

      <section className="glass-panel rounded-2xl overflow-hidden">
        <h2 className="px-6 py-4 text-xl font-bold border-b border-cyber-border text-white">Episodios</h2>
        {episodes.length === 0 ? (
          <p className="text-cyber-text px-6 py-4">No hay episodios disponibles.</p>
        ) : (
          episodes.map((episode, index) => (
            <div
              key={episode.id}
              onClick={() => playEpisode(episode)}
              className="flex items-center gap-4 px-6 py-4 text-cyber-text hover:bg-white/5 hover:text-white cursor-pointer transition-colors border-b border-cyber-border/40"
            >
              <button className="w-10 h-10 bg-cyber-panel rounded-full flex items-center justify-center text-white shrink-0 hover:bg-gradient-cyber shadow-glow transition-all">
                ▶
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  <span className="text-cyber-text mr-2">{index + 1}</span>
                  {episode.title}
                </p>
                {episode.description && <p className="text-sm truncate">{episode.description}</p>}
              </div>
              <div className="text-sm text-right shrink-0">
                {episode.releaseDate ? (
                  <p>{new Date(episode.releaseDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                ) : (
                  <p>—</p>
                )}
                <p className="text-cyber-text/70">{formatDuration(episode.duration)}</p>
              </div>
            </div>
          ))
        )}
      </section>

      {LoginPrompt}
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}