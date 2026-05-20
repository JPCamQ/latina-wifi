const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cliente_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  zona_wifi: {
    type: DataTypes.ENUM('Casco Central', 'La Paraita'),
    allowNull: false
  },
  asunto: {
    type: DataTypes.ENUM('Falla de Conexión', 'Velocidad Lenta', 'Problema con PIN', 'Otro'),
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('abierto', 'en_proceso', 'resuelto'),
    defaultValue: 'abierto'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  respuesta_cliente: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_respuesta: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tickets',
  timestamps: true
});

module.exports = Ticket;
