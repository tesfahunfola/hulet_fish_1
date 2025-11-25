const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price.']
  },
  txRef: {
    type: String,
    trim: true
    // Note: there may be an existing unique index on txRef in the DB.
    // We avoid declaring `unique: true` here to prevent index recreation errors.
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  },
  // Eco Score and Carbon Offset fields
  ecoData: {
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
    // Carbon offset purchase
    carbonOffset: {
      purchased: {
        type: Boolean,
        default: false
      },
      amount: {
        type: Number, // kg CO2 offset
        default: 0,
        min: 0
      },
      cost: {
        type: Number, // cost in ETB
        default: 0,
        min: 0
      },
      project: {
        type: mongoose.Schema.ObjectId,
        ref: 'CarbonOffset'
      }
    }
  }
});

bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name emissionData'
  });
  next();
});

// Pre-save middleware to set isNew flag
bookingSchema.pre('save', function(next) {
  this._isNew = this.isNew;
  next();
});

// Post-save middleware to create eco score for new paid bookings
bookingSchema.post('save', async function(doc) {
  if (!doc._isNew || !doc.paid) return; // Only for new paid bookings

  try {
    const EcoScore = require('./ecoScoreModel');
    const existingScore = await EcoScore.findOne({ trip: doc._id });
    if (existingScore) return; // Already exists

    // Populate tour data for emission calculations
    await doc.populate('tour', 'emissionData');

    // Calculate emissions
    const transportEmissions = 5; // Default transport emissions
    const activityEmissions = doc.tour?.emissionData?.activityCO2 || 2.5;
    const wasteImpact = doc.tour?.emissionData?.wasteImpact || 2;
    const localBenefitBonus = doc.tour?.emissionData?.localBenefitBonus || 15;
    const ecoScore = Math.min(100, 100 - transportEmissions - activityEmissions - wasteImpact + localBenefitBonus);

    await EcoScore.create({
      user: doc.user,
      trip: doc._id,
      transportEmissions,
      activityEmissions,
      wasteImpact,
      localBenefitBonus,
      ecoScore,
      category: ecoScore >= 80 ? 'excellent' : ecoScore >= 60 ? 'good' : ecoScore >= 40 ? 'moderate' : 'poor',
      origin: 'Addis Ababa',
      destination: 'Tour Location',
      transportType: 'diesel_minibus',
      distance: 10,
      travelers: 1,
      recommendations: []
    });
  } catch (error) {
    console.error('Error creating eco score for booking:', error);
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

