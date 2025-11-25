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
    try {
      const recommendations =
        await recommendationService.generateRecommendations(
          userProfile,
          userReviews,
          experiencesDatabase
        );

      res.status(200).json({
        status: 'success',
        data: recommendations
      });
    } catch (error) {
      console.error('Recommendation service error:', error.message);

      // Fallback: return simple recommendations if AI fails
      const interests =
        userProfile.interests && userProfile.interests.length > 0
          ? userProfile.interests.join(', ')
          : 'cultural experiences';

      const fallbackRecs = experiencesDatabase.slice(0, 5).map((exp, idx) => ({
        title: exp.title,
        match_score: 0.8 - idx * 0.1,
        why: `Recommended based on your interests in ${interests}.`
      }));

      res.status(200).json({
        status: 'success',
        data: fallbackRecs
      });
    }
  })
);

module.exports = router;
