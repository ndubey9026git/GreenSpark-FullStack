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
// This list allows both the permanent Vercel URL and the temporary one that was causing the failure.
// ==========================================================
const allowedOrigins = [
  // 1. Local Development
  'http://localhost:3000', 
  'http://localhost:5173', 
  // 2. Permanent Production Frontend Alias (Vercel)
  'https://green-spark-full-stack.vercel.app', 
  // 3. Current Failing Deployment URL (Added for immediate fix)
  'https://green-spark-full-stack-5hmhglll3.vercel.app', 
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

// Use the robust CORS options
app.use(cors(corsOptions));
// Handle pre-flight requests (OPTIONS method)
app.options('*', cors(corsOptions)); 
// ==========================================================

// Define the port (using environment variable or defaulting to 5000)
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    // We assume the MONGO_URI is loaded from Render's environment variables
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
  // Assuming the route files are in './routes/'
  const authRoutes = require('./routes/auth'); 
  // Add other route imports here...

  // Mount the routers. This ensures all auth endpoints start with /api/auth
  app.use('/api/auth', authRoutes);
  // Add other route uses here...

  // Listen for requests
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
  
  // Ensure the process won't crash on unhandled rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1)); 
  });
});