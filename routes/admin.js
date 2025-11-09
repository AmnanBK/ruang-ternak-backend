const express = require('express');
const router = express.Router();

const {
  getTransactionReport,
  getSecurityLogs
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get(
  '/reports/transactions',
  [authMiddleware, checkRole(['admin'])],
  getTransactionReport
);

router.get(
  '/logs/security',
  [authMiddleware, checkRole(['admin'])],
  getSecurityLogs
);

module.exports = router;
