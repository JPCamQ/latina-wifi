const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const { authenticateToken } = require('../middleware/auth');

// Ruta pública para reportar soporte / quejas
router.post('/', ticketsController.crearTicket);

// Rutas protegidas del administrador
router.get('/', authenticateToken, ticketsController.obtenerTickets);
router.get('/estadisticas', authenticateToken, ticketsController.obtenerEstadisticas);
router.put('/:id', authenticateToken, ticketsController.actualizarTicket);

module.exports = router;
