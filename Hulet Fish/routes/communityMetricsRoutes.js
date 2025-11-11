const express = require('express');
const communityMetricsController = require('./../controllers/communityMetricsController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Protect all routes - only admin can access community metrics
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(communityMetricsController.getCommunityImpactMetrics);

router
  .route('/income-by-region')
  .get(communityMetricsController.getIncomeGrowthByRegion);

router
  .route('/gender-participation')
  .get(communityMetricsController.getGenderParticipation);

module.exports = router;
