// 📂 src/config/updateSucursales.js
const { sequelize } = require('./database');

async function updateSucursales() {
  try {
    console.log('🔄 Actualizando opciones de sucursales...');
    
    // Actualizar la columna sucursal en la tabla comprobantes_pago
    await sequelize.query(`
      ALTER TABLE comprobantes_pago 
      MODIFY sucursal ENUM('Camaguán', 'Guayabal', 'Apartaderos', 'Uverito')
    `);
    
    console.log('✅ Sucursales actualizadas correctamente');
    
  } catch (error) {
    console.error('❌ Error actualizando sucursales:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateSucursales().then(() => {
    console.log('🎉 Actualización de sucursales completada');
    process.exit(0);
  });
}

module.exports = updateSucursales;