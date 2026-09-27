// Axios instance with interceptors for JWT auth
import axios from 'axios';

// Base URL - change to your backend URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.hash !== '#/login' && !window.location.href.includes('/login')) {
        window.location.hash = '#/login';
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to get error message from API response
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.map((e: any) => e.msg).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
