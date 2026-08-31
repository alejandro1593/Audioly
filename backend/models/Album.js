const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Album = sequelize.define('Album', {
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
  coverImage: {
    type: DataTypes.STRING(255)
  },
  releaseDate: {
    type: DataTypes.DATEONLY
  },
  genre: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'albums'
});

module.exports = Album;
