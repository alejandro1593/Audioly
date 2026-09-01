'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import { ListMusic, Users } from 'lucide-react'

export default function UserProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/users/${id}`)
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-cyber-text animate-pulse">Cargando...</div>
  if (notFound || !user) return <div className="text-cyber-text">Usuario no encontrado</div>

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-28 h-28 bg-gradient-cyber rounded-full flex items-center justify-center text-white text-5xl font-black shadow-neon shrink-0">
          {user.username?.[0]?.toUpperCase()}
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
