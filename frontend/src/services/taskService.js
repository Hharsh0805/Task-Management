import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'https://authentication-app-api-bay.vercel.app/';

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleApiError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  throw error;
};

export const fetchTasks = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks`, { 
      headers: authHeader(),
      timeout: 5000 // 5 seconds timeout
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const addTask = async (title) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, 
      { title }, 
      { 
        headers: authHeader(),
        timeout: 5000 // 5 seconds timeout
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateTask = async (id, title) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${id}`, 
      { title }, 
      { 
        headers: authHeader(),
        timeout: 5000 // 5 seconds timeout
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteTask = async (id) => {
  try {
    await axios.delete(`${API_URL}/tasks/${id}`, { 
      headers: authHeader(),
      timeout: 5000 // 5 seconds timeout
    });
  } catch (error) {
    handleApiError(error);
  }
};

// Retry mechanism for network errors
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const addTaskWithRetry = (title) => retryOperation(() => addTask(title));
export const updateTaskWithRetry = (id, title) => retryOperation(() => updateTask(id, title));
export const deleteTaskWithRetry = (id) => retryOperation(() => deleteTask(id));