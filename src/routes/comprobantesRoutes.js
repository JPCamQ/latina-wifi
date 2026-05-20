const express = require('express');
const upload = require('../middleware/upload');
const { crearComprobante, obtenerComprobantes, actualizarComprobante } = require('../controllers/comprobantesController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ruta pública para crear comprobantes
router.post('/', upload.single('comprobante'), crearComprobante);

// Rutas protegidas para el admin
router.get('/', authenticateToken, obtenerComprobantes);
router.put('/:id', authenticateToken, actualizarComprobante);

module.exports = router;