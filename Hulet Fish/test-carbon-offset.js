const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, 'config.env') });
require('./models/userModel');
require('./models/tourModel');
require('./models/bookingModel');
require('./models/ecoScoreModel');
require('./models/carbonOffsetModel');

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected to database');

    // Test carbon offset purchase API
    const Booking = require('./models/bookingModel');
    const CarbonOffset = require('./models/carbonOffsetModel');

    // Get a paid booking and carbon offset project
    const booking = await Booking.findOne({ paid: true });
    const project = await CarbonOffset.findOne({});

    if (booking && project) {
      console.log('Testing carbon offset purchase...');
      console.log('Booking ID:', booking._id);
      console.log('Project ID:', project._id);

      // Simulate the purchase logic from the controller
      const amount = 2; // 2 kg CO2
      const cost = amount * project.costPerKg;

      console.log('Amount:', amount, 'kg CO2');
      console.log('Cost:', cost, 'ETB');

      // Update booking
      const updatedBooking = await Booking.findByIdAndUpdate(
        booking._id,
        {
          'ecoData.carbonOffset': {
            purchased: true,
            amount,
            cost,
            project: project._id
          }
        },
        { new: true }
      );

      if (updatedBooking) {
        console.log('Carbon offset purchase successful!');
        console.log('Updated booking ecoData:', JSON.stringify(updatedBooking.ecoData, null, 2));

        // Update project totals using updateOne
        await CarbonOffset.updateOne(
          { _id: project._id },
          {
            $inc: {
              totalOffsetSold: amount,
              totalRevenue: cost
            }
          }
        );

        console.log('Project totals updated');
      } else {
        console.log('Failed to update booking');
      }
    } else {
      console.log('No suitable booking or project found for test');
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    mongoose.disconnect();
  }
})();
