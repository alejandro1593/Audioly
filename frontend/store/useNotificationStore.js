import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true })
    try {
      const api = (await import('../lib/api')).default
      const { data } = await api.get('/notifications')
      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        loading: false
      })
    } catch (error) {
      set({ loading: false })
    }
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })),
      unreadCount: 0
    }))
    try {
      const api = (await import('../lib/api')).default
      await api.put('/notifications/read-all')
    } catch (error) {
      console.error('Error marking read:', error)
    }
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
    try {
      const api = (await import('../lib/api')).default
      await api.put(`/notifications/${id}/read`)
    } catch (error) {
      console.error('Error marking read:', error)
    }
  },

  reset: () => set({ notifications: [], unreadCount: 0, loading: false })
}))