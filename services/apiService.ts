import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  logout: () =>
    apiClient.post('/auth/logout'),

  getProfile: () =>
    apiClient.get('/user/profile'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiClient.put('/user/profile', data),

  getGoogleOAuthUrl: () => {
    const apiUrl = API_URL.replace('/api', '');
    return `${apiUrl}/api/auth/google`;
  },

  getFacebookOAuthUrl: () => {
    const apiUrl = API_URL.replace('/api', '');
    return `${apiUrl}/api/auth/facebook`;
  },
};

export const paymentAPI = {
  createStripeIntent: (planId: string) =>
    apiClient.post('/payment/stripe/create-intent', { planId }),

  confirmStripePayment: (paymentIntentId: string) =>
    apiClient.post('/payment/stripe/confirm', { paymentIntentId }),

  createMercadoPagoPix: (planId: string) =>
    apiClient.post('/payment/mercadopago/create-pix', { planId }),

  checkMercadoPagoStatus: (paymentId: string) =>
    apiClient.get(`/payment/mercadopago/status/${paymentId}`),

  getSubscription: () =>
    apiClient.get('/payment/subscription'),

  cancelSubscription: () =>
    apiClient.post('/payment/subscription/cancel'),
};

export const productsAPI = {
  getProducts: () =>
    apiClient.get('/products'),

  createProduct: (productData: any) =>
    apiClient.post('/products', productData),

  updateProduct: (id: string, data: any) =>
    apiClient.put(`/products/${id}`, data),

  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`),
};

export default apiClient;