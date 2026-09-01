// Normaliza una canción plana (filas crudas de query) al formato que esperan los componentes
// (con artist/{id,name} y album/{id,title,coverImage})
export function normalizeSong(row) {
  if (!row) return row
  return {
    ...row,
    coverImage: row.coverImage || row.album_cover || row.cover_image || row.album?.coverImage || null,
    artist: row.artist
      ? row.artist
      : row.artist_id
        ? { id: row.artist_id, name: row.artist_name }
        : undefined,
    album: row.album
      ? row.album
      : row.album_id
        ? { id: row.album_id, title: row.album_title, coverImage: row.album_cover || row.cover_image || null }
        : undefined
  }
}

export function normalizeSongs(rows = []) {
  return rows.map(normalizeSong)
}
