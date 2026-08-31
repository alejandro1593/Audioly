import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'

export function useAudioPlayer() {
  const audioRef = useRef(null)
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    progress,
    next,
    previous,
    setPlaying,
    seek
  } = usePlayerStore()

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    if (currentSong) {
      audio.src = currentSong.url
      if (isPlaying) {
        audio.play()
      }
    }

    return () => {
      audio.pause()
    }
  }, [currentSong?.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying, currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      seek(audio.currentTime)
    }

    const handleEnded = () => {
      next()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [next, seek])

  return {
    audioRef,
    seek: (time) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time
        seek(time)
      }
    }
  }
}
