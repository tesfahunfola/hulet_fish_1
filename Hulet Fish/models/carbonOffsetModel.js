const mongoose = require('mongoose');

const carbonOffsetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Offset project name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Project type is required'],
      enum: {
        values: [
          'tree_planting',
          'renewable_energy',
          'water_conservation',
          'forest_conservation',
          'community_development'
        ],
        message: 'Project type must be one of: tree_planting, renewable_energy, water_conservation, forest_conservation, community_development'
      }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    // Cost per kg CO2 offset in ETB
    costPerKg: {
      type: Number,
      required: [true, 'Cost per kg is required'],
      min: [0, 'Cost cannot be negative']
    },
    // Impact metrics
    co2OffsetPerUnit: {
      type: Number,
      default: 1, // kg CO2 offset per unit purchased
      min: [0, 'CO2 offset cannot be negative']
    },
    // Project details
    partner: {
      type: String,
      trim: true
    },
    certification: {
      type: String,
      trim: true
    },
    // Images
    images: [String],
    // Status
    active: {
      type: Boolean,
      default: true
    },
    // Impact tracking
    totalOffsetSold: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenue: {
      type: Number,
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
carbonOffsetSchema.index({ type: 1, active: 1 });
carbonOffsetSchema.index({ costPerKg: 1 });

// Virtual for formatted cost
carbonOffsetSchema.virtual('formattedCost').get(function() {
  return `${this.costPerKg} ETB per kg CO₂`;
});

const CarbonOffset = mongoose.model('CarbonOffset', carbonOffsetSchema);

module.exports = CarbonOffset;
