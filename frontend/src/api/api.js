// src/api/api.js
import axios from "axios";
import { API_BASE } from "../config"; // Using the config file you already have

// Create an axios instance
const API = axios.create({
  baseURL: `${API_BASE}/api`, // All requests will be prefixed with http://localhost:5000/api
  headers: {
    "Content-Type": "application/json",
  },
});

// IMPORTANT: Interceptor to add the token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;