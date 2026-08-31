# Audioly - Spotify Clone

Clon de Spotify construido con **Node.js**, **Express**, **PostgreSQL** (Sequelize), **Next.js** y **Tailwind CSS**.

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

| Rol     | Email            | Password   |
|---------|------------------|------------|
| admin   | admin@audioly.com| admin123   |
| user    | carlos@audioly.com| user123   |
| artist  | badbunny@audioly.com | artist123 |
| artist  | rosalia@audioly.com  | artist123 |

## Funcionalidades

- Autenticación JWT con refresh tokens
- Registro de usuarios y artistas
- Reproducción de música (player global)
- Cólas de reproducción, shuffle, repeat
- Búsqueda global (canciones, artistas, álbumes, playlists, podcasts)
- Playlists (crear, editar, eliminar, añadir/eliminar canciones)
- Canciones guardadas (likes)
- Historial de escucha
- Bibliotecas personalizadas
- Perfiles de artistas y álbumes
- Podcasts y episodios
- Roles: user, artist, admin

## Stack técnico

- **Backend**: Node.js, Express, Sequelize, PostgreSQL, JWT, bcrypt, multer
- **Frontend**: Next.js 14 (App Router), React, Zustand, Tailwind CSS, react-hot-toast

## Patrón de diseño

MVC + Services Layer:
```
controllers/  → Manejo HTTP
services/     → Lógica de negocio
models/       → Modelos Sequelize
routes/       → Endpoints
middlewares/  → Auth, validación, errores
```
