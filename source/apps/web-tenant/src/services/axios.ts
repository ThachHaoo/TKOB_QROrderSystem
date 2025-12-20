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
      console.warn('⚠️ [axios] 401 Unauthorized - Token may be invalid or expired');
      localStorage.removeItem('authToken');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 [axios] Redirecting to login page...');
        // window.location.href = '/login';
      }
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
    const errorData = error.response?.data || {};
    
    // Better error logging with proper error info extraction
    const errorInfo = {
      method: config.method?.toUpperCase() || 'UNKNOWN',
      url: config.url || 'UNKNOWN',
      duration: `${duration}ms`,
      status: error.response?.status || error.code || 'UNKNOWN',
      statusText: error.response?.statusText || '',
      errorMessage: errorData?.error?.message || errorData?.message || error.message || 'Unknown error',
      hasToken: !!(config.headers?.Authorization),
    };
    
    console.error('🌐 [customInstance] Request Failed:', errorInfo);
    
    // Log full error response data if available
    if (error.response) {
      // For 400 errors, provide validation details
      if (error.response.status === 400) {
        console.warn('⚠️ [customInstance] Bad Request (400):', {
          url: config.url,
          validationErrors: errorData?.message || errorData?.error,
          details: errorData,
        });
      }
      
      console.error('🌐 [customInstance] Server Response:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('🌐 [customInstance] Request Error (No Response):', {
        message: error.message,
        code: error.code,
        config: {
          url: config.url,
          method: config.method,
        },
      });
    } else {
      console.error('🌐 [customInstance] Error:', error.message);
    }
    
    throw error;
  });
};

export default api;
