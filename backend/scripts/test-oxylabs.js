require('dotenv').config();
const oxylabs = require('../services/oxylabs');

async function testOxylabsConnection() {
  console.log('🔄 Testing Oxylabs API connection...');
  console.log('API Key:', process.env.OXYLABS_API_KEY ? 'Set' : 'Missing');
  console.log('Network ID:', process.env.OXYLABS_NETWORK_ID || 'Missing');
  
  try {
    const result = await oxylabs.testConnection();
    
    if (result.success) {
      console.log('✅ Oxylabs API connection successful');
      console.log('Account info:', result.data);
    } else {
      console.log('❌ Oxylabs API connection failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOxylabsConnection();