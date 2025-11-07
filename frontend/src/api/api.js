import axios from "axios";
// Import the dynamically set base URL
import { API_BASE } from "../config";

// 1. Check the API_BASE value in the console to ensure Vercel picked up the variable.
// In production, this should log: "https://greenspark-fullstack.onrender.com/api"
// console.log("API Base URL:", API_BASE); 

// 2. Create an Axios instance using the API_BASE URL.
// Since API_BASE already includes the necessary /api path segment (e.g., https://.../api),
// we do NOT need to add '/api' again here. This fixes the redundant path issue.
const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach the JWT token to every request if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Attaches the token in the format "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;