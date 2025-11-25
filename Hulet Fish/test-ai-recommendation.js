/**
 * Test script for AI Cultural Recommendation API
 * 
 * Usage:
 * 1. Make sure your backend server is running (npm start or node server.js)
 * 2. Make sure you have GEMINI_API_KEY in your config.env
 * 3. Run: node test-ai-recommendation.js YOUR_JWT_TOKEN
 */

const axios = require('axios');

// Get JWT token from command line argument
const token = process.argv[2];

if (!token) {
  console.error('❌ Error: JWT token is required');
  console.log('\nUsage: node test-ai-recommendation.js YOUR_JWT_TOKEN');
  console.log('\nTo get your JWT token:');
  console.log('1. Login to your app in the browser');
  console.log('2. Open browser DevTools > Application > Local Storage');
  console.log('3. Copy the "token" value');
  process.exit(1);
}

// Test data
const testData = {
  userProfile: {
    interests: ['culture', 'history', 'art', 'religious sites'],
    travelStyle: 'adventurous',
    budget: 'medium',
    preferences: 'authentic local experiences with historical significance'
  },
  userReviews: [
    'Amazing historical site with rich cultural significance',
    'Loved the traditional coffee ceremony experience',
    'Beautiful churches and ancient architecture were breathtaking',
    'The local guide was very knowledgeable about Ethiopian history'
  ],
  experiencesDatabase: [
    {
      title: 'Visit Lalibela Rock-Hewn Churches',
      description: 'Explore 11 medieval monolithic churches carved from rock in the 12th century. UNESCO World Heritage Site with incredible engineering and spiritual significance.'
    },
    {
      title: 'Traditional Ethiopian Coffee Ceremony',
      description: 'Participate in an authentic Ethiopian coffee ceremony with locals, learning about the birthplace of coffee and traditional preparation methods.'
    },
    {
      title: 'Simien Mountains Trekking',
      description: 'Trek through dramatic landscapes with unique wildlife including gelada baboons and Ethiopian wolves. UNESCO World Heritage natural site.'
    },
    {
      title: 'Axum Archaeological Sites',
      description: 'Discover ancient obelisks, royal tombs, and the legendary home of the Ark of the Covenant. Explore one of Africa\'s oldest civilizations.'
    },
    {
      title: 'Lake Tana Monasteries Tour',
      description: 'Visit ancient island monasteries on Lake Tana, featuring beautiful religious art, illuminated manuscripts, and peaceful settings.'
    },
    {
      title: 'Gondar Royal Enclosure',
      description: 'Tour the medieval castles and palaces of Ethiopian emperors, showcasing a unique blend of Portuguese, Indian, and local architectural styles.'
    },
    {
      title: 'Addis Ababa City Tour',
      description: 'Explore Ethiopia\'s capital including the National Museum (home of Lucy), Holy Trinity Cathedral, and bustling Mercato market.'
    },
    {
      title: 'Harar Old Town Walking Tour',
      description: 'Wander through the ancient walled city with 82 mosques and distinctive jugol wall. Experience the famous hyena feeding ceremony.'
    }
  ]
};

// API endpoint
const API_URL = process.env.API_URL || 'http://localhost:3000';
const endpoint = `${API_URL}/api/v1/recommend`;

console.log('🧪 Testing AI Cultural Recommendation API');
console.log('=' .repeat(60));
console.log(`📍 Endpoint: ${endpoint}`);
console.log(`👤 User Profile: ${JSON.stringify(testData.userProfile, null, 2)}`);
console.log(`📝 User Reviews: ${testData.userReviews.length} reviews`);
console.log(`🎯 Experiences Database: ${testData.experiencesDatabase.length} experiences`);
console.log('=' .repeat(60));
console.log('\n⏳ Sending request...\n');

// Make the request
axios
  .post(endpoint, testData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    timeout: 30000 // 30 second timeout
  })
  .then(response => {
    console.log('✅ SUCCESS! API is working!\n');
    console.log('📊 Response Status:', response.status);
    console.log('=' .repeat(60));
    
    const recommendations = response.data.data || response.data;
    
    if (Array.isArray(recommendations)) {
      console.log(`\n🎉 Received ${recommendations.length} recommendations:\n`);
      
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.title}`);
        console.log(`   Match Score: ${(rec.match_score * 100).toFixed(1)}%`);
        console.log(`   Why: ${rec.why}`);
        console.log('');
      });
    } else {
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
    console.log('=' .repeat(60));
    console.log('✅ AI Recommendation API is working correctly!');
  })
  .catch(error => {
    console.error('❌ ERROR: API request failed\n');
    
    if (error.response) {
      // Server responded with error
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n💡 Tip: Your JWT token may be invalid or expired.');
        console.error('   Try logging in again and getting a fresh token.');
      } else if (error.response.status === 400) {
        console.error('\n💡 Tip: Check that the request body format is correct.');
      } else if (error.response.status === 500) {
        console.error('\n💡 Tip: Check server logs and ensure GEMINI_API_KEY is set.');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from server');
      console.error('Make sure your backend server is running on', API_URL);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  });
