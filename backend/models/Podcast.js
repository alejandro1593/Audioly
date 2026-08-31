const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Podcast = sequelize.define('Podcast', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  hostId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'artists',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  coverImage: {
    type: DataTypes.STRING(255)
  },
  genre: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'podcasts'
});

module.exports = Podcast;
