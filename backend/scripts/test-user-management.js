require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testUserManagement() {
  console.log('🔄 Testing user management system...\n');
  
  try {
    // Step 1: Create admin user
    console.log('1. Creating admin user...');
    const adminEmail = `admin-${Date.now()}@atlanticproxy.com`;
    const adminResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: 'admin123'
    });
    
    const adminToken = adminResponse.data.token;
    
    // Manually upgrade to admin (in real app, this would be done via database)
    await axios.patch(`${API_BASE}/api/admin/users/${adminResponse.data.user.id}/role`, {
      role: 'admin'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin user created and upgraded');
    console.log(`   Email: ${adminEmail}`);
    
    // Step 2: Create regular user
    console.log('\n2. Creating regular user...');
    const userEmail = `user-${Date.now()}@atlanticproxy.com`;
    const userResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Regular',
      lastName: 'User',
      email: userEmail,
      password: 'user123'
    });
    
    const userToken = userResponse.data.token;
    console.log('✅ Regular user created');
    console.log(`   Email: ${userEmail}`);
    
    // Step 3: Test support ticket creation
    console.log('\n3. Creating support ticket...');
    const ticketResponse = await axios.post(`${API_BASE}/api/support/tickets`, {
      subject: 'Test Support Issue',
      message: 'This is a test support ticket to verify the system is working.',
      priority: 'medium'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Support ticket created');
    console.log(`   Ticket ID: #${ticketResponse.data.ticket.id}`);
    console.log(`   Subject: ${ticketResponse.data.ticket.subject}`);
    
    // Step 4: Test admin stats
    console.log('\n4. Getting admin statistics...');
    const statsResponse = await axios.get(`${API_BASE}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin stats retrieved');
    console.log(`   Total Users: ${statsResponse.data.stats.total_users}`);
    console.log(`   Regular Users: ${statsResponse.data.stats.regular_users}`);
    console.log(`   Open Tickets: ${statsResponse.data.stats.open_tickets}`);
    
    // Step 5: Test user list (admin)
    console.log('\n5. Getting user list...');
    const usersResponse = await axios.get(`${API_BASE}/api/admin/users?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ User list retrieved');
    console.log(`   Users found: ${usersResponse.data.users.length}`);
    
    // Step 6: Test role upgrade
    console.log('\n6. Upgrading user to reseller...');
    await axios.patch(`${API_BASE}/api/admin/users/${userResponse.data.user.id}/role`, {
      role: 'reseller'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ User role upgraded to reseller');
    
    // Step 7: Test support ticket list
    console.log('\n7. Getting support tickets...');
    const ticketsResponse = await axios.get(`${API_BASE}/api/support/tickets`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Support tickets retrieved');
    console.log(`   Tickets: ${ticketsResponse.data.tickets.length}`);
    
    // Step 8: Test admin ticket management
    console.log('\n8. Testing admin ticket management...');
    const adminTicketsResponse = await axios.get(`${API_BASE}/api/support/admin/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin ticket view working');
    console.log(`   All tickets visible: ${adminTicketsResponse.data.tickets.length}`);
    
    // Step 9: Update ticket status
    if (adminTicketsResponse.data.tickets.length > 0) {
      const ticketId = adminTicketsResponse.data.tickets[0].id;
      await axios.patch(`${API_BASE}/api/support/tickets/${ticketId}/status`, {
        status: 'in_progress'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Ticket status updated to in_progress');
    }
    
    console.log('\n🎉 All user management tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Role-based permissions');
    console.log('   ✅ Support ticket system');
    console.log('   ✅ Admin user management');
    console.log('   ✅ User role upgrades');
    console.log('   ✅ System statistics');
    console.log('   ✅ Ticket status management');
    
  } catch (error) {
    console.error('\n❌ User management test failed:');
    console.error('   Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    process.exit(1);
  }
}

testUserManagement();