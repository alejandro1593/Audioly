'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { User, Lock, Save } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, setUser } = useAuthStore()

  const [username, setUsername] = useState(user?.username || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  if (!isAuthenticated) return null

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const { data } = await api.put('/users/profile', { username, avatar })
      setUser(data.user)
      toast.success('Perfil actualizado')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword
      })
      toast.success('Contraseña actualizada')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <User size={28} className="text-cyber-purple" />
        <h1 className="text-3xl font-bold">Ajustes</h1>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-cyber rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-neon">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.username}</p>
            <p className="text-cyber-text text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4 pt-2 border-t border-cyber-border">
          <h3 className="font-semibold text-cyber-cyan">Editar perfil</h3>
          <div>
            <label className="text-cyber-text text-sm font-semibold block">Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-primary mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-cyber-text text-sm font-semibold block">URL del avatar (opcional)</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="input-primary mt-1 w-full"
            />
            {avatar && (
              <img
                src={avatar}
                alt="avatar preview"
                className="mt-3 w-16 h-16 object-cover rounded-full border border-cyber-border"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {savingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <form onSubmit={savePassword} className="space-y-4">
          <h3 className="font-semibold text-cyber-magenta flex items-center gap-2">
            <Lock size={18} /> Cambiar contraseña
          </h3>
          <div>
            <label className="text-cyber-text text-sm font-semibold block">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-primary mt-1 w-full"
              required
            />
          </div>
          <div>
            <label className="text-cyber-text text-sm font-semibold block">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-primary mt-1 w-full"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {savingPassword ? 'Cambiando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      <button onClick={() => router.push('/')} className="text-cyber-text hover:text-white text-sm">
        ← Volver al inicio
      </button>
    </div>
  )
}
