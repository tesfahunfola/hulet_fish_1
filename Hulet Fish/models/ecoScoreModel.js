const mongoose = require('mongoose');

const ecoScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Eco score must belong to a user']
    },
    trip: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: [true, 'Eco score must belong to a trip']
    },
    // Emission calculations
    transportEmissions: {
      type: Number,
      default: 0, // kg CO2 from transportation
      min: 0
    },
    activityEmissions: {
      type: Number,
      default: 0, // kg CO2 from activities
      min: 0
    },
    wasteImpact: {
      type: Number,
      default: 0, // waste impact score
      min: 0,
      max: 10
    },
    // Bonuses
    localBenefitBonus: {
      type: Number,
      default: 0, // points for local benefits
      min: 0,
      max: 20
    },
    // Final score
    ecoScore: {
      type: Number,
      min: 0,
      max: 100,
      required: [true, 'Eco score is required']
    },
    // Score category
    category: {
      type: String,
      enum: ['excellent', 'good', 'moderate', 'poor'],
      required: true
    },
    // Trip details
    origin: {
      type: String,
      trim: true
    },
    destination: {
      type: String,
      trim: true
    },
    transportType: {
      type: String,
      enum: [
        'airplane',
        'gasoline_car',
        'diesel_minibus',
        'bajaj',
        'city_bus_electric',
        'walking',
        'bicycle'
      ]
    },
    distance: {
      type: Number, // km
      min: 0
    },
    travelers: {
      type: Number,
      default: 1,
      min: 1
    },
    // Recommendations
    recommendations: [{
      type: {
        type: String,
        enum: ['transport', 'activity', 'offset']
      },
      title: String,
      description: String,
      savings: Number, // kg CO2 saved
      cost: Number // additional cost in ETB
    }],
    // Carbon offset
    offsetPurchased: {
      type: Boolean,
      default: false
    },
    offsetAmount: {
      type: Number, // kg CO2 offset
      default: 0,
      min: 0
    },
    offsetCost: {
      type: Number, // cost in ETB
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
ecoScoreSchema.index({ user: 1, createdAt: -1 });
ecoScoreSchema.index({ trip: 1 });
ecoScoreSchema.index({ ecoScore: -1 });

// Virtual for total emissions
ecoScoreSchema.virtual('totalEmissions').get(function() {
  return this.transportEmissions + this.activityEmissions;
});

// Pre-save middleware to calculate category
ecoScoreSchema.pre('save', function(next) {
  if (this.ecoScore >= 80) {
    this.category = 'excellent';
  } else if (this.ecoScore >= 60) {
    this.category = 'good';
  } else if (this.ecoScore >= 40) {
    this.category = 'moderate';
  } else {
    this.category = 'poor';
  }
  next();
});

const EcoScore = mongoose.model('EcoScore', ecoScoreSchema);

module.exports = EcoScore;
