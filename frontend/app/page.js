'use client'

import { useState, useEffect } from 'react'
import api from '../lib/api'
import { usePlayerStore } from '../store/usePlayerStore'
import { useAuthStore } from '../store/useAuthStore'
import SongCard from '../components/music/SongCard'
import AlbumCard from '../components/music/AlbumCard'
import ArtistCard from '../components/music/ArtistCard'
import LoginPromptModal from '../components/ui/LoginPromptModal'

export default function HomePage() {
  const [topSongs, setTopSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const { isAuthenticated } = useAuthStore()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Buenos días')
    else if (hour < 20) setGreeting('Buenas tardes')
    else setGreeting('Buenas noches')

    const fetchData = async () => {
      try {
        const [songsRes, albumsRes, artistsRes] = await Promise.all([
          api.get('/songs/top'),
          api.get('/albums'),
          api.get('/artists', { params: { limit: 8 } })
        ])
        setTopSongs(songsRes.data.songs)
        setAlbums(albumsRes.data.albums)
        setArtists(artistsRes.data.artists)
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const playSong = (song, index) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    usePlayerStore.getState().playSong(song, topSongs)
  }

  return (
    <div className="space-y-10">
      <div className="pt-4">
        <h1 className="text-5xl font-black bg-gradient-cyber bg-clip-text text-transparent mb-2">
          {greeting}
        </h1>
        <p className="text-cyber-text">Redescubre la música con un sonido futurista</p>
      </div>

      {!isAuthenticated && (
        <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">¿Listo para escuchar música?</h2>
            <p className="text-cyber-text text-sm">Inicia sesión para reproducir canciones, crear playlists y más.</p>
          </div>
          <button
            onClick={() => setShowLoginPrompt(true)}
            className="btn-primary whitespace-nowrap"
          >
            Iniciar sesión
          </button>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Lo más escuchado</h2>
          <span className="text-xs uppercase tracking-widest text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/30 px-3 py-1 rounded-full">
            Trending
          </span>
        </div>
        {loading ? (
          <div className="text-cyber-text animate-pulse">Cargando...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topSongs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => playSong(song, index)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Álbumes nuevos</h2>
          <span className="text-xs uppercase tracking-widest text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-3 py-1 rounded-full">
            Nuevo
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Artistas nuevos</h2>
          <span className="text-xs uppercase tracking-widest text-cyber-pink bg-cyber-pink/10 border border-cyber-pink/30 px-3 py-1 rounded-full">
            Descubrir
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  )
}
