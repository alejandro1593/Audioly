'use client'

import { usePlayerStore } from '../../store/usePlayerStore'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { useLibraryStore } from '../../store/useLibraryStore'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Volume2, VolumeX } from 'lucide-react'
import api from '../../lib/api'

export default function Player() {
  const player = usePlayerStore()
  const { seek } = useAudioPlayer()

  if (!player.currentSong) return null

  const playPause = () => player.setPlaying(!player.isPlaying)

  const handleSeek = (e) => {
    seek(parseFloat(e.target.value))
  }

  const song = player.currentSong

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
        <button className="text-cyber-text hover:text-rose-400 transition-colors ml-2">
          <Heart size={18} />
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
            max={song.duration || 100}
            value={player.progress}
            onChange={handleSeek}
            className="flex-1 accent-cyber-purple"
          />
          <span className="text-xs text-cyber-text w-10">{formatTime(song.duration)}</span>
        </div>
      </div>

      <div className="w-1/4 flex items-center justify-end gap-3">
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
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}
