const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ListeningHistory = sequelize.define('ListeningHistory', {
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
  },
  durationPlayed: {
    type: DataTypes.INTEGER, // seconds listened
    defaultValue: 0
  }
}, {
  tableName: 'listening_history',
  timestamps: true,
  updatedAt: false
});

module.exports = ListeningHistory;
