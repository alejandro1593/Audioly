const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PodcastEpisode = sequelize.define('PodcastEpisode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  podcastId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'podcasts',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  audioUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER // seconds
  },
  releaseDate: {
    type: DataTypes.DATEONLY
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'podcast_episodes'
});

module.exports = PodcastEpisode;
