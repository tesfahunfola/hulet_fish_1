# Etxplore - Explore Ethiopia Sustainably

A full-stack web application for exploring Ethiopia's rich cultural heritage and natural wonders while promoting sustainable tourism through carbon offset, eco-score features, and AI-powered recommendations.

**Live Demo**: https://hulet-fish-1-q7w7.vercel.app/

## 🌟 Features

### Core Features
- **Tour Management**: Browse and book authentic Ethiopian tours
- **AI-Powered Recommendations**: Get personalized tour suggestions using Google Gemini AI
- **Carbon Offset**: Calculate and offset carbon emissions from travel
- **Eco-Score System**: Track and improve your environmental impact
- **User Authentication**: Secure signup, login, and profile management
- **Booking System**: Seamless tour booking with Chapa payment integration
- **Community Metrics**: View collective environmental impact
- **Responsive Design**: Works perfectly on all devices

### New Features
- **🤖 AI Cultural Recommendations**: 
  - Gemini AI-powered personalized experience matching
  - Semantic search using text-embedding-004
  - Natural language tour recommendations
  - Smart fallback system with 25+ curated Ethiopian experiences
  
- **🧪 Test Booking System** (Development): 
  - Create test bookings without payment processing
  - Quick testing of booking flow
  - Automatic duplicate prevention

## 🌟 Screenshots
<img width="960" height="564" alt="1Screenshot 2025-11-17 125932" src="https://github.com/user-attachments/assets/e565e75b-f5be-4b15-8abd-d7e8cd78dd76" />

<img width="960" height="564" alt="2Screenshot 2025-11-17 130018" src="https://github.com/user-attachments/assets/bc2aee49-03c8-4e07-9949-d8a0344ac5fb" />
<img width="960" height="564" alt="3Screenshot 2025-11-17 130124" src="https://github.com/user-attachments/assets/a101fe1a-8521-4c8a-81e1-71cf4249c612" />
<img width="960" height="564" alt="4Screenshot 2025-11-17 130320" src="https://github.com/user-attachments/assets/4c36408e-da67-4f4f-af3e-3aa81252a6f9" />


<img width="960" height="564" alt="5Screenshot 2025-11-17 130528" src="https://github.com/user-attachments/assets/8742d5f2-d92b-44e8-a987-e797605c1c28" />
## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Chapa** for payment processing
- **Google Gemini AI** for recommendations (text-embedding-004, gemini-1.5-pro)
- **Sendinblue/Brevo** for email services

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **TanStack Query** (React Query) for state management
- **Axios** for API requests

### AI & Machine Learning
- **Google Generative AI SDK**: Gemini API integration
- **Text Embeddings**: Semantic similarity matching
- **Cosine Similarity**: Content-based filtering
- **Natural Language Processing**: User preference analysis

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tesfahunfola/hulet_fish_1.git
   cd hulet_fish_1
   ```

2. **Install backend dependencies**
   ```bash
   cd "Hulet Fish"
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd Etxplore-frontend
   npm install
   cd ..
   ```

4. **Environment Setup**
   ```bash
   cp config.env.example config.env
   ```
   Fill in your environment variables in `config.env`:
   - Database connection strings
   - JWT secrets
   - Email service credentials
   - Payment gateway keys

5. **Import sample data** (optional)
   ```bash
   npm run import-data
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start both backend (port 3000) and frontend (port 5173) servers concurrently.

## 📁 Project Structure

```
hulet_fish_1/
├── Hulet Fish/                    # Backend (Node.js/Express)
│   ├── controllers/              # Route controllers
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic & AI services
│   │   ├── geminiClient.js       # Google Gemini API wrapper
│   │   └── recommendationService.js # AI recommendation engine
│   ├── utils/                    # Utility functions
│   │   ├── similarity.js         # Cosine similarity calculator
│   │   └── emissionCalculator.js # Carbon emission calculations
│   ├── views/                    # Email templates
│   ├── dev-data/                 # Sample data
│   ├── public/                   # Static assets
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   └── config.env.example        # Environment variables template
├── Hulet Fish/Etxplore-frontend/ # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components
│   │   │   ├── AIRecommendations.tsx # AI recommendation interface
│   │   │   ├── EcoScore.tsx      # Eco score dashboard
│   │   │   └── TourDetail.tsx    # Tour details with booking
│   │   ├── lib/                  # Utilities and API calls
│   │   └── contexts/             # React contexts
│   ├── public/                   # Static assets
│   └── package.json
├── Dockerfile                    # Docker configuration
├── render.yaml                   # Render deployment config
└── README.md
```

## 🔧 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run debug` - Start with debugger
- `npm run import-data` - Import sample data
- `npm run delete-data` - Delete all data

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌍 Environment Variables

