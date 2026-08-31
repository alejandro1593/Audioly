const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  coverImage: {
    type: DataTypes.STRING(255)
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'playlists'
});

module.exports = Playlist;
