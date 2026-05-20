const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Pequeña espera para asegurar que los modelos estén sincronizados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar si ya existe un admin
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      // Crear usuario admin por defecto
      await User.create({
        username: 'admin',
        password_hash: 'admin123', // Se encripta automáticamente
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

module.exports = createAdminUser;