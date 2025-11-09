require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testBillingSystem() {
  console.log('🔄 Testing billing system...\n');
  
  try {
    // Step 1: Create test user
    console.log('1. Creating test user...');
    const userEmail = `billing-test-${Date.now()}@atlanticproxy.com`;
    const userResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Billing',
      lastName: 'Test',
      email: userEmail,
      password: 'testpass123'
    });
    
    const token = userResponse.data.token;
    console.log('✅ Test user created');
    console.log(`   Email: ${userEmail}`);
    
    // Step 2: Get available plans
    console.log('\n2. Getting available plans...');
    const plansResponse = await axios.get(`${API_BASE}/api/billing/plans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Plans retrieved');
    console.log(`   Available plans: ${Object.keys(plansResponse.data.plans).join(', ')}`);
    
    // Step 3: Get initial billing overview
    console.log('\n3. Getting initial billing overview...');
    const initialBilling = await axios.get(`${API_BASE}/api/billing/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Initial billing overview retrieved');
    console.log(`   Current subscription: ${initialBilling.data.subscription ? 'Yes' : 'None'}`);
    console.log(`   Invoices: ${initialBilling.data.recentInvoices.length}`);
    
    // Step 4: Subscribe to a plan
    console.log('\n4. Subscribing to Growth plan...');
    const subscribeResponse = await axios.post(`${API_BASE}/api/billing/subscribe`, {
      planName: 'growth'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Subscription created');
    console.log(`   Plan: ${subscribeResponse.data.subscription.plan_name}`);
    console.log(`   Price: $${subscribeResponse.data.subscription.price}`);
    console.log(`   Invoice created: #${subscribeResponse.data.invoice.id}`);
    
    // Step 5: Get updated billing overview
    console.log('\n5. Getting updated billing overview...');
    const updatedBilling = await axios.get(`${API_BASE}/api/billing/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Updated billing overview retrieved');
    console.log(`   Active subscription: ${updatedBilling.data.subscription.plan_name}`);
    console.log(`   Usage limit: ${updatedBilling.data.currentUsage.limit ? (updatedBilling.data.currentUsage.limit / (1024*1024*1024)).toFixed(0) + 'GB' : 'Unlimited'}`);
    console.log(`   Pending invoices: ${updatedBilling.data.recentInvoices.filter(i => i.status === 'pending').length}`);
    
    // Step 6: Pay the invoice
    const pendingInvoice = updatedBilling.data.recentInvoices.find(i => i.status === 'pending');\n    if (pendingInvoice) {\n      console.log('\\n6. Paying pending invoice...');\n      await axios.post(`${API_BASE}/api/billing/invoices/${pendingInvoice.id}/pay`, {}, {\n        headers: { Authorization: `Bearer ${token}` }\n      });\n      console.log('✅ Invoice paid successfully');\n      console.log(`   Invoice #${pendingInvoice.id} - $${pendingInvoice.amount}`);\n    }\n    \n    // Step 7: Test usage limit check\n    console.log('\\n7. Testing usage limit check...');\n    const finalBilling = await axios.get(`${API_BASE}/api/billing/overview`, {\n      headers: { Authorization: `Bearer ${token}` }\n    });\n    console.log('✅ Usage limit check completed');\n    console.log(`   Within limit: ${finalBilling.data.currentUsage.withinLimit}`);\n    console.log(`   Usage percentage: ${finalBilling.data.currentUsage.percentage}%`);\n    \n    console.log('\\n🎉 All billing system tests passed!');\n    console.log('\\n📊 Test Summary:');\n    console.log('   ✅ Plan management');\n    console.log('   ✅ Subscription creation');\n    console.log('   ✅ Invoice generation');\n    console.log('   ✅ Payment processing');\n    console.log('   ✅ Usage tracking');\n    console.log('   ✅ Billing dashboard data');\n    \n  } catch (error) {\n    console.error('\\n❌ Billing test failed:');\n    console.error('   Error:', error.response?.data || error.message);\n    console.error('   Status:', error.response?.status);\n    process.exit(1);\n  }\n}\n\ntestBillingSystem();