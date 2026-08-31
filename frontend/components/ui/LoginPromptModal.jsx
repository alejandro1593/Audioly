'use client'

import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function LoginPromptModal({ onClose }) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-panel border border-cyber-border rounded-2xl p-8 w-full max-w-sm shadow-neon relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyber-text hover:text-white transition-colors text-xl"
        >
          ×
        </button>

        <div className="w-14 h-14 bg-gradient-cyber rounded-2xl flex items-center justify-center mb-5 shadow-neon">
          <Lock size={26} className="text-white" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Inicia sesión para reproducir</h2>
        <p className="text-cyber-text mb-8">
          Necesitas una cuenta de Audioly para escuchar canciones, crear playlists y guardar tu música favorita.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onClose(); router.push('/login') }}
            className="btn-primary w-full"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => { onClose(); router.push('/register') }}
            className="btn-secondary w-full"
          >
            Crear cuenta
          </button>
          <button onClick={onClose} className="text-cyber-text hover:text-white text-sm py-1">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
