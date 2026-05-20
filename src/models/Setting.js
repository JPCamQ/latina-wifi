const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'settings',
  timestamps: true
});

module.exports = Setting;
