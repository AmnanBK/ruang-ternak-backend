const express = require('express');
const router = express.Router();

const livestockController = require('../controllers/livestockController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/',
  [authMiddleware, checkRole(['seller'])],
  livestockController.createLivestock
);

module.exports = router;
