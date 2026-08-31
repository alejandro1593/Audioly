'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import AlbumCard from '../../../components/music/AlbumCard'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'

export default function ArtistPage() {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const { data } = await api.get(`/artists/${id}`)
        setArtist(data.artist)
      } catch (error) {
        console.error('Error fetching artist:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArtist()
  }, [id])

  if (loading) return <div className="text-cyber-text">Cargando...</div>
  if (!artist) return <div className="text-cyber-text">Artista no encontrado</div>

  // Flatten all songs from albums
  const allSongs = artist.albums?.flatMap(album => album.songs || []) || []

  const playAll = () => {
    if (allSongs.length) {
      playIfLoggedIn(allSongs[0], allSongs)
    }
  }

  const playAlbum = (album) => {
    if (album.songs?.length) {
      playIfLoggedIn(album.songs[0], album.songs)
    }
  }

  return (
    <div>
      <div className="relative h-64 mb-8 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/40 via-cyber-magenta/20 to-cyber-dark" />
        <div className="absolute bottom-0 left-0 p-6 flex items-end gap-4">
          {artist.image ? (
            <img src={artist.image} alt={artist.name} className="w-32 h-32 rounded-full object-cover ring-4 ring-cyber-purple/50 shadow-neon" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-cyber flex items-center justify-center text-5xl shadow-neon">
              {artist.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs uppercase font-bold mb-1 text-cyber-cyan">
              {artist.verified ? '✓ Artista verificado' : 'Artista'}
            </p>
            <h1 className="text-6xl font-black mb-2 text-white">{artist.name}</h1>
            <p className="text-cyber-text text-sm">
              {formatListeners(artist.monthlyListeners)} oyentes mensuales
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={playAll} className="w-14 h-14 bg-gradient-cyber rounded-full flex items-center justify-center text-2xl text-white hover:scale-105 hover:shadow-neon transition-all shadow-xl">
            ▶
          </button>
          <button className="btn-secondary text-sm">Seguir</button>
        </header>

        <section>
          <h2 className="text-2xl font-bold mb-4">Álbumes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artist.albums?.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>

        {artist.bio && (
          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Acerca de</h2>
            <p className="text-cyber-text">{artist.bio}</p>
          </section>
        )}
      </div>

      {LoginPrompt}
    </div>
  )
}

function formatListeners(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num?.toString()
}
