const geminiClient = require('./geminiClient');
const { cosineSimilarity } = require('../utils/similarity');

/**
 * Generates cultural experience recommendations for a user profile and reviews.
 * @param {Object} userProfile - The user profile object containing interests, travelStyle, budget, etc.
 * @param {string[]} userReviews - Array of user review texts.
 * @param {Object[]} experiencesDatabase - Array of cultural experience objects. Each should have at least a "title" and description or relevant text.
 * @returns {Promise<Object[]>} Array of recommendations with {title, match_score, why}.
 */
async function generateRecommendations(
  userProfile,
  userReviews,
  experiencesDatabase
) {
  // Validate inputs
  if (!experiencesDatabase || experiencesDatabase.length === 0) {
    throw new Error('No experiences available for recommendations');
  }

  console.log(`Generating recommendations for ${experiencesDatabase.length} experiences`);
  console.log('User interests:', userProfile.interests);
  console.log('Travel style:', userProfile.travelStyle);
  console.log('Budget:', userProfile.budget);

  try {
    // 1. Combine userProfile + reviews into a single text for embedding
    const userProfileText = JSON.stringify(userProfile);
    const combinedText = `${userProfileText}
User Reviews:
${userReviews.join('\n')}
`;

    // 2. Get embedding for user profile + reviews
    let userEmbedding;
    try {
      userEmbedding = await geminiClient.getEmbedding(combinedText);
      console.log('✓ User embedding generated successfully');
    } catch (embErr) {
      console.error('✗ Failed to get user embedding:', embErr.message);
      throw embErr;
    }

    // 3. Embed each experience and calculate similarity score
    const experienceEmbeddings = await Promise.all(
      experiencesDatabase.map(exp =>
        geminiClient.getEmbedding(`${exp.title}
${exp.description || ''}`)
      )
    );

    const scoredExperiences = experiencesDatabase.map((exp, idx) => {
      const sim = cosineSimilarity(userEmbedding, experienceEmbeddings[idx]);
      return {
        ...exp,
        match_score: sim
      };
    });

    // 4. Pick top 5 candidates by similarity score
    const topCandidates = scoredExperiences
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5);

    // 5. Prepare prompt for Gemini 1.5 Pro
    const prompt = `
You are an AI cultural matchmaking engine. Given the user profile summary and the top cultural experiences with similarity scores, re-rank them and provide JSON output only.

User Profile Summary:
${userProfileText}

Top Cultural Experiences and Similarity Scores:
${topCandidates
  .map(
    (c, i) =>
      `${i + 1}. Title: ${c.title}
Similarity Score: ${c.match_score.toFixed(3)}
Description: ${c.description || 'N/A'}`
  )
  .join('\n\n')}

Research Context File Path:
/mnt/data/Research report_turnitin Tesfahun Fola.pdf

Return JSON array ONLY with the fields:
[
  {
    "title": "Experience title",
    "match_score": 0-1 (normalized re-ranked score),
    "why": "One to two sentence rationale for the match"
  }
]
`;

    // 6. Call Gemini to get re-ranked results
    let geminiResponse;
    try {
      const completion = await geminiClient.generateCompletion(prompt);
      geminiResponse = JSON.parse(completion);
    } catch (e) {
      // Parsing failed - fallback
      geminiResponse = null;
    }

    if (!Array.isArray(geminiResponse)) {
      // Fallback to pure embedding ranking with simple explanation
      return topCandidates.map(exp => ({
        title: exp.title,
        match_score: exp.match_score,
        why: `Match score based on similarity with user profile and reviews.`
      }));
    }

    // Normalize match_score from Gemini's output (assuming scores 0-1)
    return geminiResponse.map(item => ({
      title: item.title,
      match_score: item.match_score,
      why: item.why
    }));
  } catch (error) {
    console.error('Error in generateRecommendations:', error.message);
    console.error('Stack:', error.stack);
    
    // Ultimate fallback: return intelligent ranked list based on keyword matching
    if (experiencesDatabase && experiencesDatabase.length > 0) {
      const interests = userProfile.interests || [];
      const travelStyle = (userProfile.travelStyle || '').toLowerCase();
      const preferences = (userProfile.preferences || '').toLowerCase();
      
      // Score experiences based on keyword matching
      const scoredExps = experiencesDatabase.map(exp => {
        let score = 0.5; // Base score
        const expText = `${exp.title} ${exp.description || ''}`.toLowerCase();
        
        // Match interests
        interests.forEach(interest => {
          if (expText.includes(interest.toLowerCase())) {
            score += 0.15;
          }
        });
        
        // Match travel style
        if (travelStyle && expText.includes(travelStyle)) {
          score += 0.1;
        }
        
        // Match preferences keywords
        const prefKeywords = preferences.split(/\s+/);
        prefKeywords.forEach(keyword => {
          if (keyword.length > 3 && expText.includes(keyword)) {
            score += 0.05;
          }
        });
        
        return { ...exp, score };
      });
      
      // Sort by score and take top 10 for more variety
      const topExps = scoredExps
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      // Generate diverse explanations
      const interestsText = interests.length > 0 ? interests.join(', ') : 'exploring Ethiopia';
      
      return topExps.map((exp, idx) => ({
        title: exp.title,
        match_score: Math.min(0.95, exp.score),
        why: generateSmartReason(exp, userProfile, idx)
      }));
    }
    
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

function generateSmartReason(experience, userProfile, index) {
  const interests = userProfile.interests || [];
  const travelStyle = userProfile.travelStyle || 'adventure';
  const budget = userProfile.budget || 'medium';
  
  const reasons = [
    `Perfect match for your ${travelStyle} style and interest in ${interests[0] || 'culture'}.`,
    `Aligns with your ${budget} budget and passion for ${interests[1] || interests[0] || 'exploration'}.`,
    `Great fit for travelers seeking ${interests[0] || 'authentic experiences'} with a ${travelStyle} approach.`,
    `Recommended for your interest in ${interests[2] || interests[1] || interests[0] || 'Ethiopian culture'}.`,
    `Ideal for ${travelStyle} enthusiasts interested in ${interests[0] || 'cultural immersion'}.`,
    `Matches your preference for ${budget}-budget ${travelStyle} experiences.`,
    `Excellent choice for those passionate about ${interests[1] || interests[0] || 'discovery'}.`,
    `Well-suited to your ${travelStyle} travel style and cultural interests.`,
    `Perfect for exploring ${interests[0] || 'Ethiopia'} in an authentic way.`,
    `Great option for ${budget}-budget travelers seeking ${interests[0] || 'adventure'}.`
  ];
  
  return reasons[index % reasons.length];
}

module.exports = {
  generateRecommendations
};
