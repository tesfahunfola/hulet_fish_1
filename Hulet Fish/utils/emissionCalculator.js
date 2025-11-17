const EmissionFactor = require('../models/emissionFactorModel');
const Tour = require('../models/tourModel');

/**
 * Calculate transport emissions based on distance, transport type, and number of travelers
 * @param {string} transportType - Type of transport (airplane, gasoline_car, etc.)
 * @param {number} distance - Distance in km
 * @param {number} travelers - Number of travelers
 * @returns {Promise<number>} - Total CO2 emissions in kg
 */
const calculateTransportEmissions = async (transportType, distance, travelers = 1) => {
  try {
    const emissionFactor = await EmissionFactor.findOne({
      transportType,
      active: true
    });

    if (!emissionFactor) {
      throw new Error(`Emission factor not found for transport type: ${transportType}`);
    }

    // Calculate emissions: distance * emissionFactor * travelers
    const emissions = distance * emissionFactor.emissionFactor * travelers;
    return Math.round(emissions * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating transport emissions:', error);
    throw error;
  }
};

/**
 * Calculate activity emissions for a tour
 * @param {string} tourId - Tour ID
 * @param {number} travelers - Number of travelers
 * @returns {Promise<number>} - Total CO2 emissions from activities in kg
 */
const calculateActivityEmissions = async (tourId, travelers = 1) => {
  try {
    const tour = await Tour.findById(tourId).select('emissionData');

    if (!tour || !tour.emissionData) {
      return 0; // Default to 0 if no emission data
    }

    const emissions = tour.emissionData.activityCO2 * travelers;
    return Math.round(emissions * 100) / 100;
  } catch (error) {
    console.error('Error calculating activity emissions:', error);
    throw error;
  }
};

/**
 * Calculate eco score based on emissions and bonuses
 * @param {number} transportEmissions - CO2 from transport
 * @param {number} activityEmissions - CO2 from activities
 * @param {number} wasteImpact - Waste impact score (0-10)
 * @param {number} localBenefitBonus - Local benefit bonus (0-20)
 * @returns {number} - Eco score (0-100)
 */
const calculateEcoScore = (transportEmissions, activityEmissions, wasteImpact, localBenefitBonus) => {
  // Base score calculation: 100 - (transport + activity + waste - bonus)
  const totalEmissions = transportEmissions + activityEmissions;
  const adjustedImpact = wasteImpact - localBenefitBonus;

  let ecoScore = 100 - totalEmissions - adjustedImpact;

  // Ensure score is within bounds
  ecoScore = Math.max(0, Math.min(100, ecoScore));

  return Math.round(ecoScore);
};

/**
 * Generate eco-friendly recommendations
 * @param {string} currentTransport - Current transport type
 * @param {number} distance - Distance in km
 * @param {number} travelers - Number of travelers
 * @returns {Promise<Array>} - Array of recommendation objects
 */
const generateRecommendations = async (currentTransport, distance, travelers) => {
  const recommendations = [];

  try {
    // Transport alternatives
    const transportAlternatives = {
      airplane: ['diesel_minibus', 'city_bus_electric'],
      gasoline_car: ['diesel_minibus', 'bajaj', 'city_bus_electric', 'bicycle'],
      diesel_minibus: ['city_bus_electric', 'bajaj'],
      bajaj: ['city_bus_electric', 'walking', 'bicycle']
    };

    if (transportAlternatives[currentTransport]) {
      for (const altTransport of transportAlternatives[currentTransport]) {
        const currentEmissions = await calculateTransportEmissions(currentTransport, distance, travelers);
        const altEmissions = await calculateTransportEmissions(altTransport, distance, travelers);
        const savings = currentEmissions - altEmissions;

        if (savings > 0) {
          const altFactor = await EmissionFactor.findOne({ transportType: altTransport, active: true });

          recommendations.push({
            type: 'transport',
            title: `Switch to ${altFactor.name}`,
            description: `Reduce your carbon footprint by switching to more eco-friendly transport.`,
            savings: Math.round(savings * 100) / 100,
            cost: 0 // Assume no additional cost for now
          });
        }
      }
    }

    // Carbon offset recommendation
    const totalEmissions = await calculateTransportEmissions(currentTransport, distance, travelers);
    if (totalEmissions > 0) {
      recommendations.push({
        type: 'offset',
        title: 'Offset your emissions',
        description: 'Purchase carbon credits to offset your trip\'s environmental impact.',
        savings: totalEmissions,
        cost: Math.round(totalEmissions * 10) // Assume 10 ETB per kg CO2
      });
    }

  } catch (error) {
    console.error('Error generating recommendations:', error);
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
};

module.exports = {
  calculateTransportEmissions,
  calculateActivityEmissions,
  calculateEcoScore,
  generateRecommendations
};
