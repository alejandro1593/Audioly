const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlaylistLike = sequelize.define('PlaylistLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  playlistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'playlists',
      key: 'id'
    }
  }
}, {
  tableName: 'playlist_likes',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'playlist_id']
    }
  ]
});

module.exports = PlaylistLike;
