const express = require('express');
const router = express.Router();

const {
  uploadDocument,
  getPendingVerifications,
  reviewVerification
} = require('../controllers/verificationController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/upload',
  [authMiddleware, checkRole(['seller'])],
  uploadDocument
);

router.get(
  '/pending',
  [authMiddleware, checkRole(['admin'])],
  getPendingVerifications
);

router.put(
  '/review/:doc_id',
  [authMiddleware, checkRole(['admin'])],
  reviewVerification
);

module.exports = router;
