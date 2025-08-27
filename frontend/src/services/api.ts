import axios from 'axios';

let accessToken = '';

export const setAuthToken = (token: string) => {
  accessToken = token;
};

// Compute a sensible API base URL for browser and server contexts
const hostname = (typeof window !== 'undefined') ? window.location.hostname : '';
let defaultBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
if (!defaultBaseUrl) {
  if (hostname.endsWith('.vercel.app') || hostname.endsWith('chat-ai-store.site')) {
    defaultBaseUrl = 'https://api.chat-ai-store.site';
  } else {
    defaultBaseUrl = 'http://localhost';
  }
}

export const API_BASE_URL = defaultBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
  if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url === '/api/v1/auth/refresh') {
        return Promise.reject(error); // Don't retry refresh token requests
      }
      originalRequest._retry = true;
      try {
        const refreshPath = '/api/v1/auth/refresh';
        const response = await apiClient.post<{ access_token: string }>(refreshPath);
        const { access_token } = response.data;
        setAuthToken(access_token);
        try {
          // Best-effort: keep token across reloads if context isn't yet mounted
          sessionStorage.setItem('access_token', access_token);
        } catch {}
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle failed refresh here (e.g., redirect to login)
        console.error('Session expired. Please log in again.');
        // Optionally, you can trigger a logout action here
        // For example: window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getHealth = async (service: string) => {
  try {
    const response = await apiClient.get(`/${service}/health`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching health for ${service}:`, error);
    throw error;
  }
};

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = async (username, password): Promise<LoginResponse> => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  try {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', params, {
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

interface RegisterResponse {
  username: string;
  email: string;
  id: number;
  is_active: boolean;
}

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/api/v1/auth/register', {
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

interface UserResponse {
  username: string;
  email: string;
  id: number;
  is_active: boolean;
}

export const getCurrentUser = async (): Promise<UserResponse> => {
  try {
    const response = await apiClient.get<UserResponse>('/api/v1/users/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Stock Service
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_qty: number;
  available_qty?: number;
  image: string;
  sku: string;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<Product[]>('/api/v1/products/');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await apiClient.post<Product>('/api/v1/products/', product);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  try {
    const response = await apiClient.put<Product>(`/api/v1/products/${id}`, product);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// File Storage Service
export interface UploadResponse {
  url: string;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// AI Orchestrator Service
export interface Message {
  id: number;
  customer_id: number;
  user_message: string;
  response_message: string | null;
}

export interface Conversation {
  whatsapp_no: string;
  first_message: string;
  messages: Message[];
}

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get<Conversation[]>('/api/v1/ai/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// WhatsApp Service
export interface WhatsAppUser {
  id: number;
  whatsapp_no?: string | null;
  phone_number_id?: string | null;
}

export const getWhatsAppUser = async (userId: number): Promise<WhatsAppUser> => {
  try {
    const response = await apiClient.get<WhatsAppUser>(`/api/v1/whatsapp/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching WhatsApp user:', error);
    throw error;
  }
};

export const createOrUpdateWhatsAppUser = async (
  userId: number,
  data: { whatsapp_no?: string; phone_number_id?: string }
): Promise<WhatsAppUser> => {
  try {
    const response = await apiClient.post<WhatsAppUser>(`/api/v1/whatsapp/user/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating/updating WhatsApp user:', error);
    throw error;
  }
};

// Customers (WhatsApp service)
export const getCustomersCount = async (userId: number): Promise<number> => {
  try {
    const response = await apiClient.get<{ count: number }>(`/api/v1/whatsapp/users/${userId}/customers/count`);
    return response.data.count;
  } catch (error) {
    console.error('Error fetching customers count:', error);
    throw error;
  }
};
