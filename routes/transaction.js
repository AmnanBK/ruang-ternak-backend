const express = require('express');
const router = express.Router();

const {
  createTransaction,
  simulatePayment
} = require('../controllers/transactionController');

const {
  createOrUpdateShipment,
  getShipment
} = require('../controllers/shipmentController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/',
  [authMiddleware, checkRole(['customer'])],
  createTransaction
);

router.post(
  '/:id/pay',
  [authMiddleware, checkRole(['customer'])],
  simulatePayment
);

router.put(
  '/:id/shipment',
  [authMiddleware, checkRole(['seller'])],
  createOrUpdateShipment
);

router.get(
  '/:id/shipment',
  [authMiddleware, checkRole(['customer'])],
  getShipment
);

module.exports = router;
