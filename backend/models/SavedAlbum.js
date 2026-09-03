const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedAlbum = sequelize.define('SavedAlbum', {
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
  albumId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    }
  }
}, {
  tableName: 'saved_albums',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'album_id']
    }
  ]
});

module.exports = SavedAlbum;
