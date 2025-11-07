const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables (like MONGO_URI)
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// ==========================================================
// ✅ CRITICAL FIX: CORS Configuration Update
// ==========================================================
const allowedOrigins = [
  // 1. Local Development
  'http://localhost:3000', 
  'http://localhost:5173', 
  // 2. Production Frontend (Vercel URL)
  'https://green-spark-full-stack.vercel.app', 
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or server-to-server requests)
    // or if the origin is in our whitelist.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Error: Not allowed by CORS. Origin attempted:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// ==========================================================

// Define the port (using environment variable or defaulting to 5000)
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Start the server only after connecting to the DB
connectDB().then(() => {
  // Define a simple root route for testing
  app.get('/', (req, res) => {
    res.send('GreenSpark Backend API is running!');
  });
  
  // Example placeholder for your actual routes (e.g., /api/auth, /api/users)
  const authRoutes = require('./routes/auth'); // Assuming you have an auth router
  // Add other route imports here...

  app.use('/api/auth', authRoutes);
  // Add other route uses here...

  // Listen for requests
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
// Ensure the process won't crash on unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1)); 
});