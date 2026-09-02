import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-display font-bold bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink bg-clip-text text-transparent mb-2">
        404
      </p>
      <p className="text-cyber-text text-lg mb-2">We can't seem to find the page you are looking for.</p>
      <p className="text-cyber-text/70 text-sm mb-8">La página que buscas no existe o fue movida.</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-gradient-cyber text-white font-semibold shadow-neon hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  )
}