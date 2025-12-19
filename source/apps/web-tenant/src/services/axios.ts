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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Orval custom mutator function
export const customInstance = <T>(config: any): Promise<T> => {
  const startTime = Date.now();
  console.log('🌐 [customInstance] Request:', {
    method: config.method,
    url: config.url,
    params: config.params,
    data: config.data,
  });
  
  return api(config).then(({ data }) => {
    const duration = Date.now() - startTime;
    console.log('🌐 [customInstance] Response received:', {
      method: config.method,
      url: config.url,
      duration: `${duration}ms`,
      rawData: data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      hasDataProperty: data && typeof data === 'object' && 'data' in data,
    });
    
    // Backend wraps response in { success: true, data: {...} }
    // Unwrap it to return the actual data
    if (data && typeof data === 'object' && 'data' in data) {
      console.log('🌐 [customInstance] Unwrapping data.data:', data.data);
      return data.data as T;
    }
    console.log('🌐 [customInstance] Returning data as-is:', data);
    return data;
  }).catch((error) => {
    const duration = Date.now() - startTime;
    console.error('🌐 [customInstance] Error:', {
      method: config.method,
      url: config.url,
      duration: `${duration}ms`,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });
    throw error;
  });
};

export default api;
