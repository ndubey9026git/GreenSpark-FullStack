// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

console.log("DEBUG - Loaded MONGO_URI:", process.env.MONGO_URI);

const app = express();

// ======================================================================
// 🚀 CORS FIX: Explicitly allow the Vercel Frontend URL
// ======================================================================

// 1. Define the allowed origins, including your Vercel production URL
const allowedOrigins = [
    // Vercel Frontend Production URL
    'https://green-spark-full-stack.vercel.app', 
    // Vercel Frontend Preview/Development URL (if needed for testing branches)
    'https://green-spark-full-stack-git-main-nikhil-dubeys-projects-802c3dd0.vercel.app',
    // Local development (for testing locally against the live backend)
    'http://localhost:5173', // Common Vite dev port
    'http://localhost:3000' // Common default dev port
];

const corsOptions = {
  // Check if the request's origin is in the allowed list
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  // IMPORTANT: This allows credentials (like cookies/JWT tokens) to be sent
  credentials: true, 
};

// Use the configured CORS middleware
app.use(cors(corsOptions));

// ======================================================================
// 🌐 END CORS FIX
// ======================================================================

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const challRoutes = require('./routes/challenges');
const leaderboardRoutes = require("./routes/leaderboard");
const teacherRoutes = require("./routes/teacher");
const adminRoutes = require("./routes/admin");
const assignmentRoutes = require('./routes/assignments');
const learnRoutes = require('./routes/learn');
const mediaRoutes = require('./routes/media');
const gameRoutes = require('./routes/game');

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/games', gameRoutes);

// Root
app.get('/', (req, res) => res.send('🌱 GreenSpark Backend is running!'));

// Connect DB & start
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(()=> {
    console.log('✅ MongoDB connected');
    app.listen(PORT, ()=> console.log('🚀 Server running on port', PORT));
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));