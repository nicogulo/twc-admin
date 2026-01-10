// API Service for TWC Admin Panel
import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Base URL from environment or default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-site.com';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('twc_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('twc_refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${BASE_URL}/wp-json/jwt-auth/v1/token/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const newToken = response.data.token;
          Cookies.set('twc_jwt_token', newToken, { expires: 7 });

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        Cookies.remove('twc_jwt_token');
        Cookies.remove('twc_refresh_token');
        Cookies.remove('twc_user');
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Login and get JWT token
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/wp-json/jwt-auth/v1/token', {
      username,
      password,
    });
    return response.data;
  },

  // Validate current token
  validateToken: async () => {
    const response = await apiClient.post(
      '/wp-json/jwt-auth/v1/token/validate'
    );
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiClient.post('/wp-json/jwt-auth/v1/token/refresh');
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await apiClient.get('/wp-json/wp/v2/users/me', {
      params: { context: 'edit' },
    });
    return response.data;
  },
};

// User Management API
export const userAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wp/v2/users', {
      params: { ...params, context: 'edit' },
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/wp-json/wp/v2/users/${id}`);
    return response.data;
  },

  create: async (userData: any) => {
    const response = await apiClient.post('/wp-json/wp/v2/users', userData);
    return response.data;
  },

  update: async (id: number, userData: any) => {
    const response = await apiClient.put(
      `/wp-json/wp/v2/users/${id}`,
      userData
    );
    return response.data;
  },

  delete: async (id: number, reassign?: number) => {
    const response = await apiClient.delete(`/wp-json/wp/v2/users/${id}`, {
      params: { force: true, reassign },
    });
    return response.data;
  },
};

// Activity Logs API
export const activityAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/wp-json/simple-history/v1/events', {
      params,
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(
      `/wp-json/simple-history/v1/events/${id}`
    );
    return response.data;
  },

  checkNew: async (sinceId: number) => {
    const response = await apiClient.get(
      '/wp-json/simple-history/v1/events/new',
      {
        params: { since_id: sinceId },
      }
    );
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get(
      '/wp-json/simple-history/v1/stats/summary'
    );
    return response.data;
  },
};

// Products API
export const productAPI = {
  getAll: async (params?: any) => {
    // Return full response including headers for pagination
    const response = await apiClient.get('/wp-json/wc/v3/products', { params });
    return response; // Return full axios response
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/wp-json/wc/v3/products/${id}`);
    return response.data;
  },

  create: async (productData: any) => {
    const response = await apiClient.post(
      '/wp-json/wc/v3/products',
      productData
    );
    return response.data;
  },

  update: async (id: number, productData: any) => {
    const response = await apiClient.put(
      `/wp-json/wc/v3/products/${id}`,
      productData
    );
    return response.data;
  },

  delete: async (id: number, force: boolean = false) => {
    const response = await apiClient.delete(`/wp-json/wc/v3/products/${id}`, {
      params: { force },
    });
    return response.data;
  },

  getCategories: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wc/v3/products/categories', {
      params,
    });

    return response; // Return full response including headers
  },

  getBrands: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wc/v3/products/brands', {
      params,
    });
    return response.data;
  },

  getTags: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wc/v3/products/tags', {
      params,
    });
    return response.data;
  },

  uploadMedia: async (formData: FormData) => {
    const response = await apiClient.post('/wp-json/wp/v2/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Brand API
export const brandAPI = {
  getAll: async (params?: any) => {
    // Return full response including headers for pagination
    const response = await apiClient.get('/wp-json/wc/v3/products/brands', {
      params,
    });
    return response; // Return full axios response with headers
  },

  getById: async (id: number) => {
    const response = await apiClient.get(
      `/wp-json/wc/v3/products/brands/${id}`
    );
    return response.data;
  },

  create: async (brandData: any) => {
    const response = await apiClient.post(
      '/wp-json/wc/v3/products/brands',
      brandData
    );
    return response.data;
  },

  update: async (id: number, brandData: any) => {
    const response = await apiClient.put(
      `/wp-json/wc/v3/products/brands/${id}`,
      brandData
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(
      `/wp-json/wc/v3/products/brands/${id}`,
      {
        params: { force: true },
      }
    );
    return response.data;
  },

  batch: async (batchData: any) => {
    const response = await apiClient.post(
      '/wp-json/wc/v3/products/brands/batch',
      batchData
    );
    return response.data;
  },
};

// Price History API
export const priceHistoryAPI = {
  getHistory: async (productId: number) => {
    const response = await apiClient.get(
      `/wp-json/wc/v3/products/${productId}/price-history`
    );
    return response.data;
  },

  getProductWithHistory: async (productId: number) => {
    const response = await apiClient.get(
      `/wp-json/wc/v3/products/${productId}/price`
    );
    return response.data;
  },

  addEntry: async (productId: number, entry: any) => {
    const response = await apiClient.post(
      `/wp-json/wc/v3/products/${productId}/price-history`,
      entry
    );
    return response.data;
  },

  updateEntry: async (productId: number, entryId: number, entry: any) => {
    const response = await apiClient.put(
      `/wp-json/wc/v3/products/${productId}/price-history/${entryId}`,
      entry
    );
    return response.data;
  },

  deleteEntry: async (productId: number, entryId: number) => {
    const response = await apiClient.delete(
      `/wp-json/wc/v3/products/${productId}/price-history/${entryId}`
    );
    return response.data;
  },

  deleteAll: async (productId: number) => {
    const response = await apiClient.delete(
      `/wp-json/wc/v3/products/${productId}/price-history`
    );
    return response.data;
  },
};

// Testimonials API
export const testimonialAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wc/v3/testimonials', {
      params,
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/wp-json/wc/v3/testimonials/${id}`);
    return response.data;
  },

  create: async (testimonialData: FormData) => {
    const response = await apiClient.post(
      '/wp-json/wc/v3/testimonials',
      testimonialData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  update: async (id: number, testimonialData: FormData) => {
    const response = await apiClient.put(
      `/wp-json/wc/v3/testimonials/${id}`,
      testimonialData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(
      `/wp-json/wc/v3/testimonials/${id}`
    );
    return response.data;
  },
};

// Posts/Articles API
export const postAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wp/v2/posts', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/wp-json/wp/v2/posts/${id}`);
    return response.data;
  },

  create: async (postData: any) => {
    const response = await apiClient.post('/wp-json/wp/v2/posts', postData);
    return response.data;
  },

  update: async (id: number, postData: any) => {
    const response = await apiClient.put(
      `/wp-json/wp/v2/posts/${id}`,
      postData
    );
    return response.data;
  },

  delete: async (id: number, force: boolean = false) => {
    const response = await apiClient.delete(`/wp-json/wp/v2/posts/${id}`, {
      params: { force },
    });
    return response.data;
  },

  getCategories: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wp/v2/categories', {
      params,
    });
    return response.data;
  },

  getTags: async (params?: any) => {
    const response = await apiClient.get('/wp-json/wp/v2/tags', { params });
    return response.data;
  },

  uploadMedia: async (formData: FormData) => {
    const response = await apiClient.post('/wp-json/wp/v2/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default apiClient;
