const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
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
  actorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false
});

module.exports = Notification;