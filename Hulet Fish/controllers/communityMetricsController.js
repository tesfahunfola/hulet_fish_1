const Booking = require('./../models/bookingModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getCommunityImpactMetrics = catchAsync(async (req, res, next) => {
  // Get income growth by region (based on booking revenue)
  const incomeByRegion = await Booking.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $group: {
        _id: '$user.region',
        totalIncome: { $sum: '$price' },
        bookingCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalIncome: -1 }
    }
  ]);

  // Get gender participation distribution
  const genderParticipation = await User.aggregate([
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get key community statistics
  const totalCommunityMembers = await User.countDocuments({ active: { $ne: false } });
  const totalBookings = await Booking.countDocuments();
  const totalRevenue = await Booking.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$price' }
      }
    }
  ]);

  // Get active regions count
  const activeRegions = await User.distinct('region', { active: { $ne: false } });

  // Get monthly income growth (last 12 months)
  const monthlyIncome = await Booking.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        monthlyIncome: { $sum: '$price' },
        bookingCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Calculate growth rate (comparing last month to previous month)
  let growthRate = 0;
  if (monthlyIncome.length >= 2) {
    const lastMonth = monthlyIncome[monthlyIncome.length - 1].monthlyIncome;
    const previousMonth = monthlyIncome[monthlyIncome.length - 2].monthlyIncome;
    if (previousMonth > 0) {
      growthRate = ((lastMonth - previousMonth) / previousMonth) * 100;
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      incomeByRegion,
      genderParticipation,
      summaryStats: {
        totalCommunityMembers,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeRegions: activeRegions.length,
        monthlyGrowthRate: growthRate
      },
      monthlyIncome
    }
  });
});

exports.getIncomeGrowthByRegion = catchAsync(async (req, res, next) => {
  const incomeByRegion = await Booking.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $group: {
        _id: '$user.region',
        totalIncome: { $sum: '$price' },
        bookingCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalIncome: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: incomeByRegion
  });
});

exports.getGenderParticipation = catchAsync(async (req, res, next) => {
  const genderParticipation = await User.aggregate([
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: genderParticipation
  });
});
