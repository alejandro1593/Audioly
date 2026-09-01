const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Song, Artist, Album } = require('../models');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Streaming de audio con soporte Range (para seek)
router.get('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song || !song.url) {
      return res.status(404).json({ success: false, message: 'Audio no encontrado' });
    }

    const isLocal = song.url.startsWith('/uploads/') || song.url.startsWith('uploads/');
    const filePath = isLocal
      ? path.join(UPLOADS_DIR, path.basename(song.url))
      : null;

    if (filePath && fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', getMime(filePath));
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': getMime(filePath)
        });

        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': getMime(filePath) });
        fs.createReadStream(filePath).pipe(res);
      }
    } else if (song.url.startsWith('http')) {
      // Audio externo: redirigir directamente a la URL
      return res.redirect(song.url);
    } else {
      return res.status(404).json({ success: false, message: 'Archivo de audio no disponible' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al reproducir el audio' });
  }
});

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.mp4': 'audio/mp4',
    '.flac': 'audio/flac',
    '.webm': 'audio/webm'
  };
  return mimes[ext] || 'application/octet-stream';
}

module.exports = router;
