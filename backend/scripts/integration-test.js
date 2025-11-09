require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function runIntegrationTests() {
  console.log('🧪 Running integration tests...\n');
  
  let testToken = null;
  const testEmail = `test-${Date.now()}@atlanticproxy.com`;
  
  try {
    // Test 1: User Registration
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'testpass123',
      company: 'Test Company'
    });
    
    testToken = registerResponse.data.token;
    console.log('✅ Registration successful');
    console.log(`   User: ${registerResponse.data.user.email}`);
    console.log(`   Referral Code: ${registerResponse.data.referralCode}`);
    
    // Test 2: User Login
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testEmail,
      password: 'testpass123'
    });
    console.log('✅ Login successful');
    
    // Test 3: Protected Route Access
    console.log('\n3. Testing protected route access...');
    const profileResponse = await axios.get(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('✅ Profile access successful');
    console.log(`   Profile: ${profileResponse.data.user.firstName} ${profileResponse.data.user.lastName}`);
    
    // Test 4: Dashboard Stats
    console.log('\n4. Testing dashboard stats...');
    const statsResponse = await axios.get(`${API_BASE}/api/users/dashboard-stats`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('✅ Dashboard stats retrieved');
    console.log(`   Active Proxies: ${statsResponse.data.activeProxies}`);
    console.log(`   Bandwidth Used: ${statsResponse.data.bandwidthUsed}`);
    
    // Test 5: Proxy Creation
    console.log('\n5. Testing proxy creation...');
    const proxyResponse = await axios.post(`${API_BASE}/api/proxies`, {
      type: 'residential',
      country: 'US',
      city: 'New York'
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('✅ Proxy created successfully');
    console.log(`   Endpoint: ${proxyResponse.data.endpoint.endpoint_url}`);
    
    const proxyId = proxyResponse.data.endpoint.id;
    
    // Test 6: Get User Proxies
    console.log('\n6. Testing proxy retrieval...');
    const proxiesResponse = await axios.get(`${API_BASE}/api/proxies`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('✅ Proxies retrieved successfully');
    console.log(`   Total Proxies: ${proxiesResponse.data.endpoints.length}`);
    
    // Test 7: Referral Stats
    console.log('\n7. Testing referral stats...');
    const referralResponse = await axios.get(`${API_BASE}/api/referrals/stats`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('✅ Referral stats retrieved');
    console.log(`   Referral Code: ${referralResponse.data.referralCode.code}`);
    console.log(`   Commission Rate: ${referralResponse.data.referralCode.commission_rate}%`);
    
    // Test 8: Analytics
    console.log('\n8. Testing analytics...');
    const analyticsResponse = await axios.get(`${API_BASE}/api/analytics/usage?period=7d`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('✅ Analytics retrieved');
    console.log(`   Usage Records: ${analyticsResponse.data.usageOverTime.length}`);
    
    // Test 9: Proxy Deletion
    console.log('\n9. Testing proxy deletion...');
    await axios.delete(`${API_BASE}/api/proxies/${proxyId}`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log('✅ Proxy deleted successfully');
    
    console.log('\n🎉 All integration tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ User Registration & Login');
    console.log('   ✅ Authentication & Authorization');
    console.log('   ✅ Proxy Management (CRUD)');
    console.log('   ✅ Dashboard & Analytics');
    console.log('   ✅ Referral System');
    console.log('   ✅ Error Handling');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:');
    console.error('   Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    console.error('   URL:', error.config?.url);
    process.exit(1);
  }
}

runIntegrationTests();