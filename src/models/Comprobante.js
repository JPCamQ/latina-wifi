const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comprobante = sequelize.define('Comprobante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_cedula: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  cliente_nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cliente_email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  zona_wifi: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'General'
  },
  banco_emisor: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  banco_receptor: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  referencia: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  plan_solicitado: {
    type: DataTypes.ENUM('1 Hora ($0.50)', '24 Horas ($1.50)', '7 Días ($5.00)', '30 Días ($15.00)'),
    allowNull: false
  },
  monto_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  monto_bs: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  tasa_bcv: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false
  },
  comprobante_img_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'verificado', 'rechazado'),
    defaultValue: 'pendiente'
  },
  pin_entregado: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notificado_cliente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mensaje_cliente: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_notificacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  }
}, {
  tableName: 'comprobantes_pago',
  timestamps: true
});

module.exports = Comprobante;