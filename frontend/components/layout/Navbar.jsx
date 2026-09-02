'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Search, Menu } from 'lucide-react'

export default function Navbar({ onMenuClick }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-cyber-dark/70 backdrop-blur-xl px-6 py-3 flex items-center gap-4 border-b border-cyber-border/50">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 bg-cyber-panel border border-cyber-border rounded-full hover:text-cyber-cyan transition-all flex items-center justify-center"
          title="Menú"
        >
          <Menu size={18} />
        </button>
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-cyber-panel border border-cyber-border rounded-full hover:border-cyber-purple hover:shadow-neon transition-all flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => router.forward()}
          className="w-9 h-9 bg-cyber-panel border border-cyber-border rounded-full hover:border-cyber-cyan hover:shadow-neon-cyan transition-all flex items-center justify-center"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-md ml-4 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-text" />
        <input
          type="text"
          placeholder="¿Qué quieres escuchar?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-primary bg-cyber-dark rounded-full px-11"
        />
      </form>
    </header>
  )
}