Create a `config.env` file in the backend root with:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/etxplore
DATABASE_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (Brevo/Sendinblue)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM=noreply@etxplore.com

# Payment (Chapa)
CHAPA_SECRET_KEY=your-chapa-secret-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend URLs
FRONTEND_URL=http://localhost:8081,https://yourdomain.com
```

### Getting API Keys

1. **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Brevo (Email)**: https://www.brevo.com/
3. **Chapa (Payments)**: https://chapa.co/
4. **Google Gemini AI**: https://ai.google.dev/

## 🚀 Deployment

### Backend (Render)
1. The backend is configured for deployment on Render with `render.yaml`
2. Set environment variables in Render dashboard:
   - All variables from `config.env`
   - Ensure `GEMINI_API_KEY` is set for AI features
   - Set `NODE_ENV=production`
3. Render will automatically:
   - Build Docker image using `Dockerfile`
   - Run the Node.js server
   - Handle SSL/HTTPS

### Frontend (Vercel)
1. The frontend is configured for deployment on Vercel with `vercel.json`
2. Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`
3. Deploy: `vercel --prod`

### Docker Deployment
```bash
# Build image
docker build -t etxplore-backend .

# Run container
docker run -p 3000:3000 --env-file config.env etxplore-backend
```

**Important**: Ensure the `services/` directory is included in your Docker image (already configured in Dockerfile).

## 📊 API Documentation

The API follows RESTful conventions with the following endpoints:

### Tours & Discovery
- `GET /api/v1/tours` - Get all tours with filtering
- `GET /api/v1/tours/:id` - Get specific tour details
- `POST /api/v1/recommend` - Get AI-powered tour recommendations

### Users & Authentication
- `POST /api/v1/users/signup` - Create new user account
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/updateMe` - Update user profile

### Bookings & Payments
- `GET /api/v1/bookings/checkout-session/:tourId` - Initialize Chapa payment
- `GET /api/v1/bookings/verify/:tx_ref` - Verify payment and create booking
- `GET /api/v1/bookings/me` - Get user's bookings
- `POST /api/v1/bookings/test-booking/:tourId` - Create test booking (dev only)

### Reviews
- `GET /api/v1/tours/:tourId/reviews` - Get reviews for a tour
- `POST /api/v1/tours/:tourId/reviews` - Create review for a tour

### Environmental Impact
- `GET /api/v1/emissions/eco-scores/me` - Get user's eco scores
- `POST /api/v1/emissions/calculate` - Calculate trip emissions
- `GET /api/v1/community-metrics` - Get community statistics

### AI Recommendations
**Endpoint**: `POST /api/v1/recommend`

**Request Body**:
```json
{
  "userProfile": {
    "interests": ["history", "culture", "nature"],
    "travelStyle": "adventure",
    "budget": "medium",
    "preferences": "Off-the-beaten-path experiences"
  },
  "userReviews": ["Loved the historical sites!", "Amazing wildlife"],
  "experiencesDatabase": [
    {
      "title": "Lalibela Rock Churches",
      "description": "Ancient rock-hewn churches"
    }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "title": "Lalibela Rock Churches",
      "match_score": 0.92,
      "why": "Perfect match for your interest in history and culture..."
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 🧪 Testing

### Test Booking (Development Only)
For testing the booking flow without real payments:
1. Navigate to any tour detail page
2. Click **"🧪 Test Booking (Dev)"** button
3. A test booking will be created instantly
4. Check "My Bookings" to see the test booking

### Testing AI Recommendations
1. Go to `/ai-recommendations`
2. Fill in your preferences (interests, travel style, budget)
3. Click "Get AI Recommendations"
4. View personalized suggestions with match scores

## 🐛 Troubleshooting

### Common Issues

**AI Recommendations not working:**
- Verify `GEMINI_API_KEY` is set in backend `config.env`
- Check backend logs for API errors
- Ensure fallback experiences are loading

**Bookings not appearing:**
- Complete full Chapa payment flow
- Check backend `/api/v1/bookings/verify/:tx_ref` endpoint
- Verify MongoDB connection
- Use test booking feature in development

**Backend not starting:**
- Check all required environment variables are set
- Verify MongoDB connection string
- Ensure `services/` folder exists (for AI features)

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Tesfahun Fola
- Developed as part of sustainable tourism initiative for Ethiopia

## 🙏 Acknowledgments

- Google Gemini AI for powering intelligent recommendations
- Chapa for payment processing
- MongoDB Atlas for database hosting
- Render & Vercel for deployment platforms

- **Tesfahun Fola** - *Initial work* - [GitHub](https://github.com/tesfahunfola)

## 🙏 Acknowledgments

- Ethiopia's rich cultural heritage
- Sustainable tourism initiatives
- Open source community
