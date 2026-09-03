const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlaylistCollaborator = sequelize.define('PlaylistCollaborator', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'playlist_collaborators',
  indexes: [
    {
      unique: true,
      fields: ['playlist_id', 'user_id']
    }
  ]
});

module.exports = PlaylistCollaborator;
