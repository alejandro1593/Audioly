import './globals.css'
import ClientLayout from './ClientLayout'

export const metadata = {
  title: 'Audioly - Música sin límites',
  description: 'Escucha música, crea playlists y descubre artistas en Audioly'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
