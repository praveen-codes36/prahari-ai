import axios from 'axios';
import { authService } from './authService';

const apiClient = axios.create({
  baseURL: '/api',
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

export default apiClient;
