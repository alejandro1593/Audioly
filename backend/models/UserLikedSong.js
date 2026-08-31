const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserLikedSong = sequelize.define('UserLikedSong', {
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
  songId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'songs',
      key: 'id'
    }
  }
}, {
  tableName: 'user_liked_songs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'song_id']
    }
  ]
});

module.exports = UserLikedSong;
