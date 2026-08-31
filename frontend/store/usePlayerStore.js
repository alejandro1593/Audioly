import { create } from 'zustand'

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  queue: [],
  currentIndex: 0,
  shuffle: false,
  repeat: 'off',
  isMuted: false,

  playSong: (song, queue = []) => set({
    currentSong: song,
    isPlaying: true,
    progress: 0,
    queue,
    currentIndex: queue.indexOf(song)
  }),

  setPlaying: (isPlaying) => set({ isPlaying }),

  next: () => {
    const { queue, currentIndex, shuffle, repeat } = get()
    if (!queue.length) return

    let nextIndex

    if (shuffle) {
      let random
      do {
        random = Math.floor(Math.random() * queue.length)
      } while (random === currentIndex && queue.length > 1)
      nextIndex = random
    } else {
      nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : (repeat === 'all' ? 0 : currentIndex)
    }

    if (nextIndex === currentIndex && repeat !== 'all') return

    set({
      currentIndex: nextIndex,
      currentSong: queue[nextIndex],
      isPlaying: true,
      progress: 0
    })
  },

  previous: () => {
    const { queue, currentIndex } = get()
    if (!queue.length) return

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex
    set({
      currentIndex: prevIndex,
      currentSong: queue[prevIndex],
      isPlaying: true,
      progress: 0
    })
  },

  seek: (time) => set({ progress: time }),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  toggleMute: () => {
    const { isMuted, volume } = get()
    set({ isMuted: !isMuted })
    if (!isMuted && volume === 0) set({ volume: 0.7 })
  },

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  cycleRepeat: () => {
    const { repeat } = get()
    const modes = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeat)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    set({ repeat: nextMode })
  },

  addToQueue: (song) => set((state) => ({
    queue: [...state.queue, song]
  })),

  removeFromQueue: (index) => set((state) => ({
    queue: state.queue.filter((_, i) => i !== index)
  })),

  clearQueue: () => set({ queue: [], currentIndex: 0, currentSong: null, isPlaying: false })
}))
