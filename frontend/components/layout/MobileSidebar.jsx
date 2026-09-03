'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/useAuthStore'
import { useLibraryStore } from '../../store/useLibraryStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import api from '../../lib/api'
import { Play, Search, Home, Plus, LogOut, X, Shield, UploadCloud } from 'lucide-react'

export default function MobileSidebar({ open, onClose }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { playlists } = useLibraryStore()
  const [playlistName, setPlaylistName] = useState('')

  const links = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/library', label: 'Tu Biblioteca', icon: Play }
  ]

  const createPlaylist = async () => {
    const name = playlistName.trim() || window.prompt('Nombre de la playlist')
    if (!name) return
    try {
      await api.post('/playlists', { name, isPublic: true })
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
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-72 bg-cyber-dark/95 backdrop-blur-xl flex flex-col px-4 py-6 border-r border-cyber-border shadow-neon overflow-y-auto">
        <div className="flex items-center justify-between mb-8 px-2">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="bg-gradient-cyber bg-clip-text text-transparent">Audio</span>
            <span className="text-white">ly</span>
          </h1>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-cyber-panel rounded-full flex items-center justify-center text-cyber-text hover:text-white transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 mb-8">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
              >
                <Icon size={20} className={active ? 'text-cyber-purple' : ''} />
                {label}
              </Link>
            )
          })}
        </nav>

        {user?.role === 'admin' && (
          <nav className="space-y-1 mb-6">
            <Link href="/admin" onClick={onClose} className={`sidebar-link ${pathname === '/admin' ? 'sidebar-link-active' : ''}`}>
              <Shield size={20} className="text-cyber-cyan" />
              Panel Admin
            </Link>
          </nav>
        )}

        {(user?.role === 'admin' || user?.role === 'artist') && (
          <nav className="space-y-1 mb-6">
            <Link href="/upload" onClick={onClose} className={`sidebar-link ${pathname === '/upload' ? 'sidebar-link-active' : ''}`}>
              <UploadCloud size={20} className="text-cyber-green" />
              Subir canción
            </Link>
          </nav>
        )}

        <div className="flex-1 overflow-y-auto px-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyber-text font-semibold uppercase text-xs tracking-widest">Tu Biblioteca</h3>
            {isAuthenticated && (
              <button onClick={createPlaylist} className="text-cyber-text hover:text-white hover:scale-110 transition-transform" title="Nueva playlist">
                <Plus size={20} />
              </button>
            )}
          </div>
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2 text-cyber-text hover:text-white rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center text-white text-sm shadow-glow">♪</div>
              <span className="truncate">{playlist.name}</span>
            </Link>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="border-t border-cyber-border pt-4 flex flex-col gap-2">
            <Link href="/login" onClick={onClose} className="text-cyber-text hover:text-white text-sm text-center py-2 hover:bg-white/5 rounded-lg transition-all">
              Iniciar sesión
            </Link>
            <Link href="/register" onClick={onClose} className="btn-primary text-center text-sm py-2">
              Regístrate
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="border-t border-cyber-border pt-3 flex items-center justify-between gap-2">
            <Link
              href={user?.id ? `/user/${user.id}` : '/'}
              onClick={onClose}
              className="flex items-center gap-2 text-cyber-text hover:text-white transition-all min-w-0"
            >
              <div className="w-8 h-8 bg-gradient-cyber rounded-full flex items-center justify-center text-white text-sm shadow-neon shrink-0">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="truncate">{user?.username}</span>
            </Link>
            <button onClick={handleLogout} title="Cerrar sesión" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyber-text hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}