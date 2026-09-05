'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '../../../lib/api'
import { mediaUrl } from '../../../lib/media'
import toast from 'react-hot-toast'
import { ListMusic, Users, UserPlus, UserCheck, Camera } from 'lucide-react'
import { useAuthStore } from '../../../store/useAuthStore'

export default function UserProfilePage() {
  const { id } = useParams()
  const { user: currentUser, isAuthenticated, setUser } = useAuthStore()
  const [user, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [following, setFollowing] = useState(false)
  const [togglingFollow, setTogglingFollow] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/users/${id}`)
      .then((res) => {
        setUserInfo(res.data.user)
        setFollowing(!!res.data.user?.isFollowing)
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const isOwnProfile = isAuthenticated && currentUser?.id === Number(id)

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    setUploadingAvatar(true)
    try {
      const { data } = await api.post('/users/avatar', formData)
      setUser(data.user)
      setUserInfo((prev) => prev ? { ...prev, avatar: data.user.avatar } : prev)
      toast.success('Avatar actualizado')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al subir el avatar')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para seguir usuarios')
      return
    }
    if (currentUser?.id === Number(id)) return
    setTogglingFollow(true)
    try {
      if (following) {
        await api.delete(`/auth/${id}/follow`)
        setFollowing(false)
      } else {
        await api.post(`/auth/${id}/follow`)
        setFollowing(true)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo actualizar el seguimiento')
    } finally {
      setTogglingFollow(false)
    }
  }

  if (loading) return <div className="text-cyber-text animate-pulse">Cargando...</div>
  if (notFound || !user) return <div className="text-cyber-text">Usuario no encontrado</div>

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <div className="w-28 h-28 bg-gradient-cyber rounded-full flex items-center justify-center text-white text-5xl font-black shadow-neon overflow-hidden">
            {user.avatar && user.avatar !== 'default-avatar.png' ? (
              <img src={mediaUrl(user.avatar)} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user.username?.[0]?.toUpperCase()
            )}
          </div>
          {isOwnProfile && (
            <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-cyber-cyan text-cyber-bg dark:text-cyber-bg flex items-center justify-center shadow-neon cursor-pointer hover:scale-110 transition-transform" title="Cambiar avatar">
              <Camera size={16} className={uploadingAvatar ? 'animate-spin' : ''} />
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </label>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-black">{user.username}</h1>
          <p className="text-cyber-text">{user.email}</p>
          <div className="flex gap-4 mt-3 text-sm text-cyber-text justify-center sm:justify-start">
            <span className="flex items-center gap-1">
              <Users size={14} className="text-cyber-cyan" /> {user.followersCount || 0} seguidores
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} className="text-cyber-purple" /> {user.followingCount || 0} siguiendo
            </span>
          </div>
          {currentUser?.id !== Number(id) && (
            <button
              onClick={handleFollow}
              disabled={togglingFollow}
              className={`mt-4 sm:mt-0 shrink-0 px-5 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                following ? 'bg-cyber-panel text-white hover:bg-white/10' : 'bg-gradient-cyber text-white shadow-glow'
              }`}
            >
              {following ? <span className="flex items-center gap-2"><UserCheck size={16} /> Siguiendo</span> : <span className="flex items-center gap-2"><UserPlus size={16} /> Seguir</span>}
            </button>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ListMusic size={22} className="text-cyber-cyan" /> Playlists públicas
        </h2>
        {user.playlists?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="card group"
              >
                <div className="w-full aspect-square bg-gradient-cyber rounded-xl flex items-center justify-center text-4xl opacity-80 mb-3">
                  ♪
                </div>
                <h3 className="font-bold truncate group-hover:text-cyber-cyan transition-colors">{playlist.name}</h3>
                <p className="text-cyber-text text-sm">Lista de reproducción</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-cyber-text">Sin playlists públicas todavía</p>
        )}
      </section>
    </div>
  )
}
