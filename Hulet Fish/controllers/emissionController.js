const EmissionFactor = require('../models/emissionFactorModel');
const EcoScore = require('../models/ecoScoreModel');
const CarbonOffset = require('../models/carbonOffsetModel');
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const {
  calculateTransportEmissions,
  calculateActivityEmissions,
  calculateEcoScore,
  generateRecommendations
} = require('../utils/emissionCalculator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all emission factors
exports.getEmissionFactors = catchAsync(async (req, res, next) => {
  const emissionFactors = await EmissionFactor.find({ active: true });

  res.status(200).json({
    status: 'success',
    results: emissionFactors.length,
    data: {
      emissionFactors
    }
  });
});

// Calculate emissions for a trip
exports.calculateEmissions = catchAsync(async (req, res, next) => {
  const { transportType, distance, travelers = 1, tourId } = req.body;

  // Validate required fields
  if (!transportType || !distance) {
    return next(new AppError('Transport type and distance are required', 400));
  }

  // Calculate transport emissions
  const transportEmissions = await calculateTransportEmissions(transportType, distance, travelers);

  // Calculate activity emissions if tourId provided
  let activityEmissions = 0;
  if (tourId) {
    activityEmissions = await calculateActivityEmissions(tourId, travelers);
  }

  // Get tour data for waste impact and local benefits
  let wasteImpact = 0;
  let localBenefitBonus = 0;

  if (tourId) {
    const tour = await Tour.findById(tourId).select('emissionData');
    if (tour && tour.emissionData) {
      wasteImpact = tour.emissionData.wasteImpact;
      localBenefitBonus = tour.emissionData.localBenefitBonus;
    }
  }

  // Calculate eco score
  const ecoScore = calculateEcoScore(transportEmissions, activityEmissions, wasteImpact, localBenefitBonus);

  // Generate recommendations
  const recommendations = await generateRecommendations(transportType, distance, travelers);

  res.status(200).json({
    status: 'success',
    data: {
      transportEmissions,
      activityEmissions,
      totalEmissions: transportEmissions + activityEmissions,
      wasteImpact,
      localBenefitBonus,
      ecoScore,
      recommendations
    }
  });
});

// Get user's eco scores
exports.getUserEcoScores = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;

  const ecoScores = await EcoScore.find({ user: userId })
    .populate({
      path: 'trip',
      populate: {
        path: 'tour',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: ecoScores.length,
    data: {
      ecoScores
    }
  });
});

// Create eco score for a booking
exports.createEcoScore = catchAsync(async (req, res, next) => {
  const {
    bookingId,
    transportType,
    distance,
    travelers = 1,
    origin,
    destination
  } = req.body;

  // Get booking details
  const booking = await Booking.findById(bookingId).populate('tour');
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Calculate emissions
  const transportEmissions = await calculateTransportEmissions(transportType, distance, travelers);
  const activityEmissions = await calculateActivityEmissions(booking.tour._id, travelers);

  // Get tour emission data
  const tour = booking.tour;
  const wasteImpact = tour.emissionData?.wasteImpact || 0;
  const localBenefitBonus = tour.emissionData?.localBenefitBonus || 0;

  // Calculate eco score
  const ecoScore = calculateEcoScore(transportEmissions, activityEmissions, wasteImpact, localBenefitBonus);

  // Generate recommendations
  const recommendations = await generateRecommendations(transportType, distance, travelers);

  // Create eco score record
  const ecoScoreDoc = await EcoScore.create({
    user: booking.user,
    trip: bookingId,
    transportEmissions,
    activityEmissions,
    wasteImpact,
    localBenefitBonus,
    ecoScore,
    category: '', // Will be set by pre-save middleware
    origin,
    destination,
    transportType,
    distance,
    travelers,
    recommendations
  });

  res.status(201).json({
    status: 'success',
    data: {
      ecoScore: ecoScoreDoc
    }
  });
});

// Get carbon offset projects
exports.getCarbonOffsets = catchAsync(async (req, res, next) => {
  const carbonOffsets = await CarbonOffset.find({ active: true });

  res.status(200).json({
    status: 'success',
    results: carbonOffsets.length,
    data: {
      carbonOffsets
    }
  });
});

// Purchase carbon offset
exports.purchaseCarbonOffset = catchAsync(async (req, res, next) => {
  const { bookingId, projectId, amount } = req.body;

  // Validate inputs
  if (!bookingId || !projectId || !amount) {
    return next(new AppError('Booking ID, project ID, and amount are required', 400));
  }

  // Get project details
  const project = await CarbonOffset.findById(projectId);
  if (!project) {
    return next(new AppError('Carbon offset project not found', 404));
  }

  // Calculate cost
  const cost = amount * project.costPerKg;

  // Update booking with offset purchase
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      'ecoData.carbonOffset': {
        purchased: true,
        amount,
        cost,
        project: projectId
      }
    },
    { new: true }
  );

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Update corresponding eco score with offset information
  await EcoScore.findOneAndUpdate(
    { trip: bookingId },
    {
      offsetPurchased: true,
      offsetAmount: amount,
      offsetCost: cost
    },
    { new: true }
  );

  // Update project totals
  await CarbonOffset.findByIdAndUpdate(projectId, {
    $inc: {
      totalOffsetSold: amount,
      totalRevenue: cost
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking,
      offsetDetails: {
        project: project.name,
        amount,
        cost,
        co2Offset: amount
      }
    }
  });
});
