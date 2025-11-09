require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testResellerProgram() {
  console.log('🔄 Testing reseller program...\n');
  
  try {
    // Step 1: Create regular user
    console.log('1. Creating regular user...');
    const userEmail = `reseller-candidate-${Date.now()}@atlanticproxy.com`;
    const userResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Reseller',
      lastName: 'Candidate',
      email: userEmail,
      password: 'reseller123'
    });
    
    const userToken = userResponse.data.token;
    console.log('✅ Regular user created');
    console.log(`   Email: ${userEmail}`);
    
    // Step 2: Create admin user
    console.log('\n2. Creating admin user...');
    const adminEmail = `admin-reseller-${Date.now()}@atlanticproxy.com`;
    const adminResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: 'admin123'
    });
    
    const adminToken = adminResponse.data.token;
    
    // Upgrade to admin
    await axios.patch(`${API_BASE}/api/admin/users/${adminResponse.data.user.id}/role`, {
      role: 'admin'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin user created');
    
    // Step 3: Submit reseller application
    console.log('\n3. Submitting reseller application...');
    const applicationData = {
      companyName: 'Test Reseller Company',
      website: 'https://testreseller.com',
      businessType: 'agency',
      expectedVolume: '11-50',
      experience: 'We have 3 years of experience in proxy services and data collection.',
      marketingPlan: 'We plan to market through our existing client base and digital marketing channels.'
    };
    
    const applicationResponse = await axios.post(`${API_BASE}/api/reseller/apply`, applicationData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Reseller application submitted');
    console.log(`   Application ID: ${applicationResponse.data.application.id}`);
    console.log(`   Company: ${applicationResponse.data.application.company_name}`);
    
    // Step 4: Check application status
    console.log('\n4. Checking application status...');
    const statusResponse = await axios.get(`${API_BASE}/api/reseller/application`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Application status retrieved');
    console.log(`   Status: ${statusResponse.data.application.status}`);
    
    // Step 5: Admin views applications
    console.log('\n5. Admin viewing pending applications...');
    const adminApplicationsResponse = await axios.get(`${API_BASE}/api/reseller/admin/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin applications retrieved');
    console.log(`   Pending applications: ${adminApplicationsResponse.data.applications.length}`);
    
    // Step 6: Admin approves application
    const applicationId = applicationResponse.data.application.id;
    console.log('\n6. Admin approving application...');
    await axios.post(`${API_BASE}/api/reseller/admin/applications/${applicationId}/approve`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Application approved');
    
    // Step 7: Test reseller dashboard access
    console.log('\n7. Testing reseller dashboard access...');
    
    // Login again to get updated token with reseller role
    const resellerLoginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: userEmail,
      password: 'reseller123'
    });
    
    const resellerToken = resellerLoginResponse.data.token;
    
    const dashboardResponse = await axios.get(`${API_BASE}/api/reseller/dashboard`, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ Reseller dashboard accessed');
    console.log(`   Commission Rate: ${dashboardResponse.data.stats.profile.commission_rate}%`);
    console.log(`   Tier: ${dashboardResponse.data.stats.profile.tier}`);
    console.log(`   Customer Count: ${dashboardResponse.data.stats.customerCount}`);
    
    // Step 8: Test customer list
    console.log('\n8. Testing customer list...');
    const customersResponse = await axios.get(`${API_BASE}/api/reseller/customers`, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ Customer list retrieved');
    console.log(`   Customers: ${customersResponse.data.customers.length}`);
    
    console.log('\n🎉 All reseller program tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Reseller application system');
    console.log('   ✅ Admin approval workflow');
    console.log('   ✅ Role upgrade automation');
    console.log('   ✅ Reseller dashboard access');
    console.log('   ✅ Customer management');
    console.log('   ✅ Commission tracking');
    
  } catch (error) {
    console.error('\n❌ Reseller program test failed:');
    console.error('   Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    process.exit(1);
  }
}

testResellerProgram();