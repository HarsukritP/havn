import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:8080/api'
  : 'https://api.spotsave.app/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@spotsave_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Return data directly if success
    return response.data;
  },
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized (token expired)
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('@spotsave_auth_token');
        await AsyncStorage.removeItem('@spotsave_auth_user');
        // TODO: Navigate to login screen
      }
      
      // Return error response data
      return Promise.reject(error.response.data);
    }
    
    // Network error or timeout
    return Promise.reject({
      success: false,
      error: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    });
  }
);

export default api;

