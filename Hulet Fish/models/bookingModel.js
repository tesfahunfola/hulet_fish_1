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
    select: 'name'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
