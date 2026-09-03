'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import Link from 'next/link'
import { useRequireLoginToPlay } from '../../../hooks/useRequireLoginToPlay'
import { useAuthStore } from '../../../store/useAuthStore'
import { Pencil, Users, X, Check, UserPlus, ChevronUp, ChevronDown } from 'lucide-react'

export default function PlaylistPage() {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const [collabId, setCollabId] = useState('')
  const { user } = useAuthStore()
  const { playIfLoggedIn, LoginPrompt } = useRequireLoginToPlay()

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const { data } = await api.get(`/playlists/${id}`)
        setPlaylist(data.playlist)
        setName(data.playlist.name || '')
        setDescription(data.playlist.description || '')
        setIsCollaborative(!!data.playlist.isCollaborative)
        if (user?.id === data.playlist.userId) {
          fetchCollaborators()
        }
      } catch (error) {
        console.error('Error fetching playlist:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id])

  if (loading) return <div className="text-cyber-text">Cargando...</div>
  if (!playlist) return <div className="text-cyber-text">Playlist no encontrada</div>

  const isOwner = user?.id === playlist.userId
  const songs = playlist.songs || []

  const playAll = () => {
    if (songs.length) {
      playIfLoggedIn(songs[0], songs)
    }
  }

  const playSong = (song) => {
    playIfLoggedIn(song, songs)
  }

  const removeSong = async (songId, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/playlists/${id}/songs/${songId}`)
      const { data } = await api.get(`/playlists/${id}`)
      setPlaylist(data.playlist)
    } catch (error) {
      console.error('Error removing song:', error)
    }
  }

  const moveSong = async (index, direction) => {
    const list = [...(playlist.songs || [])]
    const target = index + direction
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    try {
      const { data } = await api.put(`/playlists/${id}/reorder`, { songIds: list.map((s) => s.id) })
      setPlaylist(data.playlist)
    } catch (error) {
      console.error('Error reordering:', error)
    }
  }

  const fetchCollaborators = async () => {
    try {
      const { data } = await api.get(`/playlists/${id}/collaborators`)
      setCollaborators(data.collaborators || [])
    } catch (error) {
      console.error('Error fetching collaborators:', error)
    }
  }

  const addCollaborator = async (e) => {
    e.preventDefault()
    if (!collabId.trim()) return
    try {
      await api.post(`/playlists/${id}/collaborators`, { userId: collabId })
      setCollabId('')
      fetchCollaborators()
    } catch (error) {
      console.error('Error adding collaborator:', error)
    }
  }

  const removeCollaborator = async (collabId, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/playlists/${id}/collaborators/${collabId}`)
      fetchCollaborators()
    } catch (error) {
      console.error('Error removing collaborator:', error)
    }
  }

  const totalDuration = songs.reduce((sum, s) => sum + s.duration, 0)

  const saveEdits = async () => {
    try {
      await api.put(`/playlists/${id}`, { name, description, isCollaborative })
      const { data } = await api.get(`/playlists/${id}`)
      setPlaylist(data.playlist)
      setEditing(false)
    } catch (error) {
      console.error('Error saving playlist:', error)
    }
  }

  const toggleCollaborative = async (e) => {
    e.stopPropagation()
    try {
      await api.put(`/playlists/${id}`, { isCollaborative: !isCollaborative })
      setIsCollaborative(!isCollaborative)
    } catch (error) {
      console.error('Error toggling collaborative:', error)
    }
  }

  return (
    <div>
      <div className="flex items-end gap-6 mb-8">
        {playlist.coverImage ? (
          <img src={playlist.coverImage} alt={playlist.name} className="w-48 h-48 rounded shadow-2xl object-cover" />
        ) : (
          <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded shadow-2xl flex items-center justify-center text-7xl">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase font-bold text-cyber-text mb-1">Playlist</p>
          {editing ? (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-3xl sm:text-4xl font-black bg-cyber-panel rounded-lg px-2 py-1 w-full mb-2 input-primary"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-primary w-full mb-3"
                rows={2}
                placeholder="Descripción"
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl font-black mb-3 break-words">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-cyber-text mb-2">{playlist.description}</p>
              )}
            </>
          )}
          <p className="flex items-center gap-2 text-cyber-text">
            <span className="text-white font-bold">{playlist.owner?.username}</span>
            <span>•</span>
            <span>{songs.length} canciones</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
            {isCollaborative && (
              <span className="flex items-center gap-1 text-xs bg-cyber-panel px-2 py-0.5 rounded-full text-cyber-cyan">
                <Users size={12} /> Colaborativa
              </span>
            )}
          </p>
          {isOwner && (
            <div className="flex items-center gap-3 mt-4">
              {editing ? (
                <>
                  <button onClick={saveEdits} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-cyber text-white font-semibold text-sm">
                    <Check size={16} /> Guardar
                  </button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cyber-panel text-cyber-text hover:text-white text-sm">
                    <X size={16} /> Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cyber-panel text-cyber-text hover:text-white text-sm">
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    onClick={toggleCollaborative}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-colors ${isCollaborative ? 'bg-cyber-purple/20 text-cyber-cyan' : 'bg-cyber-panel text-cyber-text hover:text-white'}`}
                  >
                    <Users size={15} /> {isCollaborative ? 'Colaborativa: sí' : 'Colaborativa: no'}
                  </button>
                </>
              )}
            </div>
          )}

          {isOwner && isCollaborative && collaborators.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-cyber-text text-xs uppercase font-bold mr-1">Colaboradores:</span>
              {collaborators.map((collab) => (
                <span key={collab.id} className="inline-flex items-center gap-1 bg-cyber-panel px-2 py-1 rounded-full text-sm text-white">
                  {collab.username}
                  <button
                    onClick={(ev) => removeCollaborator(collab.id, ev)}
                    className="text-cyber-text hover:text-rose-400 transition-colors"
                    title="Quitar colaborador"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {isOwner && isCollaborative && (
            <form onSubmit={addCollaborator} className="mt-3 flex items-center gap-2">
              <UserPlus size={16} className="text-cyber-cyan shrink-0" />
              <input
                type="text"
                value={collabId}
                onChange={(e) => setCollabId(e.target.value)}
                placeholder="ID de usuario a añadir"
                className="input-primary w-48 text-sm"
              />
              <button type="submit" className="btn-primary text-sm">Añadir</button>
            </form>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={playAll} className="w-14 h-14 bg-gradient-cyber rounded-full flex items-center justify-center text-2xl text-white hover:scale-105 transition-transform shadow-xl">
          ▶
        </button>
        <span className="text-cyber-text text-xl">♡</span>
        <span className="text-cyber-text text-xl">…</span>
      </div>

      {songs.length === 0 ? (
        <div className="bg-cyber-panel/40 rounded-lg p-8 text-center">
          <p className="text-2xl font-bold mb-2">Esta playlist está vacía</p>
          <p className="text-cyber-text">Añade canciones para empezar a escuchar</p>
        </div>
      ) : (
        <div className="bg-cyber-panel/40 rounded-lg">
          <div className="grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-2 text-cyber-text text-sm border-b border-cyber-border/50">
            <span>#</span>
            <span>Título</span>
            <span>Duración</span>
          </div>

          {songs.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              onClick={() => playSong(song)}
              className="grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-3 text-cyber-text hover:bg-white/5 hover:text-white cursor-pointer items-center group"
            >
              <span className="text-center">{index + 1}</span>
              <div className="flex items-center gap-3 min-w-0">
                {song.coverImage ? (
                  <img src={song.coverImage} alt="" className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-cyber-panel rounded flex items-center justify-center">♪</div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-white font-semibold">{song.title}</p>
                  <Link
                    href={`/artist/${song.artist?.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm hover:underline"
                  >
                    {song.artist?.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span>{formatDuration(song.duration)}</span>
                {(playlist.canEdit ?? isOwner) && (
                  <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSong(index, -1) }}
                      disabled={index === 0}
                      className="text-cyber-text hover:text-white disabled:opacity-30"
                      title="Subir"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSong(index, 1) }}
                      disabled={index === songs.length - 1}
                      className="text-cyber-text hover:text-white disabled:opacity-30"
                      title="Bajar"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                )}
                {(playlist.canEdit ?? isOwner) && (
                  <button
                    onClick={(e) => removeSong(song.id, e)}
                    className={`opacity-0 transition-opacity text-cyber-text hover:text-white ${(playlist.canEdit ?? isOwner) ? 'group-hover:opacity-100' : ''}`}
                    title="Quitar de la playlist"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {LoginPrompt}
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0 min'
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}
