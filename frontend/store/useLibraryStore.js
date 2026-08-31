import { create } from 'zustand'

export const useLibraryStore = create((set, get) => ({
  playlists: [],
  likedSongs: [],
  history: [],
  loading: false,

  fetchPlaylists: async () => {
    set({ loading: true })
    try {
      const api = (await import('../lib/api')).default
      const { data } = await api.get('/playlists?byUser=true')
      set({ playlists: data.playlists, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('Error fetching playlists:', error)
    }
  },

  fetchLikedSongs: async () => {
    set({ loading: true })
    try {
      const api = (await import('../lib/api')).default
      const { data } = await api.get('/users/liked-songs')
      set({ likedSongs: data.songs, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('Error fetching liked songs:', error)
    }
  },

  fetchHistory: async () => {
    set({ loading: true })
    try {
      const api = (await import('../lib/api')).default
      const { data } = await api.get('/users/history')
      set({ history: data.history, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('Error fetching history:', error)
    }
  },

  addPlaylist: (playlist) => set((state) => ({
    playlists: [playlist, ...state.playlists]
  })),

  removePlaylist: (id) => set((state) => ({
    playlists: state.playlists.filter(p => p.id !== id)
  })),

  toggleLike: (song) => {
    const isLiked = get().likedSongs.some(s => s.id === song.id)
    set((state) => ({
      likedSongs: isLiked
        ? state.likedSongs.filter(s => s.id !== song.id)
        : [song, ...state.likedSongs]
    }))
  }
}))
