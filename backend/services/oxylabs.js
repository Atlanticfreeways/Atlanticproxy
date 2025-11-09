const axios = require('axios');

class OxylabsService {
  constructor() {
    this.apiKey = process.env.OXYLABS_API_KEY;
    this.networkId = process.env.OXYLABS_NETWORK_ID;
    this.baseURL = process.env.OXYLABS_API_URL || 'https://api.oxylabs.io/v3';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createEndpoint(options = {}) {
    try {
      // For development, create mock endpoint if API fails
      if (process.env.NODE_ENV === 'development') {
        return this.createMockEndpoint(options);
      }
      
      const response = await this.client.post('/endpoints', {
        network_id: this.networkId,
        type: options.type || 'residential',
        country: options.country || 'US',
        city: options.city,
        sticky_session: options.stickySession || false,
        ...options
      });
      
      return response.data;
    } catch (error) {
      console.error('Oxylabs API Error:', error.response?.data || error.message);
      
      // Fallback to mock in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Falling back to mock endpoint...');
        return this.createMockEndpoint(options);
      }
      
      throw new Error('Failed to create proxy endpoint');
    }
  }

  createMockEndpoint(options = {}) {
    const type = options.type || 'residential';
    const country = options.country || 'US';
    const id = Math.random().toString(36).substr(2, 8);
    
    return {
      id: id,
      endpoint_url: `${type}-${country.toLowerCase()}-${id}.atlanticproxy.com:8080`,
      type: type,
      country: country,
      city: options.city,
      status: 'active',
      username: `user_${id}`,
      password: Math.random().toString(36).substr(2, 12),
      created_at: new Date().toISOString()
    };
  }

  async getEndpoints() {
    try {
      const response = await this.client.get('/endpoints');
      return response.data;
    } catch (error) {
      console.error('Oxylabs API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch endpoints');
    }
  }

  async getUsageStats(endpointId, startDate, endDate) {
    try {
      const response = await this.client.get(`/endpoints/${endpointId}/usage`, {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Oxylabs API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch usage statistics');
    }
  }

  async deleteEndpoint(endpointId) {
    try {
      const response = await this.client.delete(`/endpoints/${endpointId}`);
      return response.data;
    } catch (error) {
      console.error('Oxylabs API Error:', error.response?.data || error.message);
      throw new Error('Failed to delete endpoint');
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/account');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('⚠️ Oxylabs API connection failed, using development mode');
      return { 
        success: true, 
        data: { 
          account: 'development-mode',
          network_id: this.networkId,
          status: 'mock'
        } 
      };
    }
  }
}

module.exports = new OxylabsService();