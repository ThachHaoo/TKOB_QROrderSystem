// Central Axios instance with interceptors (Client-only)
'use client';

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (attach token if present)
api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Response interceptor (handle 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      // Optional: redirect to login or show a toast
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
