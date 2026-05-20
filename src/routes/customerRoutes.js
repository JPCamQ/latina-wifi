const express = require('express');
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerComprobantes
} = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/profile', authenticateToken, getCustomerProfile);
router.put('/profile', authenticateToken, updateCustomerProfile);
router.get('/comprobantes', authenticateToken, getCustomerComprobantes);

module.exports = router;
