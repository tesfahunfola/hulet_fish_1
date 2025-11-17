# Hulet Fish - Explore Ethiopia Sustainably

A full-stack web application for exploring Ethiopia's rich cultural heritage and natural wonders while promoting sustainable tourism through carbon offset and eco-score features.

## 🌟 Features

- **Tour Management**: Browse and book authentic Ethiopian tours
- **Carbon Offset**: Calculate and offset carbon emissions from travel
- **Eco-Score System**: Track and improve your environmental impact
- **User Authentication**: Secure signup, login, and profile management
- **Booking System**: Seamless tour booking with payment integration
- **Community Metrics**: View collective environmental impact
- **Responsive Design**: Works perfectly on all devices

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
- **Sendinblue/Brevo** for email services

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for state management

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
│   ├── utils/                    # Utility functions
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
│   │   ├── lib/                  # Utilities and API calls
│   │   └── contexts/             # React contexts
│   ├── public/                   # Static assets
│   └── package.json
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
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/etxplore
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
BREVO_API_KEY=your-brevo-api-key
CHAPA_SECRET_KEY=your-chapa-secret-key
FRONTEND_URL=http://localhost:5173,https://yourdomain.com
```

## 🚀 Deployment

### Backend (Render)
The backend is configured for deployment on Render with the `render.yaml` file.

### Frontend (Vercel)
The frontend is configured for deployment on Vercel with the `vercel.json` file.

### Manual Deployment
1. Build the frontend: `cd Etxplore-frontend && npm run build`
2. Copy the `dist` folder to backend's `Etxplore-frontend/` directory
3. Deploy the entire backend to your hosting service

## 📊 API Documentation

The API follows RESTful conventions with the following endpoints:

- `/api/v1/tours` - Tour management
- `/api/v1/users` - User authentication and profiles
- `/api/v1/bookings` - Booking management
- `/api/v1/reviews` - Tour reviews
- `/api/v1/emissions` - Carbon emission calculations
- `/api/v1/community-metrics` - Community statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- **Tesfahun Fola** - *Initial work* - [GitHub](https://github.com/tesfahunfola)

## 🙏 Acknowledgments

- Ethiopia's rich cultural heritage
- Sustainable tourism initiatives
- Open source community
