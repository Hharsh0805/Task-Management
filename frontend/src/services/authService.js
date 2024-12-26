import axios from 'axios';

const API_URL = 'https://task-management-api-xi.vercel.app/';

export const signup = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, { email, password });
    const { token, userId } = response.data;
    // Store the token and userId in local storage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    return { token, userId };
  } catch (error) {
    // Handle error responses from the server
    if (error.response) {
      // Server error response
      console.error('Signup error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Signup failed');
    } else {
      // Network or other error
      console.error('Signup error:', error.message);
      throw new Error('Signup failed, please try again later.');
    }
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, userId } = response.data;
    // Store the token and userId in local storage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    return { token, userId };
  } catch (error) {
    // Handle error responses from the server
    if (error.response) {
      // Server error response
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    } else {
      // Network or other error
      console.error('Login error:', error.message);
      throw new Error('Login failed, please try again later.');
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

export const isAuthenticated = () => {
  // Check if token exists in local storage
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  // Retrieve the token from local storage
  return localStorage.getItem('token');
};

export const getUserId = () => {
  // Retrieve the userId from local storage
  return localStorage.getItem('userId');
};
