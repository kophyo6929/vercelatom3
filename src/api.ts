const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app' 
  : 'http://localhost:3000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth
  async login(username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(username: string, password: string, securityAmount: number) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, securityAmount }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Users
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async getUserNotifications() {
    return this.request('/users/notifications');
  }

  async getAllUsers() {
    return this.request('/users/admin/all');
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  // Orders
  async getUserOrders() {
    return this.request('/orders');
  }

  async createProductOrder(productId: string, deliveryInfo: string) {
    return this.request('/orders/product', {
      method: 'POST',
      body: JSON.stringify({ productId, deliveryInfo }),
    });
  }

  async createCreditOrder(amount: number, paymentMethod: string, paymentProof: string) {
    return this.request('/orders/credit', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, paymentProof }),
    });
  }

  async getAllOrders() {
    return this.request('/orders/admin/all');
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/admin/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Settings
  async getPaymentAccounts() {
    return this.request('/settings/payment-accounts');
  }

  async getFAQs() {
    return this.request('/settings/faqs');
  }
}

export const apiClient = new ApiClient();
