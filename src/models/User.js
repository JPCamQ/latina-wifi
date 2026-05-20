const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize; // 👈 Cambio aquí
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'validador', 'content_manager'),
    defaultValue: 'validador'
  },
  nombre_completo: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

// Método para verificar contraseña
User.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password_hash);
};

module.exports = User;