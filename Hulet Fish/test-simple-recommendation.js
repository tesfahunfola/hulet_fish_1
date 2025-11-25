// Test the recommendation API without Gemini
require('dotenv').config({ path: './config.env' });

// Create a mock version that doesn't use Gemini
const testData = {
  userProfile: {
    interests: ['culture', 'history'],
    travelStyle: 'adventurous',
    budget: 'medium'
  },
  userReviews: ['Amazing sites'],
  experiencesDatabase: [
    { title: 'Test 1', description: 'Description 1' },
    { title: 'Test 2', description: 'Description 2' },
    { title: 'Test 3', description: 'Description 3' }
  ]
};

console.log('Testing recommendation without Gemini API...\n');

// Simple recommendation logic without API calls
function simpleRecommendation(userProfile, userReviews, experiencesDatabase) {
  const interests = userProfile.interests.join(', ');
  
  return experiencesDatabase.slice(0, 5).map((exp, idx) => ({
    title: exp.title,
    match_score: 0.8 - idx * 0.1,
    why: `Recommended based on your interests in ${interests}.`
  }));
}

try {
  const results = simpleRecommendation(
    testData.userProfile,
    testData.userReviews,
    testData.experiencesDatabase
  );
  
  console.log('✅ SUCCESS! Recommendations:');
  results.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec.title} - ${(rec.match_score * 100).toFixed(0)}%`);
    console.log(`   ${rec.why}\n`);
  });
  
  console.log('✅ Simple recommendation logic works!');
  console.log('\nNow testing if the issue is with Gemini API...\n');
  
  // Test if Gemini API key is set
  const key = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY:', key ? `Set (${key.length} chars)` : 'NOT SET');
  
  if (!key || key === 'your_gemini_api_key_here') {
    console.log('\n⚠️  WARNING: GEMINI_API_KEY is not properly configured!');
    console.log('This is likely why recommendations are failing.');
    console.log('\nTo fix:');
    console.log('1. Get API key from: https://aistudio.google.com/apikey');
    console.log('2. Add to config.env: GEMINI_API_KEY=your_actual_key');
    console.log('3. Restart your server');
  } else {
    console.log('✅ API key is configured');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
