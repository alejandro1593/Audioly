'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useNotificationStore } from '../../store/useNotificationStore'

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore()
  const { notifications, unreadCount, fetch: fetchNotifications, markAllRead } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) return
    fetchNotifications()
    const t = setInterval(fetchNotifications, 30000)
    return () => clearInterval(t)
  }, [isAuthenticated, fetchNotifications])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen && unreadCount > 0) markAllRead()
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative w-9 h-9 bg-cyber-panel border border-cyber-border rounded-full flex items-center justify-center hover:border-cyber-purple hover:shadow-neon transition-all"
        title="Notificaciones"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-neon">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-cyber-darker/95 backdrop-blur-xl border border-cyber-border rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border/50">
            <h3 className="font-bold">Notificaciones</h3>
            <button
              onClick={() => markAllRead()}
              className="text-xs text-cyber-cyan hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} /> Marcar leídas
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-cyber-text text-sm text-center py-8">No tienes notificaciones</p>
            ) : (
              notifications.map((n) => {
                const href = n.entityType === 'playlist' ? `/playlist/${n.entityId}` : `/user/${n.entityId}`
                return (
                  <Link
                    key={n.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-cyber-border/30 ${!n.readAt ? 'bg-cyber-purple/10' : ''}`}
                  >
                    <div className="w-9 h-9 bg-gradient-cyber rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {n.actor?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-cyber-text leading-snug">{n.message}</p>
                      <p className="text-xs text-cyber-text/60 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.readAt && <span className="w-2 h-2 rounded-full bg-cyber-cyan shrink-0 mt-1.5 shadow-neon-cyan" />}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}