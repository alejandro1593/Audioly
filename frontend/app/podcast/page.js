'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '../../lib/api'

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const { data } = await api.get('/podcasts', { params: { limit: 40 } })
        setPodcasts(data.podcasts || [])
      } catch (error) {
        console.error('Error fetching podcasts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPodcasts()
  }, [])

  if (loading) return <div className="text-cyber-text">Cargando...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Podcasts</h1>
      <p className="text-cyber-text mb-6">Explora podcasts y episodios</p>

      {podcasts.length === 0 ? (
        <div className="text-cyber-text">No hay podcasts disponibles.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {podcasts.map((podcast) => (
            <Link
              key={podcast.id}
              href={`/podcast/${podcast.id}`}
              className="card group"
            >
              <div className="relative mb-3 overflow-hidden rounded-xl">
                {podcast.coverImage ? (
                  <img
                    src={podcast.coverImage}
                    alt={podcast.title}
                    className="w-full aspect-square object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-cyber rounded-xl flex items-center justify-center text-4xl opacity-80">
                    🎙
                  </div>
                )}
              </div>
              <h3 className="font-bold truncate group-hover:text-cyber-cyan transition-colors">{podcast.title}</h3>
              <p className="text-cyber-text text-sm truncate">
                {podcast.host?.name || podcast.genre || 'Podcast'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}