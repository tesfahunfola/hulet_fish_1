const express = require('express');
const catchAsync = require('./../utils/catchAsync');
const recommendationService = require('./../services/recommendationService');

const router = express.Router();

// POST /api/v1/recommend
router.post(
  '/',
  catchAsync(async (req, res, next) => {
    const { userProfile, userReviews, experiencesDatabase } = req.body;

    // Basic input validation
    if (
      !userProfile ||
      typeof userProfile !== 'object' ||
      !Array.isArray(userReviews) ||
      !Array.isArray(experiencesDatabase)
    ) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Invalid input format. Required: userProfile (object), userReviews (array), experiencesDatabase (array).'
      });
    }

    // Call service to generate recommendations
    const recommendations = await recommendationService.generateRecommendations(
      userProfile,
      userReviews,
      experiencesDatabase
    );

    res.status(200).json({
      status: 'success',
      data: recommendations
    });
  })
);

module.exports = router;
