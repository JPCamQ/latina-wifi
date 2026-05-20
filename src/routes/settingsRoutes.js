const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/bcv', settingsController.getBcvRate);
router.put('/bcv', authenticateToken, settingsController.updateBcvRate);

module.exports = router;
