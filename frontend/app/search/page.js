'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '../../lib/api'
import { useDebounce } from '../../hooks/useDebounce'
import { usePlayerStore } from '../../store/usePlayerStore'
import SongCard from '../../components/music/SongCard'
import AlbumCard from '../../components/music/AlbumCard'
import ArtistCard from '../../components/music/ArtistCard'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null)
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/search', {
          params: { q: debouncedQuery, type: activeTab === 'all' ? undefined : activeTab }
        })
        setResults(data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery, activeTab])

  const tabs = ['all', 'songs', 'artists', 'albums', 'playlists', 'podcasts']

  const playSongs = () => {
    if (results?.songs?.length) {
      usePlayerStore.getState().playSong(results.songs[0], results.songs)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Buscar</h1>

      <input
        type="text"
        placeholder="Canciones, artistas, álbumes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input-primary bg-cyber-dark max-w-md"
        autoFocus
      />

      {query && (
        <>
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white text-black'
                    : 'bg-cyber-dark text-white hover:bg-cyber-darker'
                }`}
              >
                {tab === 'all' ? 'Todo' : tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-cyber-text">Buscando...</div>
          ) : results ? (
            <div className="space-y-8">
              {(!activeTab || activeTab === 'all' || activeTab === 'songs') && results.songs?.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Canciones</h2>
                    <button onClick={playSongs} className="btn-primary text-sm">Reproducir</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.songs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        onPlay={() => usePlayerStore.getState().playSong(song, results.songs)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {(!activeTab || activeTab === 'all' || activeTab === 'artists') && results.artists?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Artistas</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.artists.map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              )}

              {(!activeTab || activeTab === 'all' || activeTab === 'albums') && results.albums?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Álbumes</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.albums.map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <p className="text-cyber-text">Escribe para buscar música</p>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SearchContent />
    </Suspense>
  )
}
