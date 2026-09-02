import axios from 'axios';
import { authService } from './authService';

// Same-origin deployments (frontend served by the backend, or a dev proxy) can
// leave VITE_API_BASE_URL unset and keep using the relative "/api" path. If the
// frontend is hosted separately (e.g. Vercel) from the backend (e.g. Render),
// set VITE_API_BASE_URL to the backend's full URL, e.g. https://your-backend.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const session = authService.getSession();
  if (session && session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token is invalid/expired (or an old mock token is lingering), force logout
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
