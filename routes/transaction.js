const express = require('express');
const router = express.Router();

const {
  createTransaction,
  simulatePayment
} = require('../controllers/transactionController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/',
  [authMiddleware, checkRole(['customer'])],
  createTransaction
);

router.post(
  '/:id/pay',
  [authMiddleware, checkRole(['customer'])], // Lindungi!
  simulatePayment
);

module.exports = router;
