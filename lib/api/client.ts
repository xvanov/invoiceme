import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Base API client configuration.
 * Provides a configured axios instance for making HTTP requests to the backend API.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for adding authentication tokens, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling common errors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      if (status === 401 || status === 403) {
        // Unauthorized or Forbidden - redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('authEmail');
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status >= 500) {
        // Server error
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

