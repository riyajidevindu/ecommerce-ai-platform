import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
