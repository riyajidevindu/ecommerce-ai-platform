import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async (service: string) => {
  try {
    const response = await apiClient.get(`/${service}/health`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching health for ${service}:`, error);
    throw error;
  }
};

export const login = async (username, password) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  try {
    const response = await apiClient.post('/api/v1/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await apiClient.post('/api/v1/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};
