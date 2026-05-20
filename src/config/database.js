const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

// Determinar si debemos usar SQLite como fallback
let useSqlite = false;
try {
  const port = process.env.DB_PORT || 3306;
  const stdout = execSync(`netstat -ano | findstr :${port}`, { timeout: 1000, stdio: ['pipe', 'pipe', 'ignore'] });
  if (!stdout.toString().includes('LISTENING')) {
    useSqlite = true;
  }
} catch (e) {
  // Si findstr da error (código 1) es porque no encontró la línea, es decir, el puerto está cerrado
  useSqlite = true;
}

// Permitir forzar SQLite mediante .env
if (process.env.DB_DIALECT === 'sqlite') {
  useSqlite = true;
}

let sequelize;

if (useSqlite) {
  console.log('⚠️ [Database] MySQL no está activo en el puerto 3306. Iniciando fallback automático con SQLite local...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
    }
  });
} else {
  console.log('💾 [Database] MySQL activo detectado. Conectando a MySQL...');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER, 
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión establecida correctamente usando dialecto: ${sequelize.getDialect().toUpperCase()}`);
    
    // Sincronizar modelos
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada.');
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
  }
};

module.exports = { sequelize, testConnection };