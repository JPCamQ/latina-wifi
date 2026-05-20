const { sequelize } = require('./database');
const Comprobante = require('../models/Comprobante');
const Contacto = require('../models/Contacto');

const actualizarBaseDatos = async () => {
    try {
        console.log('🔄 Actualizando estructura de la base de datos...');
        
        // Sincronizar los modelos con la base de datos (agregará las nuevas columnas)
        await Comprobante.sync({ alter: true });
        console.log('✅ Tabla comprobantes_pago actualizada');
        
        await Contacto.sync({ alter: true });
        console.log('✅ Tabla contactos actualizada');
        
        console.log('🎉 Base de datos actualizada correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error actualizando base de datos:', error);
        process.exit(1);
    }
};

// Ejecutar si se llama directamente
if (require.main === module) {
    actualizarBaseDatos();
}

module.exports = actualizarBaseDatos;