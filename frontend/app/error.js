'use client'

import Link from 'next/link'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-display font-bold bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink bg-clip-text text-transparent mb-2">
        500
      </p>
      <p className="text-cyber-text text-lg mb-2">Algo salió mal.</p>
      <p className="text-cyber-text/70 text-sm mb-8 max-w-md">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-xl bg-gradient-cyber text-white font-semibold shadow-neon hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl border border-cyber-border text-cyber-text hover:text-white hover:bg-cyber-dark transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}