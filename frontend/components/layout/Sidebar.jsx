'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/useAuthStore'
import { useLibraryStore } from '../../store/useLibraryStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import api from '../../lib/api'
import { Play, Search, Home, Plus, LogOut } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { playlists } = useLibraryStore()
  const [createModal, setCreateModal] = useState(false)
  const [playlistName, setPlaylistName] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      useLibraryStore.getState().fetchPlaylists()
    }
  }, [isAuthenticated])

  const links = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/library', label: 'Tu Biblioteca', icon: Play }
  ]

  const createPlaylist = async () => {
    if (!playlistName.trim()) return
    try {
      await api.post('/playlists', { name: playlistName, isPublic: true })
      setCreateModal(false)
      setPlaylistName('')
      useLibraryStore.getState().fetchPlaylists()
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  const handleLogout = () => {
    useAuthStore.getState().logout()
    usePlayerStore.getState().clearQueue()
    router.push('/')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-cyber-dark/80 backdrop-blur-xl px-4 py-6 h-screen fixed left-0 top-0 z-40 border-r border-cyber-border/50">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-black tracking-tight">
          <span className="bg-gradient-cyber bg-clip-text text-transparent">Audio</span>
          <span className="text-white">ly</span>
        </h1>
      </div>

      <nav className="space-y-1 mb-10">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
            >
              <Icon size={20} className={active ? 'text-cyber-purple' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyber-text font-semibold uppercase text-xs tracking-widest">
            Tu Biblioteca
          </h3>
          {isAuthenticated && (
            <button
              onClick={() => setCreateModal(true)}
              className="text-cyber-text hover:text-white hover:scale-110 transition-transform"
              title="Nueva playlist"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {playlists.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlist/${playlist.id}`}
            className="flex items-center gap-3 p-2 text-cyber-text hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center text-white text-sm shadow-glow">
              ♪
            </div>
            <span className="truncate">{playlist.name}</span>
          </Link>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="border-t border-cyber-border pt-4 flex flex-col gap-2">
          <Link href="/login" className="text-cyber-text hover:text-white text-sm text-center py-2 hover:bg-white/5 rounded-lg transition-all">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn-primary text-center text-sm py-2">
            Regístrate
          </Link>
        </div>
      )}

      {isAuthenticated && (
        <div className="border-t border-cyber-border pt-3 flex items-center justify-between gap-2">
          <Link
            href={user?.id ? `/user/${user.id}` : '/'}
            className="flex items-center gap-2 text-cyber-text hover:text-white transition-all min-w-0"
          >
            <div className="w-8 h-8 bg-gradient-cyber rounded-full flex items-center justify-center text-white text-sm shadow-neon shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="truncate">{user?.username}</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyber-text hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      )}

      {createModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-cyber-panel p-6 rounded-2xl w-96 border border-cyber-border shadow-neon">
            <h2 className="text-xl font-bold mb-4">Crear playlist</h2>
            <input
              type="text"
              placeholder="Nombre de la playlist"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="input-primary mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCreateModal(false)} className="text-cyber-text hover:text-white px-4 py-2">
                Cancelar
              </button>
              <button onClick={createPlaylist} className="btn-primary">
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
