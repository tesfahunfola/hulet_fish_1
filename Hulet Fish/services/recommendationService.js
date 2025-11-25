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
  try {
    // 1. Combine userProfile + reviews into a single text for embedding
    const userProfileText = JSON.stringify(userProfile);
    const combinedText = `${userProfileText}
User Reviews:
${userReviews.join('\n')}
`;

    // 2. Get embedding for user profile + reviews
    const userEmbedding = await geminiClient.getEmbedding(combinedText);

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
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

module.exports = {
  generateRecommendations
};
