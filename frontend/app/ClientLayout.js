'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useLibraryStore } from '../store/useLibraryStore'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useAuthStore } from '../store/useAuthStore'
import { usePathname } from 'next/navigation'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import Player from '../components/player/Player'

export default function ClientLayout({ children }) {
  const { isAuthenticated } = useAuthStore()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useAudioPlayer()

  useEffect(() => {
    if (isAuthenticated) {
      useLibraryStore.getState().fetchLikedSongs()
    }
    setLoading(false)
  }, [isAuthenticated])

  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-cyber-black relative">
      {/* Orbes de luz decorativos */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-0 w-72 h-72 bg-cyber-magenta/10 rounded-full blur-3xl pointer-events-none" />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c1c46',
            color: '#fff',
            border: '1px solid #2a2a66'
          }
        }}
      />
      <Sidebar />
      <div className="md:ml-64 min-h-screen pb-player relative">
        <Navbar />
        <main className="px-6 py-4">{children}</main>
      </div>
      <Player />
    </div>
  )
}
