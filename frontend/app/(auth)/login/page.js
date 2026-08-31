'use client'

import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { loginUser, loading } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    loginUser(email, password)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyber-black px-4 relative overflow-hidden">
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyber-magenta/10 rounded-full blur-3xl pointer-events-none" />

      <Link href="/" className="text-3xl font-black mb-8">
        <span className="bg-gradient-cyber bg-clip-text text-transparent">Audio</span>
        <span className="text-white">ly</span>
      </Link>

      <div className="bg-cyber-panel/60 backdrop-blur-xl p-8 rounded-2xl w-full max-w-sm border border-cyber-border/50 shadow-glow">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-cyber-text text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-primary mt-1"
              required
            />
          </div>

          <div>
            <label className="text-cyber-text text-sm font-semibold">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-primary mt-1"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-cyber-text mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-cyber-cyan font-bold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
