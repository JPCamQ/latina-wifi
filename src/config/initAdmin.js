const User = require('../models/User');
const Comprobante = require('../models/Comprobante');
const Ticket = require('../models/Ticket');
const Setting = require('../models/Setting');
const Noticia = require('../models/Noticia');
const Customer = require('../models/Customer');

const initAdminUser = async () => {
  try {
    console.log('🔄 Inicializando usuario admin...');
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password_hash: 'admin123',
        role: 'super_admin',
        nombre_completo: 'Administrador Principal'
      });
      console.log('✅ Usuario admin creado: admin / admin123');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  }
};

const initSettings = async () => {
  try {
    console.log('🔄 Inicializando configuraciones...');
    const bcvSetting = await Setting.findOne({ where: { key: 'bcv_rate' } });
    
    if (!bcvSetting) {
      await Setting.create({
        key: 'bcv_rate',
        value: '45.00'
      });
      console.log('✅ Configuración bcv_rate inicializada: 45.00 Bs/$');
    } else {
      console.log('ℹ️ Configuración bcv_rate ya existe:', bcvSetting.value);
    }
  } catch (error) {
    console.error('❌ Error inicializando configuraciones:', error);
  }
};

const initializeAll = async () => {
  try {
    console.log('🚀 Inicializando sistema Latina WiFi...');
    
    // Importamos y forzamos la sincronización de modelos si no existen
    const { sequelize } = require('./database');
    await sequelize.sync();
    console.log('✅ Modelos de base de datos sincronizados');
    
    await initAdminUser();
    await initSettings();
    
    // Consultar y actualizar la tasa BCV con valor real al iniciar el servidor
    try {
      const { fetchAndUpdateBCVRate } = require('../services/bcvService');
      await fetchAndUpdateBCVRate();
    } catch (bcvErr) {
      console.error('⚠️ No se pudo obtener la tasa BCV real al arrancar:', bcvErr.message);
    }
    
    console.log('✅ Sistema inicializado correctamente');
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
  }
};

// Ejecutar después de un breve delay
setTimeout(() => {
  initializeAll();
}, 2000);

module.exports = { initAdminUser, initSettings };