const express = require('express');
const emissionController = require('../controllers/emissionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Emission factors
router.get('/factors', emissionController.getEmissionFactors);

// Calculate emissions
router.post('/calculate', emissionController.calculateEmissions);

// Eco scores
router.get('/eco-scores/:userId?', emissionController.getUserEcoScores);
router.post('/eco-scores', emissionController.createEcoScore);

// Carbon offsets
router.get('/carbon-offsets', emissionController.getCarbonOffsets);
router.post('/carbon-offsets/purchase', emissionController.purchaseCarbonOffset);

module.exports = router;
