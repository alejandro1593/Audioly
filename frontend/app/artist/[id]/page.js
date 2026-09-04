'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import AlbumCard from '../../../components/music/AlbumCard'
import ArtistCard from '../../../components/music/ArtistCard'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function ArtistPage() {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const { data } = await api.get(`/artists/${id}`)
        setArtist(data.artist)
        setFollowing(data.artist?.isFollowing || false)
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

  const handleFollow = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    try {
      if (following) {
        await api.delete(`/artists/${id}/follow`)
        setFollowing(false)
        toast.success(`Dejaste de seguir a ${artist.name}`)
      } else {
        await api.post(`/artists/${id}/follow`)
        setFollowing(true)
        toast.success(`Siguiendo a ${artist.name}`)
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Este artista no tiene cuenta para seguir')
      } else {
        toast.error('No se pudo actualizar el seguimiento')
      }
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
          <button
            onClick={handleFollow}
            className={`text-sm ${following ? 'btn-secondary' : 'btn-primary'}`}
          >
            {following ? 'Siguiendo ✓' : 'Seguir'}
          </button>
        </header>

        {artist.topSongs?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Canciones principales</h2>
            <div className="bg-cyber-panel/40 rounded-lg overflow-hidden">
              {artist.topSongs.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => playIfLoggedIn(song, allSongs)}
                  className="flex items-center gap-4 px-4 py-3 text-cyber-text hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                >
                  <span className="w-6 text-center font-bold">{index + 1}</span>
                  {song.album?.coverImage || song.coverImage ? (
                    <img src={song.album?.coverImage || song.coverImage} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-cyber-panel rounded flex items-center justify-center">♪</div>
                  )}
                  <span className="flex-1 truncate font-semibold text-white">{song.title}</span>
                  {song.isExplicit && (
                    <span className="bg-cyber-panel text-white px-2 py-0.5 rounded text-xs border border-cyber-border">E</span>
                  )}
                  <span className="text-sm">{formatDuration(song.duration)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold mb-4">Discografía</h2>
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

        {artist.relatedArtists?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Fanáticos también escuchan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {artist.relatedArtists.map((ra) => (
                <ArtistCard key={ra.id} artist={ra} />
              ))}
            </div>
          </section>
        )}
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

function formatListeners(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num?.toString()
}
