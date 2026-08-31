const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlaylistSong = sequelize.define('PlaylistSong', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playlistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'playlists',
      key: 'id'
    }
  },
  songId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'songs',
      key: 'id'
    }
  }
}, {
  tableName: 'playlist_songs',
  timestamps: true,
  updatedAt: false
});

module.exports = PlaylistSong;
