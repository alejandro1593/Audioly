import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { useAuthStore } from '../store/useAuthStore'
import { getAudioUrl } from '../lib/audio'
import api from '../lib/api'

let sharedAudio = null

function getSharedAudio() {
  if (!sharedAudio && typeof window !== 'undefined') {
    sharedAudio = new Audio()
  }
  return sharedAudio
}

// Seek global compartido (usado por el Player y por los atajos de teclado)
export function seekTo(time) {
  const audio = getSharedAudio()
  if (audio && Number.isFinite(time)) {
    audio.currentTime = time
    usePlayerStore.getState().seek(time)
  }
}

export function seekRelative(delta) {
  const audio = getSharedAudio()
  if (audio && Number.isFinite(audio.currentTime)) {
    const target = Math.max(0, Math.min(audio.duration || audio.currentTime, audio.currentTime + delta))
    seekTo(target)
  }
}

export function togglePlay() {
  const state = usePlayerStore.getState()
  if (state.currentSong) {
    state.setPlaying(!state.isPlaying)
  }
}

// Un único elemento de audio para toda la app
export function useAudioPlayer() {
  const audioRef = useRef(null)

  if (!audioRef.current) {
    audioRef.current = getSharedAudio()
  }

  const audio = audioRef.current

  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const isMuted = usePlayerStore((s) => s.isMuted)
  const repeat = usePlayerStore((s) => s.repeat)
  const seek = usePlayerStore((s) => s.seek)
  const setPlaying = usePlayerStore((s) => s.setPlaying)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const next = usePlayerStore((s) => s.next)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const lastLoggedSongId = useRef(null)

  // Cambia la fuente cuando cambia la canción
  useEffect(() => {
    if (!audio || !currentSong) return
    audio.src = getAudioUrl(currentSong) || ''
    if (isPlaying) {
      audio.play().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id])

  // Play / pause
  useEffect(() => {
    if (!audio) return
    if (currentSong && isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying, currentSong, audio])

  // Volumen
  useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted, audio])

  // Repeat 'one' → loop nativo del elemento de audio
  useEffect(() => {
    if (audio) {
      audio.loop = repeat === 'one'
    }
  }, [repeat, audio])

  // Reset de progreso al cambiar de canción
  useEffect(() => {
    if (audio) {
      seek(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id])

  // Eventos del elemento de audio
  useEffect(() => {
    if (!audio) return

    const handleTimeUpdate = () => seek(audio.currentTime)
    const handleEnded = () => next()
    const handleError = () => {
      setPlaying(false)
      audio.pause()
    }
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [audio, seek, next, setPlaying, setDuration])

  // Registra la reproducción (historias + incrementar plays) una vez por canción
  useEffect(() => {
    if (!currentSong || !isPlaying || !isAuthenticated) return
    if (lastLoggedSongId.current === currentSong.id) return
    lastLoggedSongId.current = currentSong.id
    api.post(`/songs/${currentSong.id}/play`).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, isPlaying, isAuthenticated])

  // Pausa al cerrar la pestaña
  useEffect(() => {
    if (!audio) return
    const handleBeforeUnload = () => audio.pause()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [audio])

  return { audio, seekTo }
}