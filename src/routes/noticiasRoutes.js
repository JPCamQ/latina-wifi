// 📂 src/routes/noticiasRoutes.js - VERSIÓN COMPLETAMENTE CORREGIDA
const express = require('express');
const router = express.Router();
const NoticiasController = require('../controllers/noticiasController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuración de multer para noticias
const storageNoticias = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/noticias'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'noticia-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadNoticias = multer({
  storage: storageNoticias,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// ✅ CORRECCIÓN: Usar las funciones del controlador correctamente
// Rutas públicas
router.get('/', (req, res) => NoticiasController.obtenerNoticias(req, res));
router.get('/notifications/subscribe', (req, res) => NoticiasController.suscribirNotificaciones(req, res));
router.get('/:id', (req, res) => NoticiasController.obtenerNoticia(req, res));

// Rutas protegidas (admin)
router.post('/', authenticateToken, uploadNoticias.single('imagen'), (req, res) => NoticiasController.crearNoticia(req, res));
router.get('/admin/todas', authenticateToken, (req, res) => NoticiasController.obtenerTodasNoticias(req, res));
router.put('/:id', authenticateToken, uploadNoticias.single('imagen'), (req, res) => NoticiasController.actualizarNoticia(req, res));
router.delete('/:id', authenticateToken, (req, res) => NoticiasController.eliminarNoticia(req, res));

module.exports = router;