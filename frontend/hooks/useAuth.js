import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login, logout, setUser } = useAuthStore()

  const loginUser = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.user, data.accessToken, data.refreshToken)
      toast.success(`¡Bienvenido, ${data.user.username}!`)
      router.push('/')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión')
      return { success: false, error: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  const registerUser = async (userData) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', userData)
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('¡Cuenta creada exitosamente!')
      router.push('/')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse')
      return { success: false, error: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  const logoutUser = () => {
    logout()
    toast.success('Sesión cerrada')
    router.push('/login')
  }

  const updateProfile = async (userData) => {
    setLoading(true)
    try {
      const { data } = await api.put('/users/profile', userData)
      setUser(data.user)
      toast.success('Perfil actualizado')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { loginUser, registerUser, logoutUser, updateProfile, loading }
}
