import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      // Handle authentication errors
      if (error.response.status === 401 || error.response.status === 403) {
        // Avoid redirecting if we're already on the auth page or if the error was during authentication
        const isAuthRequest = error.config?.url?.includes('/auth/');
        const isAlreadyOnAuthPage = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/auth');
        
        if (!isAlreadyOnAuthPage && !isAuthRequest) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/dashboard/auth';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 