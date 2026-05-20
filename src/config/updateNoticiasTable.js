// 📂 src/config/updateNoticiasTable.js
const { sequelize } = require('./database');

async function updateNoticiasTable() {
  try {
    console.log('🔄 Actualizando estructura de la tabla noticias...');
    
    // Primero, verificar si la tabla existe
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'noticias'
    `);
    
    if (results.length === 0) {
      console.log('✅ La tabla noticias no existe, se creará automáticamente con el modelo actual');
      return;
    }
    
    // Actualizar la columna estado
    await sequelize.query(`
      ALTER TABLE noticias 
      MODIFY estado ENUM('publicada', 'borrador') DEFAULT 'publicada'
    `);
    
    console.log('✅ Columna "estado" actualizada correctamente a publicada/borrador');
    
    // Actualizar los registros existentes
    await sequelize.query(`
      UPDATE noticias 
      SET estado = 'publicada' 
      WHERE estado = 'activa'
    `);
    
    await sequelize.query(`
      UPDATE noticias 
      SET estado = 'borrador' 
      WHERE estado = 'inactiva'
    `);
    
    console.log('✅ Registros existentes actualizados correctamente');
    
  } catch (error) {
    console.error('❌ Error actualizando la tabla noticias:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateNoticiasTable().then(() => {
    console.log('🎉 Actualización completada');
    process.exit(0);
  });
}

module.exports = updateNoticiasTable;