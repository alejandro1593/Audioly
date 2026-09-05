# Audioly - Clon de Spotify

Clon de Spotify construido con **Node.js**, **Express**, **PostgreSQL** (Sequelize), **Next.js 14** y **Tailwind CSS**.

## Estructura

```
audioly/
├── backend/        # API REST (Express + PostgreSQL + Sequelize)
├── frontend/       # Aplicación (Next.js 14 + Tailwind CSS)
├── docker-compose.yml  # PostgreSQL en Docker
└── package.json    # Scripts raíz (dev backend + frontend juntos)
```

## Requisitos

- Node.js 18+
- Base de datos PostgreSQL (recomendado: **Neon** en la nube, o Docker/local)

## Configuración

### 1. Base de datos (PostgreSQL)

**Opción A - Neon (cloud, recomendado):**
Crea un proyecto en [neon.tech](https://neon.tech), copia la connection string y ponla en `backend/.env` como `DATABASE_URL`.

**Opción B - Docker:**
```bash
docker-compose up -d
```

**Opción C - Local:** crear una base de datos llamada `audioly`.

### 2. Backend

```bash
cd backend
cp .env.example .env  # Configurar DATABASE_URL (Neon) o credenciales locales
npm install
npm run db:seed       # Crea las tablas y datos de prueba
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Todo junto (desde la raíz)

```bash
npm install:all
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Credenciales de prueba (seed)

| Rol    | Email                 | Password   |
|--------|-----------------------|------------|
| admin  | admin@audioly.com     | admin123   |
| user   | carlos@audioly.com    | user123    |
| artist | badbunny@audioly.com  | artist123  |
| artist | rosalia@audioly.com   | artist123  |

## Funcionalidades

### Autenticación y usuarios
- Registro de usuarios y artistas
- Login JWT con refresh tokens
- Perfil editable (username, avatar con **subida de imagen / URL**, email)
- Cambio de contraseña
- Seguir / dejar de seguir usuarios y artistas
- Perfil público con seguidores, siguiendo y avatar

### Reproducción
- Player global persistente (no se detiene al navegar)
- Cola de reproducción, shuffle, repeat, volumen, seek
- Cólas por álbum/playlist/artista y reproducción individual
- Reproductor HTML5 desplegable con mini-player flotante
- Música real: pistas **SoundHelix** (libres de derechos), **Jamendo** y embeds de **Spotify**

### Mix automático (playlists generadas)
- **Mix del día**: canciones ponderadas por recencia de escucha (`1/(1+días)`)
- **Recuerdos (flashback)**: tus más escuchados de todo el historial
- Complemento con canciones con "me gusta" y relleno por género/artista similar

### Playlists
- Crear, editar, eliminar
- Añadir / quitar canciones y **reordenar con drag & drop**
- Públicas / privadas, like a playlists
- **Colaboradores**: invitar y gestionar otros usuarios
- **Compartir**: link público con token (`/playlist/shared/:token`)

### Canciones
- Like / unlike (`/liked`)
- Historial de reproducción y reproducciones por canción
- **Letras** por canción
- **Comentarios por canción** (añadir y eliminar los propios)

### Artistas y álbumes
- Página de artista mejorada: canciones top, discografía, artistas **similares**
- Seguimiento de artistas
- Álbumes con **guardado** (Saved Albums) y lista de canciones

### Descubrimiento y personalización
- Búsqueda global con **sugerencias** en vivo (canciones, artistas, álbumes, playlists, podcasts)
- Explorar (browse) y páginas por **género**
- Top personal (`/top`) y **Recap estilo Wrapped** (`/recap`): tus canciones, artistas y álbumes del año
- Recomendaciones basadas en historial

### Social
- Perfiles de usuario públicos
- **Notificaciones**: nuevos seguidores y colaboradores añadidos a playlists (campana en la barra, marcar leídas / todas)
- Avatares en sidebar, notificaciones, comentarios y perfiles

### Streaming / repositorio
- Endpoint de streaming propio (`/api/stream/songs/:id`)

### Podcasts
- Páginas de podcasts y episodios con reproducción

### Roles y administración
- Roles: `user`, `artist`, `admin`
- **Panel admin**: gestionar álbumes, artistas, canciones, podcasts
- **Upload** de contenido (canciones, álbumes, playlists, podcasts, episodios)

## API (resumen)

- `POST /api/auth/register | login | refresh-token` · `GET /api/auth/me`
- `POST | DELETE /api/auth/:id/follow` · `GET /api/users/:id`
- `GET /api/users/me/recap` · `GET /api/users/me/top` · `GET /api/users/mix?type=daily|flashback` · `POST /api/users/avatar`
- `GET /api/users/liked-songs | history | recommendations`
- `GET /api/songs | /top | /suggestions` · `GET /api/songs/:id` · `POST | DELETE /api/songs/:id/like` · `POST /api/songs/:id/play` · `GET /api/songs/:id/lyrics`
- `GET | POST /api/songs/:id/comments` · `DELETE /api/songs/comments/:commentId`
- `GET /api/albums | /saved | /:id | /:id/songs` · `POST /api/albums/:id/save`
- `GET /api/artists | /:id | /:id/songs` · `POST | DELETE /api/artists/:id/follow`
- `GET /api/playlists | /liked | /shared/:token` · CRUD + `/:id/songs`, `/:id/reorder`, `/:id/like`, `/:id/share`, `/:id/collaborators`
- `GET /api/notifications` · `PUT /api/notifications/read-all` · `PUT /api/notifications/:id/read`
- `GET /api/search?q=` · `GET /api/search/suggestions?q=`
- `GET /api/podcasts | /:id | /:id/episodes/:episodeId`
- `GET /api/genres | /featured` · `GET /api/stream/songs/:id`
- Proveedores externos: `/api/jamendo/tracks`, `/api/soundhelix/tracks`, `/api/spotify/tracks`

## Stack técnico

- **Backend**: Node.js, Express, Sequelize, PostgreSQL, JWT + refresh tokens, bcrypt, multer, axios
- **Frontend**: Next.js 14 (App Router), React, Zustand, Tailwind CSS, react-hot-toast, drag & drop
- **Fuentes de música**: SoundHelix, Jamendo, Spotify embeds

## Patrón de diseño

MVC + Services Layer:
```
controllers/  → Manejo HTTP
services/     → Lógica de negocio
models/       → Modelos Sequelize
routes/       → Endpoints
middlewares/  → Auth, validación, errores
```