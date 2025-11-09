require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testProxyCreation() {
  console.log('🔄 Testing proxy creation flow...');
  
  try {
    // Login first
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'test@atlanticproxy.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully');
    
    // Test proxy creation
    console.log('\n1. Creating residential proxy...');
    const proxyData = {
      type: 'residential',
      country: 'US',
      city: 'New York'
    };
    
    const createResponse = await axios.post(`${API_BASE}/api/proxies`, proxyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Proxy created successfully');
    console.log('Endpoint:', createResponse.data.endpoint);
    
    // Get user proxies
    console.log('\n2. Fetching user proxies...');
    const proxiesResponse = await axios.get(`${API_BASE}/api/proxies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Proxies fetched');
    console.log('Count:', proxiesResponse.data.endpoints.length);
    
    // Test proxy deletion
    if (proxiesResponse.data.endpoints.length > 0) {
      const proxyId = proxiesResponse.data.endpoints[0].id;
      console.log('\n3. Deleting proxy...');
      
      await axios.delete(`${API_BASE}/api/proxies/${proxyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Proxy deleted successfully');
    }
    
    console.log('\n🎉 All proxy tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testProxyCreation();