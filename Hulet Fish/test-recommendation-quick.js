// Quick test of recommendation service
require('dotenv').config({ path: './config.env' });
const service = require('./services/recommendationService');

const testData = {
  userProfile: {
    interests: ['culture', 'history', 'religious sites'],
    travelStyle: 'adventurous',
    budget: 'medium'
  },
  userReviews: [
    'Amazing historical sites with rich culture',
    'Loved the traditional experiences'
  ],
  experiencesDatabase: [
    {
      title: 'Lalibela Rock-Hewn Churches',
      description: 'Ancient rock-hewn churches from 12th century, UNESCO World Heritage Site'
    },
    {
      title: 'Traditional Coffee Ceremony',
      description: 'Authentic Ethiopian coffee ceremony with local hosts'
    },
    {
      title: 'Simien Mountains Trek',
      description: 'Trekking in dramatic mountain landscapes with unique wildlife'
    }
  ]
};

console.log('🧪 Testing AI Recommendation Service\n');
console.log('User Profile:', testData.userProfile.interests.join(', '));
console.log('Experiences:', testData.experiencesDatabase.length);
console.log('\n⏳ Generating recommendations...\n');

service
  .generateRecommendations(
    testData.userProfile,
    testData.userReviews,
    testData.experiencesDatabase
  )
  .then(recommendations => {
    console.log('✅ SUCCESS! Generated', recommendations.length, 'recommendations:\n');
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.title}`);
      console.log(`   Match Score: ${(rec.match_score * 100).toFixed(1)}%`);
      console.log(`   Why: ${rec.why}\n`);
    });
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
