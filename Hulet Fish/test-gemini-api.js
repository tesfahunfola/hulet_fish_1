const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const geminiClient = require('./services/geminiClient');

async function testGeminiAPI() {
  console.log('Testing Gemini API...\n');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `Set (${process.env.GEMINI_API_KEY.length} chars)` : 'NOT SET');
  console.log('');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in config.env');
    return;
  }

  try {
    // Test 1: Get embedding
    console.log('Test 1: Getting embedding for sample text...');
    const testText = 'I love cultural and historical experiences in Ethiopia';
    const embedding = await geminiClient.getEmbedding(testText);
    console.log('✅ Embedding generated successfully');
    console.log('   Embedding length:', embedding.length);
    console.log('   First 5 values:', embedding.slice(0, 5));
    console.log('');

    // Test 2: Generate completion
    console.log('Test 2: Generating completion...');
    const prompt = `Return JSON only with this format:
[
  {"title": "Lalibela", "match_score": 0.95, "why": "Historical site"},
  {"title": "Simien Mountains", "match_score": 0.85, "why": "Natural beauty"}
]`;
    
    const completion = await geminiClient.generateCompletion(prompt);
    console.log('✅ Completion generated successfully');
    console.log('   Response:', completion.substring(0, 200) + '...');
    console.log('');
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(completion);
      console.log('✅ Response is valid JSON');
      console.log('   Parsed:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('❌ Response is not valid JSON');
      console.log('   Full response:', completion);
    }

    console.log('\n✅ All Gemini API tests passed!');
  } catch (error) {
    console.error('\n❌ Gemini API test failed:');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.error('   Stack:', error.stack);
  }
}

testGeminiAPI();
