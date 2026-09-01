const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/songs', require('./routes/song.routes'));
app.use('/api/albums', require('./routes/album.routes'));
app.use('/api/artists', require('./routes/artist.routes'));
app.use('/api/playlists', require('./routes/playlist.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/podcasts', require('./routes/podcast.routes'));

// Streaming de audio (Range headers)
app.use('/api/stream', require('./routes/stream.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(require('./middlewares/error.middleware'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sincroniza modelos (crea tablas si no existen).
    // Para cambios de esquema usar el seed o migraciones.
    await sequelize.sync();

    // Migraciones manuales ligeras (sin alter completo, evita costo en Neon)
    await sequelize.query('ALTER TABLE playlists ADD COLUMN IF NOT EXISTS is_collaborative BOOLEAN DEFAULT false;');

    console.log('Models synchronized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
