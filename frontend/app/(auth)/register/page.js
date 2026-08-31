'use client'

import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  })
  const { registerUser, loading } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    registerUser(formData)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyber-black px-4 relative overflow-hidden">
      <div className="fixed top-0 right-1/3 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-cyber-purple/15 rounded-full blur-3xl pointer-events-none" />

      <Link href="/" className="text-3xl font-black mb-8">
        <span className="bg-gradient-cyber bg-clip-text text-transparent">Audio</span>
        <span className="text-white">ly</span>
      </Link>

      <div className="bg-cyber-panel/60 backdrop-blur-xl p-8 rounded-2xl w-full max-w-sm border border-cyber-border/50 shadow-glow">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-cyber-text text-sm font-semibold">Nombre de usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-primary mt-1"
              required
            />
          </div>

          <div>
            <label className="text-cyber-text text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-primary mt-1"
              required
            />
          </div>

          <div>
            <label className="text-cyber-text text-sm font-semibold">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-primary mt-1"
              minLength="6"
              required
            />
          </div>

          <div>
            <label className="text-cyber-text text-sm font-semibold">Tipo de cuenta</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-primary mt-1"
            >
              <option value="user">Usuario</option>
              <option value="artist">Artista</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={18} />
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-cyber-text mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-cyber-magenta font-bold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
