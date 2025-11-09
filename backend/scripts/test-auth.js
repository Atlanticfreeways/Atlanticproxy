require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAuthFlow() {
  console.log('🔄 Testing authentication flow...');
  
  try {
    // Test registration
    console.log('\n1. Testing registration...');
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testauth@atlanticproxy.com',
      password: 'testpass123',
      company: 'Test Company'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('User:', registerResponse.data.user.email);
    console.log('Token received:', !!registerResponse.data.token);
    
    const token = registerResponse.data.token;
    
    // Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login successful');
    console.log('Token received:', !!loginResponse.data.token);
    
    // Test protected route
    console.log('\n3. Testing protected route...');
    const profileResponse = await axios.get(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected route access successful');
    console.log('Profile:', profileResponse.data.user.email);
    
    // Test dashboard stats
    console.log('\n4. Testing dashboard stats...');
    const statsResponse = await axios.get(`${API_BASE}/api/users/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard stats retrieved');
    console.log('Stats:', statsResponse.data);
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthFlow();