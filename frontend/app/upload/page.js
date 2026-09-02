'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../lib/api'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function UploadPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [artists, setArtists] = useState([])
  const [title, setTitle] = useState('')
  const [artistId, setArtistId] = useState('')
  const [genre, setGenre] = useState('')
  const [duration, setDuration] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin' && user?.role !== 'artist') {
      router.replace('/')
      return
    }
    if (isAuthenticated) {
      api.get('/artists', { params: { limit: 100 } })
        .then(({ data }) => setArtists(data.artists || []))
        .catch((err) => console.error('Error fetching artists:', err))
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'artist')) {
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !artistId || !audioFile) {
      toast.error('Completa título, artista y archivo de audio')
      return
    }
    const formData = new FormData()
    formData.append('title', title)
    formData.append('artistId', artistId)
    formData.append('genre', genre)
    formData.append('duration', duration || '0')
    formData.append('lyrics', lyrics)
    formData.append('audio', audioFile)

    setUploading(true)
    try {
      await api.post('/songs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Canción subida correctamente')
      router.push('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al subir la canción')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Subir canción</h1>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <label className="block text-cyber-text text-sm mb-1">Título *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-primary w-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-cyber-text text-sm mb-1">Artista *</label>
            <select value={artistId} onChange={(e) => setArtistId(e.target.value)} className="input-primary w-full">
              <option value="">Selecciona el artista</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-cyber-text text-sm mb-1">Género</label>
            <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} className="input-primary w-full" placeholder="Ej: Pop, Reggaeton" />
          </div>
        </div>

        <div>
          <label className="block text-cyber-text text-sm mb-1">Duración (segundos)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="input-primary w-full" placeholder="Ej: 210" />
        </div>

        <div>
          <label className="block text-cyber-text text-sm mb-1">Letra</label>
          <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} className="input-primary w-full" rows={4} />
        </div>

        <div>
          <label className="block text-cyber-text text-sm mb-1">Archivo de audio *</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-cyber-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyber-purple file:text-white file:cursor-pointer file:font-semibold hover:file:bg-cyber-glow"
          />
        </div>

        <button type="submit" disabled={uploading} className="btn-primary w-full disabled:opacity-50">
          {uploading ? 'Subiendo...' : 'Subir canción'}
        </button>
      </form>
    </div>
  )
}