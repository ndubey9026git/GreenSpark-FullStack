// Use the VITE_API_BASE_URL environment variable (set in Vercel) for production, 
// and fall back to localhost for local development.
// 
// IMPORTANT: The Vercel variable VITE_API_BASE_URL MUST be set to your 
// live backend URL, including the /api prefix: 
// "https://greenspark-fullstack.onrender.com/api"
//
// We are setting the API_BASE to include '/api' to resolve the redundant 
// path issue observed in the error logs (/api/api/auth/login).
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"; 

export { API_BASE };