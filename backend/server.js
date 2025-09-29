// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

console.log("DEBUG - Loaded MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(cors());
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
const gameRoutes = require('./routes/game'); // ✅ ADDED

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/games', gameRoutes); // ✅ ADDED

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