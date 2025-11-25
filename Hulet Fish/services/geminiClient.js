const axios = require('axios');

const { GEMINI_API_KEY } = process.env;

if (!GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY environment variable is not set. Please set it before running the app.'
  );
}

/**
 * Calls Google Gemini API to get text embeddings using text-embedding-004 model.
 * @param {string} input - The text input to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
async function getEmbedding(input) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text: input }]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (
      response.data &&
      response.data.embedding &&
      Array.isArray(response.data.embedding.values)
    ) {
      return response.data.embedding.values;
    }
    throw new Error('Invalid embedding response format from Gemini');
  } catch (error) {
    throw new Error(`Failed to get embedding from Gemini: ${error.message}`);
  }
}

/**
 * Calls Google Gemini 1.5 Pro model for text generation with JSON output.
 * @param {string} prompt - The prompt to send.
 * @returns {Promise<string>} - The text completion response.
 */
async function generateCompletion(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]
    ) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }
    throw new Error('Invalid completion response format from Gemini');
  } catch (error) {
    throw new Error(
      `Failed to generate completion from Gemini: ${error.message}`
    );
  }
}

module.exports = {
  getEmbedding,
  generateCompletion
};
