'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '../../../lib/api'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'
import { usePlayerStore } from '../../../store/usePlayerStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { Send, Trash2, MessageCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { mediaUrl } from '../../../lib/media'

export default function SongPage() {
  const { id } = useParams()
  const [song, setSong] = useState(null)
  const [lyrics, setLyrics] = useState('')
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/songs/${id}/comments`)
      setComments(res.data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }, [id])

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
    fetchComments()
  }, [id, fetchComments])

  const submitComment = async () => {
    if (!commentText.trim() || sending) return
    setSending(true)
    try {
      const res = await api.post(`/songs/${id}/comments`, { text: commentText.trim() })
      setComments((prev) => [res.data.comment, ...prev])
      setCommentText('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo publicar el comentario')
    } finally {
      setSending(false)
    }
  }

  const deleteComment = async (commentId) => {
    setDeletingId(commentId)
    try {
      await api.delete(`/songs/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo eliminar el comentario')
    } finally {
      setDeletingId(null)
    }
  }

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

      {song.similarArtists?.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <Sparkles size={20} className="text-cyber-cyan" /> Artistas que también podrían gustarte
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {song.similarArtists.map((artist) => (
              <Link key={artist.id} href={`/artist/${artist.id}`} className="card group">
                <div className="mb-3 flex justify-center">
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-cyber-purple/40 group-hover:ring-cyber-cyan transition-all"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-cyber flex items-center justify-center text-2xl shadow-neon">
                      <span>{artist.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-center truncate group-hover:text-cyber-cyan transition-colors">{artist.name}</h3>
                <p className="text-cyber-text text-sm text-center mt-1">Artista</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <MessageCircle size={20} className="text-cyber-cyan" /> Comentarios <span className="text-sm text-cyber-text font-normal">({comments.length})</span>
        </h2>

        <div className="glass-panel rounded-2xl p-4 mb-6">
          {isAuthenticated ? (
            <>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="¿Qué te parece esta canción?"
                rows={3}
                maxLength={500}
                className="input-primary w-full resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-cyber-text">{commentText.length}/500</span>
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim() || sending}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  {sending ? 'Publicando...' : <span className="flex items-center gap-2"><Send size={14} /> Publicar</span>}
                </button>
              </div>
            </>
          ) : (
            <p className="text-cyber-text text-sm text-center py-2">
              <Link href="/login" className="text-cyber-cyan hover:underline">Inicia sesión</Link> para dejar tu comentario
            </p>
          )}
        </div>

        {comments.length === 0 ? (
          <p className="text-cyber-text/70">Sé el primero en comentar esta canción.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="glass-panel rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-cyber rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-neon overflow-hidden">
                  {comment.user?.avatar && comment.user.avatar !== 'default-avatar.png' ? (
                    <img src={mediaUrl(comment.user.avatar)} alt={comment.user.username} className="w-full h-full object-cover" />
                  ) : (
                    comment.user?.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/user/${comment.user?.id}`} className="font-semibold text-cyber-cyan hover:underline">
                      {comment.user?.username}
                    </Link>
                    <span className="text-xs text-cyber-text">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-cyber-text break-words whitespace-pre-wrap">{comment.text}</p>
                </div>
                {(currentUser?.id === comment.user?.id || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    disabled={deletingId === comment.id}
                    className="text-cyber-text/50 hover:text-rose-400 transition-colors shrink-0"
                    title="Eliminar comentario"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

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

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}