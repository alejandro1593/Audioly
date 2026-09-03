import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePlayerStore = create(
  persist(
    (set, get) => ({
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

      playSong: (song, queue = []) => {
        let list = queue
        let idx = queue.indexOf(song)
        if (idx === -1) {
          list = [song, ...queue]
          idx = 0
        }
        return set({
          currentSong: song,
          isPlaying: true,
          progress: 0,
          queue: list,
          currentIndex: idx
        })
      },

      setPlaying: (isPlaying) => set({ isPlaying }),

      setProgress: (progress) => set({ progress }),

      setDuration: (duration) => set({ duration }),

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
          if (repeat === 'one') {
            nextIndex = currentIndex
          } else {
            nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : (repeat === 'all' ? 0 : currentIndex)
          }
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
        if (isMuted && volume === 0) set({ volume: 0.7 })
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

      addToQueueNext: (song) => set((state) => ({
        queue: [
          ...state.queue.slice(0, state.currentIndex + 1),
          song,
          ...state.queue.slice(state.currentIndex + 1)
        ]
      })),

      removeFromQueue: (index) => set((state) => {
        const queue = state.queue.filter((_, i) => i !== index)
        if (queue.length === 0) {
          return { queue: [], currentIndex: 0, currentSong: null, isPlaying: false }
        }
        let currentIndex = state.currentIndex
        if (index < state.currentIndex) currentIndex -= 1
        currentIndex = Math.min(currentIndex, queue.length - 1)
        return {
          queue,
          currentIndex,
          currentSong: queue[currentIndex] ?? state.currentSong
        }
      }),

      clearQueue: () => set({ queue: [], currentIndex: 0, currentSong: null, isPlaying: false, progress: 0 })
    }),
    {
      name: 'audioly-player',
      partialize: (state) => ({
        currentSong: state.currentSong,
        volume: state.volume,
        queue: state.queue,
        currentIndex: state.currentIndex,
        shuffle: state.shuffle,
        repeat: state.repeat,
        isMuted: state.isMuted
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isPlaying = false
          state.progress = 0
        }
      }
    }
  )
)