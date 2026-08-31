const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artist = sequelize.define('Artist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(255)
  },
  bio: {
    type: DataTypes.TEXT
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  monthlyListeners: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'artists'
});

module.exports = Artist;
