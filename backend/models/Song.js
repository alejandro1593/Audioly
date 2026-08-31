const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Song = sequelize.define('Song', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  artistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'artists',
      key: 'id'
    }
  },
  albumId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'albums',
      key: 'id'
    }
  },
  duration: {
    type: DataTypes.INTEGER, // seconds
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  coverImage: {
    type: DataTypes.STRING(255)
  },
  genre: {
    type: DataTypes.STRING(50)
  },
  plays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lyrics: {
    type: DataTypes.TEXT
  },
  releaseDate: {
    type: DataTypes.DATEONLY
  },
  isExplicit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'songs'
});

module.exports = Song;
