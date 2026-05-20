const Contacto = require('../models/Contacto');

const initContactos = async () => {
    try {
        await Contacto.sync({ force: false }); // force: false para no borrar datos existentes
        console.log('✅ Tabla de contactos sincronizada correctamente');
    } catch (error) {
        console.error('❌ Error sincronizando tabla contactos:', error);
    }
};

module.exports = initContactos;