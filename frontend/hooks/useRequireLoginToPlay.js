import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { usePlayerStore } from '../store/usePlayerStore'
import LoginPromptModal from '../components/ui/LoginPromptModal'

export function useRequireLoginToPlay() {
  const { isAuthenticated } = useAuthStore()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const playIfLoggedIn = useCallback((song, queue) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    usePlayerStore.getState().playSong(song, queue)
  }, [isAuthenticated])

  const Modal = showLoginPrompt ? (
    <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
  ) : null

  return { playIfLoggedIn, LoginPrompt: Modal }
}
