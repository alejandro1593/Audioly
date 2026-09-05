// Convierte rutas locales del backend (p. ej. /uploads/...) en URLs absolutas
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || ''

export function mediaUrl(url) {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url
  if (url.startsWith('/')) return `${API_BASE}${url}`
  return url
}