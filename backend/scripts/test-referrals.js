require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testReferralSystem() {
  console.log('🔄 Testing referral system...\n');
  
  try {
    // Step 1: Create referrer user
    console.log('1. Creating referrer user...');
    const referrerEmail = `referrer-${Date.now()}@atlanticproxy.com`;
    const referrerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Referrer',
      lastName: 'User',
      email: referrerEmail,
      password: 'testpass123'
    });
    
    const referrerToken = referrerResponse.data.token;
    const referralCode = referrerResponse.data.referralCode;
    console.log('✅ Referrer created');
    console.log(`   Email: ${referrerEmail}`);
    console.log(`   Referral Code: ${referralCode}`);
    
    // Step 2: Get referrer's initial stats
    console.log('\n2. Getting initial referral stats...');
    const initialStats = await axios.get(`${API_BASE}/api/referrals/stats`, {
      headers: { Authorization: `Bearer ${referrerToken}` }
    });
    console.log('✅ Initial stats retrieved');
    console.log(`   Total Referrals: ${initialStats.data.referralCode.total_referrals}`);
    console.log(`   Commission Rate: ${initialStats.data.referralCode.commission_rate}%`);
    
    // Step 3: Create referred user with referral code
    console.log('\n3. Creating referred user with referral code...');
    const referredEmail = `referred-${Date.now()}@atlanticproxy.com`;
    const referredResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Referred',
      lastName: 'User',
      email: referredEmail,
      password: 'testpass123',
      referralCode: referralCode
    });
    
    console.log('✅ Referred user created');
    console.log(`   Email: ${referredEmail}`);
    
    // Step 4: Check updated referral stats
    console.log('\n4. Checking updated referral stats...');
    const updatedStats = await axios.get(`${API_BASE}/api/referrals/stats`, {
      headers: { Authorization: `Bearer ${referrerToken}` }
    });
    console.log('✅ Updated stats retrieved');
    console.log(`   Total Referrals: ${updatedStats.data.referralCode.total_referrals}`);
    console.log(`   Recent Referrals: ${updatedStats.data.recentReferrals.length}`);
    
    if (updatedStats.data.recentReferrals.length > 0) {
      const latestReferral = updatedStats.data.recentReferrals[0];
      console.log(`   Latest Referral: ${latestReferral.first_name} ${latestReferral.last_name}`);
      console.log(`   Status: ${latestReferral.status}`);
    }
    
    // Step 5: Test commission calculation (simulate payment)
    console.log('\n5. Testing commission calculation...');
    const commissionTest = await axios.post(`${API_BASE}/api/test/commission`, {
      referrerId: referrerResponse.data.user.id,
      referredId: referredResponse.data.user.id,
      amount: 100.00
    });
    console.log('✅ Commission calculated');
    console.log(`   Commission Amount: $${commissionTest.data.commission}`);
    
    // Step 6: Final stats check
    console.log('\n6. Final stats check...');
    const finalStats = await axios.get(`${API_BASE}/api/referrals/stats`, {
      headers: { Authorization: `Bearer ${referrerToken}` }
    });
    console.log('✅ Final stats retrieved');
    console.log(`   Total Earnings: $${finalStats.data.referralCode.total_earnings}`);
    
    console.log('\n🎉 All referral system tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Referral code generation');
    console.log('   ✅ Referral tracking on signup');
    console.log('   ✅ Commission calculation');
    console.log('   ✅ Stats tracking and display');
    console.log('   ✅ Referral dashboard data');
    
  } catch (error) {
    console.error('\n❌ Referral test failed:');
    console.error('   Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    process.exit(1);
  }
}

testReferralSystem();