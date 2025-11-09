const express = require('express');
const router = express.Router();

const {
  createReview,
  getReviewsForLivestock
} = require('../controllers/reviewController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post(
  '/:livestock_id',
  [authMiddleware, checkRole(['customer'])],
  createReview
);

router.get(
  '/:livestock_id',
  getReviewsForLivestock
);

module.exports = router;
