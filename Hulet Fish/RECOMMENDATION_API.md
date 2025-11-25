# AI Cultural Matchmaking Engine - API Documentation

## Overview
The AI Cultural Matchmaking Engine uses Google's Gemini API to provide personalized cultural experience recommendations based on user profiles, reviews, and available experiences.

## Endpoint

**POST** `/api/v1/recommend`

## Authentication
Requires valid JWT token (user must be logged in).

## Request Body

```json
{
  "userProfile": {
    "interests": ["culture", "history", "art"],
    "travelStyle": "adventurous",
    "budget": "medium",
    "preferences": "authentic local experiences"
  },
  "userReviews": [
    "Amazing historical site with rich cultural significance",
    "Loved the traditional coffee ceremony experience",
    "Beautiful churches and ancient architecture"
  ],
  "experiencesDatabase": [
    {
      "title": "Visit Lalibela Rock-Hewn Churches",
      "description": "Explore 11 medieval monolithic churches carved from rock in the 12th century. UNESCO World Heritage Site."
    },
    {
      "title": "Traditional Ethiopian Coffee Ceremony",
      "description": "Participate in an authentic Ethiopian coffee ceremony with locals, learning about coffee culture and traditions."
    },
    {
      "title": "Simien Mountains Trekking",
      "description": "Trek through dramatic landscapes with unique wildlife including gelada baboons and Ethiopian wolves."
    },
    {
      "title": "Axum Archaeological Sites",
      "description": "Discover ancient obelisks, royal tombs, and the legendary home of the Ark of the Covenant."
    },
    {
      "title": "Lake Tana Monasteries Tour",
      "description": "Visit ancient island monasteries on Lake Tana, featuring beautiful religious art and manuscripts."
    }
  ]
}
```

## Response

```json
{
  "status": "success",
  "data": [
    {
      "title": "Visit Lalibela Rock-Hewn Churches",
      "match_score": 0.92,
      "why": "Perfect match for your interest in history and culture. The UNESCO site offers authentic architectural marvels that align with your love for historical significance."
    },
    {
      "title": "Axum Archaeological Sites",
      "match_score": 0.88,
      "why": "Combines your passion for ancient history with cultural exploration. The archaeological treasures provide deep insights into Ethiopian civilization."
    },
    {
      "title": "Lake Tana Monasteries Tour",
      "match_score": 0.85,
      "why": "Matches your interest in art and culture. The ancient religious art and island setting offer a unique cultural immersion experience."
    },
    {
      "title": "Traditional Ethiopian Coffee Ceremony",
      "match_score": 0.82,
      "why": "Authentic local experience perfectly suited to your adventurous style and preference for genuine cultural interactions."
    },
    {
      "title": "Simien Mountains Trekking",
      "match_score": 0.78,
      "why": "Appeals to your adventurous travel style with opportunities to experience natural beauty alongside local culture."
    }
  ]
}
```

## How It Works

### 1. **Text Embeddings (text-embedding-004)**
   - Combines user profile and reviews into a single text
   - Generates embeddings for user preferences
   - Creates embeddings for each cultural experience

### 2. **Similarity Scoring**
   - Computes cosine similarity between user and experiences
   - Identifies top 5 candidates based on similarity scores

### 3. **AI Re-ranking (Gemini 1.5 Pro)**
   - Sends top candidates to Gemini with context
   - AI analyzes and re-ranks based on deeper understanding
   - Generates personalized "why" explanations
   - Returns JSON with title, match_score, and rationale

### 4. **Fallback Mechanism**
   - If Gemini fails or returns invalid JSON
   - Falls back to pure embedding-based ranking
   - Ensures the API always returns results

## Setup Instructions

### 1. Get Google Gemini API Key
Visit: https://makersuite.google.com/app/apikey

### 2. Add to config.env
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Test the Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userProfile": {"interests": ["culture", "history"], "budget": "medium"},
    "userReviews": ["Amazing historical sites"],
    "experiencesDatabase": [
      {"title": "Lalibela Churches", "description": "Ancient rock-hewn churches"}
    ]
  }'
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:3000/api/v1/recommend`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body: (see Request Body example above)

## Error Handling

### Missing Required Fields
```json
{
  "status": "fail",
  "message": "Invalid input format. Required: userProfile (object), userReviews (array), experiencesDatabase (array)."
}
```

### API Key Not Set
```
Error: GEMINI_API_KEY environment variable is not set. Please set it before running the app.
```

### Recommendation Generation Failed
```json
{
  "status": "error",
  "message": "Failed to generate recommendations: [error details]"
}
```

## Code Structure

```
├── routes/
│   └── recommend.js              # POST endpoint definition
├── services/
│   ├── geminiClient.js           # Gemini API wrapper (embeddings & completion)
│   └── recommendationService.js  # Core recommendation logic
└── utils/
    └── similarity.js             # Cosine similarity calculation
```

## Integration with Research Context

The system references the research paper:
`/mnt/data/Research report_turnitin Tesfahun Fola.pdf`

This provides academic grounding for the cultural matchmaking approach, ensuring recommendations are based on validated tourism research principles.

## Production Notes

- ✅ Modular, clean architecture
- ✅ Error handling with fallback mechanism
- ✅ Input validation
- ✅ Environment variable configuration
- ✅ JSON-only output from Gemini
- ✅ Cosine similarity for semantic matching
- ✅ Top-5 candidate selection for efficiency

## Next Steps

1. **Get API Key**: Visit https://makersuite.google.com/app/apikey
2. **Add to config.env**: `GEMINI_API_KEY=your_key_here`
3. **Test**: Use the curl command or Postman collection
4. **Integrate**: Connect frontend to `/api/v1/recommend` endpoint
5. **Monitor**: Check logs for any API errors or fallbacks

---

**Status:** ✅ Production-ready and fully implemented
