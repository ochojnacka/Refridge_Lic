import AsyncStorage from '@react-native-async-storage/async-storage';
import { WasteLog, WasteReason } from '../types/domain';

// 🔧 IMPORTANT: Change this to your laptop IP for mobile/simulator testing
// Use: ipconfig (Windows) to find your IPv4 address
// Example: http://192.168.1.13:3000
const API_BASE_URL = 'http://192.168.0.249:3000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private token: string | null = null;

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async loadToken() {
    this.token = await AsyncStorage.getItem('authToken');
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers,
      };

      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (response.data?.token) {
      await this.setToken(response.data.token);
    }

    return response;
  }

  async register(email: string, password: string, name: string, restaurantName: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { email, password, name, restaurantName },
    });
  }

  // Inventory endpoints
  async getInventoryItems() {
    return this.request('/inventory/items', { method: 'GET' });
  }

  async addInventoryItem(name: string, quantity: number, unit: string, costPrice: number, category: string) {
    return this.request('/inventory/items', {
      method: 'POST',
      body: { name, quantity, unit, costPrice, category },
    });2
  }

  async updateInventoryItem(id: string, updates: any) {
    return this.request(`/inventory/items/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request(`/inventory/items/${id}`, { method: 'DELETE' });
  }

  // Recipes endpoints
  async getRecipes() {
    return this.request('/recipes', { method: 'GET' });
  }

  async createRecipe(name: string, instructions: string, costPrice: number, sellingPrice: number, category: string, ingredients: Array<{inventoryItemId: string, quantity: number, unit: string}> = []) {
    return this.request('/recipes', {
      method: 'POST',
      body: { 
        name, 
        instructions, 
        costPrice, 
        sellingPrice, 
        category, 
        ingredients 
      },
    });
  }

  async updateRecipe(id: string, updates: any) {
    return this.request(`/recipes/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteRecipe(id: string) {
    return this.request(`/recipes/${id}`, { method: 'DELETE' });
  }

  // Sales endpoints
  async recordSale(recipeId: string, quantity: number, revenue: number) {
    return this.request('/sales/record', {
      method: 'POST',
      body: { recipeId, quantity, revenue },
    });
  }

  async getSales(dateFrom?: string, dateTo?: string, recipeId?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (recipeId) params.append('recipeId', recipeId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/sales${query}`, { method: 'GET' });
  }

  async getSalesStats() {
    return this.request('/sales/stats/aggregate', { method: 'GET' });
  }

  // Analytics endpoints
  async getWasteReport(range: string = '30days') {
    return this.request(`/analytics/waste-report?range=${range}`, { method: 'GET' });
  }

  async getProfitabilityReport(range: string = '30days') {
    return this.request(`/analytics/profitability?range=${range}`, { method: 'GET' });
  }

  async getInventoryHealth() {
    return this.request('/analytics/inventory-health', { method: 'GET' });
  }

  async getInvestmentAppraisal() {
    return this.request('/analytics/investment-appraisal', { method: 'GET' });
  }

  async getDemandPattern(recipeId: string) {
    return this.request(`/analytics/demand-pattern/${recipeId}`, { method: 'GET' });
  }

  async getMenuSuggestions(limit: number = 5) {
    return this.request(`/analytics/suggestions?limit=${limit}`, { method: 'GET' });
  }

  // Waste endpoints
  async logWaste(itemId: string, quantity: number, reason: WasteReason) {
    return this.request<WasteLog>('/waste/log', {
      method: 'POST',
      body: { itemId, quantity, reason },
    });
  }

  async getWasteLogs(dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<WasteLog[]>('/waste/logs${query}', { method: 'GET' });
  }
}

export const apiClient = new ApiClient();
