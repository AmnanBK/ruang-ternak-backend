const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/',
  [authMiddleware, checkRole(['customer'])],
  transactionController.createTransaction
);

module.exports = router;
