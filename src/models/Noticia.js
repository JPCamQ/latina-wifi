// 📂 src/models/Noticia.js - VERSIÓN CORREGIDA
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Noticia = sequelize.define('Noticia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  autor: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Administrador'
  },
  estado: {
    type: DataTypes.ENUM('publicada', 'borrador'), // ✅ CORREGIDO
    defaultValue: 'publicada'
  },
  tipo: {
    type: DataTypes.ENUM('noticia', 'alerta'),
    allowNull: false,
    defaultValue: 'noticia'
  },
  fecha_publicacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'noticias',
  timestamps: true
});

module.exports = Noticia;