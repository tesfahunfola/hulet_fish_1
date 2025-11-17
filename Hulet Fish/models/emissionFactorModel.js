const mongoose = require('mongoose');

const emissionFactorSchema = new mongoose.Schema(
  {
    transportType: {
      type: String,
      required: [true, 'Transport type is required'],
      enum: {
        values: [
          'airplane',
          'gasoline_car',
          'diesel_minibus',
          'bajaj',
          'city_bus_electric',
          'walking',
          'bicycle'
        ],
        message: 'Transport type must be one of: airplane, gasoline_car, diesel_minibus, bajaj, city_bus_electric, walking, bicycle'
      }
    },
    name: {
      type: String,
      required: [true, 'Transport name is required'],
      trim: true
    },
    emissionFactor: {
      type: Number,
      required: [true, 'Emission factor is required'],
      min: [0, 'Emission factor cannot be negative']
    },
    unit: {
      type: String,
      default: 'kg CO2 per km',
      enum: ['kg CO2 per km', 'kg CO2 per passenger per km']
    },
    description: {
      type: String,
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
emissionFactorSchema.index({ transportType: 1, active: 1 });

const EmissionFactor = mongoose.model('EmissionFactor', emissionFactorSchema);

module.exports = EmissionFactor;
