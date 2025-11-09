const express = require('express');
const router = express.Router();

const {
  createLivestock,
  getAllLivestock,
  getLivestockById
} = require('../controllers/livestockController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/',
  [authMiddleware, checkRole(['seller'])],
  createLivestock
);

router.get('/', getAllLivestock);

router.get('/:id', getLivestockById);

module.exports = router;
