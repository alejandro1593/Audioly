'use client'

import { useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useLibraryStore } from '../../store/useLibraryStore'
import { seekTo } from '../../hooks/useAudioPlayer'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Volume2, VolumeX, ListMusic, X, Trash2 } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function Player() {
  const player = usePlayerStore()
  const [showQueue, setShowQueue] = useState(false)

  const isLiked = useLibraryStore((state) =>
    state.likedSongs.some((s) => s.id === player.currentSong?.id)
  )
  const { toggleLike } = useLibraryStore()

  if (!player.currentSong) return null

  const playPause = () => player.setPlaying(!player.isPlaying)

  const handleSeek = (e) => {
    seekTo(parseFloat(e.target.value))
  }

  const handleLike = async () => {
    const song = player.currentSong
    try {
      if (isLiked) {
        await api.delete(`/songs/${song.id}/like`)
      } else {
        await api.post(`/songs/${song.id}/like`)
      }
      toggleLike(song)
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo actualizar el like')
    }
  }

  const song = player.currentSong
  const trackDuration = player.duration || song.duration || 0

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-cyber-dark/80 backdrop-blur-xl px-4 flex items-center justify-between border-t border-cyber-border/50 z-50 ml-0 md:ml-64">
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        <div className="w-14 h-14 bg-gradient-cyber rounded-xl flex items-center justify-center text-lg shrink-0 shadow-neon">
          ♪
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold truncate">{song.title}</p>
          <p className="text-cyber-text text-sm truncate">{song.artist?.name}</p>
        </div>
        <button
          onClick={handleLike}
          className={`transition-colors ml-2 ${isLiked ? 'text-rose-400' : 'text-cyber-text hover:text-rose-400'}`}
          title={isLiked ? 'Quitar de tus canciones' : 'Añadir a tus canciones'}
        >
          <Heart size={18} className={isLiked ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="flex flex-col items-center w-1/2">
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={player.toggleShuffle}
            className={`text-cyber-text hover:text-white transition-colors ${player.shuffle ? 'text-cyber-purple' : ''}`}
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={player.previous}
            className="text-cyber-text hover:text-white text-xl"
          >
            <SkipBack size={22} />
          </button>
          <button
            onClick={playPause}
            className="w-10 h-10 bg-gradient-cyber rounded-full hover:scale-105 hover:shadow-neon transition-all flex items-center justify-center"
          >
            {player.isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
          </button>
          <button onClick={player.next} className="text-cyber-text hover:text-white text-xl">
            <SkipForward size={22} />
          </button>
          <button
            onClick={player.cycleRepeat}
            className={`text-cyber-text hover:text-white transition-colors ${player.repeat !== 'off' ? 'text-cyber-magenta' : ''}`}
          >
            <Repeat size={18} />
          </button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-cyber-text w-10 text-right">{formatTime(player.progress)}</span>
          <input
            type="range"
            min="0"
            max={trackDuration || 100}
            value={Math.min(player.progress, trackDuration || 100)}
            onChange={handleSeek}
            className="flex-1 accent-cyber-purple"
          />
          <span className="text-xs text-cyber-text w-10">{formatTime(trackDuration)}</span>
        </div>
      </div>

      <div className="w-1/4 flex items-center justify-end gap-3">
        <button
          onClick={() => setShowQueue(true)}
          className="text-cyber-text hover:text-white transition-colors relative"
          title="Ver cola"
        >
          <ListMusic size={18} />
          {player.queue.length > 1 && (
            <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-cyber-purple text-white rounded-full w-4 h-4 flex items-center justify-center">
              {player.queue.length}
            </span>
          )}
        </button>
        <button onClick={player.toggleMute} className="text-cyber-text hover:text-white transition-colors">
          {player.isMuted || player.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={player.volume}
          onChange={(e) => player.setVolume(parseFloat(e.target.value))}
          className="w-24 accent-cyber-cyan"
        />
      </div>

      {showQueue && (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-cyber-darker/95 backdrop-blur-xl border-l border-cyber-border z-50 flex flex-col ml-14">
          <div className="flex items-center justify-between p-4 border-b border-cyber-border">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ListMusic size={18} className="text-cyber-purple" /> Cola
              </h3>
              <p className="text-xs text-cyber-text">{player.queue.length} canciones</p>
            </div>
            <div className="flex items-center gap-2">
              {player.queue.length > 0 && (
                <button
                  onClick={player.clearQueue}
                  className="text-cyber-text hover:text-rose-400 transition-colors"
                  title="Vaciar cola"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setShowQueue(false)}
                className="text-cyber-text hover:text-white transition-colors"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {player.queue.length === 0 ? (
              <p className="text-cyber-text text-sm p-4">La cola está vacía</p>
            ) : (
              player.queue.map((q, index) => {
                const isCurrent = index === player.currentIndex
                return (
                  <div
                    key={`${q.id}-${index}`}
                    className={`flex items-center gap-3 p-2 rounded-lg group ${
                      isCurrent ? 'bg-cyber-purple/15 text-white' : 'hover:bg-cyber-dark'
                    }`}
                  >
                    <button
                      onClick={() => {
                        usePlayerStore.setState({
                          currentIndex: index,
                          currentSong: q,
                          isPlaying: true,
                          progress: 0
                        })
                      }}
                      className="shrink-0"
                    >
                      {isCurrent ? <Pause size={16} className="text-cyber-cyan" /> : <Play size={16} className="text-cyber-text group-hover:text-white" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${isCurrent ? 'text-cyber-cyan font-semibold' : ''}`}>{q.title}</p>
                      <p className="text-xs text-cyber-text truncate">{q.artist?.name}</p>
                    </div>
                    <button
                      onClick={() => player.removeFromQueue(index)}
                      className="text-cyber-text opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                      title="Quitar de la cola"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}
