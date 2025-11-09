const express = require('express');
const router = express.Router();

const verificationController = require('../controllers/verificationController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/upload',
  [authMiddleware, checkRole(['seller'])],
  verificationController.uploadDocument
);

module.exports = router;
