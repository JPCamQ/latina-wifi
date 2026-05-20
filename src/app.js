// Importar dependencias
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

// Importar rutas
const comprobantesRoutes = require('./routes/comprobantesRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const noticiasRoutes = require('./routes/noticiasRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const customerRoutes = require('./routes/customerRoutes');

// Importar inicializador de admin y settings (se ejecuta automáticamente)
require('./config/initAdmin');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Crear directorios de uploads si no existen (necesario en producción/Render ya que Git no registra carpetas vacías)
const fs = require('fs');
const dirComprobantes = path.join(__dirname, '../public/uploads/comprobantes');
const dirNoticias = path.join(__dirname, '../public/uploads/noticias');

if (!fs.existsSync(dirComprobantes)) {
  fs.mkdirSync(dirComprobantes, { recursive: true });
  console.log('📁 Directorio de comprobantes inicializado:', dirComprobantes);
}
if (!fs.existsSync(dirNoticias)) {
  fs.mkdirSync(dirNoticias, { recursive: true });
  console.log('📁 Directorio de noticias inicializado:', dirNoticias);
}

// ======================
// MIDDLEWARES
// ======================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ======================
// RUTAS DEL FRONTEND (PÁGINAS HTML)
// ======================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/index.html'));
});

app.get('/soporte/renovar', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/renovar.html'));
});

app.get('/soporte', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/soporte.html'));
});

// Rutas del portal de clientes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/register.html'));
});

app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/portal.html'));
});

app.get('/noticias', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/noticias.html'));
});

app.get('/noticias/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/pages/noticia.html'));
});

// ======================
// RUTAS DEL PANEL ADMIN
// ======================

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/dashboard.html'));
});

// Panel de gestión de tickets de soporte
app.get('/admin/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/tickets.html'));
});

app.get('/admin/noticias', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/noticias.html'));
});

// ======================
// RUTAS DE LA API
// ======================

app.use('/api/comprobantes', comprobantesRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/config', settingsRoutes);
app.use('/api/customers', customerRoutes);

// Ruta de login API para admin
app.post('/api/admin/login', (req, res) => {
  const { login } = require('./controllers/authController');
  return login(req, res);
});

// Rutas de estado del sistema
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Latina WiFi Backend API',
    database: 'MySQL',
    version: '1.0'
  });
});

app.get('/api/db-status', async (req, res) => {
  try {
    const { sequelize } = require('./config/database');
    await sequelize.authenticate();
    res.json({ 
      database: 'connected',
      message: 'Conexión a MySQL establecida correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      database: 'error',
      error: error.message 
    });
  }
});

// ======================
// INICIAR SERVIDOR
// ======================

app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE (LATINA WIFI)');
  console.log('='.repeat(50));
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`👨‍💼 Admin: http://localhost:${PORT}/admin/login`);
  console.log(`📝 Registrar Pago: http://localhost:${PORT}/soporte/renovar`);
  console.log(`🎫 Soporte Técnico: http://localhost:${PORT}/soporte`);
  console.log('='.repeat(50));
  
  // Probar conexión a la base de datos
  await testConnection();

  // Inicializar planificador de actualización de tasa BCV (Lunes a Viernes 12:00 AM)
  const { initBCVScheduler } = require('./services/bcvService');
  initBCVScheduler();

  // Verificar configuración de email
  const { verifyEmailConfig } = require('./services/emailService');
  setTimeout(async () => {
      await verifyEmailConfig();
  }, 3000);
});