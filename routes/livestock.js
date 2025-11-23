const express = require('express');
const router = express.Router();

const {
  createLivestock,
  getAllLivestock,
  getLivestockById,
  updateLivestock,
  deleteLivestock,
  getmyLivestock
} = require('../controllers/livestockController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/',
  [authMiddleware, checkRole(['seller'])],
  createLivestock
);

router.get(
  '/me',
  [authMiddleware, checkRole(['seller'])],
  getMyLivestock
);

router.get('/', getAllLivestock);

router.get('/:id', getLivestockById);

router.put(
  '/:id',
  [authMiddleware, checkRole(['seller'])],
  updateLivestock
);

router.delete(
  '/:id',
  [authMiddleware, checkRole(['seller'])],
  deleteLivestock
);

module.exports = router;
