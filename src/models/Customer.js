const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;
const bcrypt = require('bcryptjs');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  banco_emisor_defecto: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  telefono_pago_movil_defecto: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cedula_pago_movil_defecto: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'customers',
  timestamps: true,
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password_hash) {
        customer.password_hash = await bcrypt.hash(customer.password_hash, 10);
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password_hash')) {
        customer.password_hash = await bcrypt.hash(customer.password_hash, 10);
      }
    }
  }
});

// Método para verificar contraseña
Customer.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password_hash);
};

module.exports = Customer;
