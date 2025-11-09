require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testEnterpriseFeatures() {
  console.log('🔄 Testing enterprise features...\n');
  
  try {
    // Step 1: Create reseller user (enterprise features available to platinum resellers)
    console.log('1. Creating reseller user...');
    const resellerEmail = `enterprise-test-${Date.now()}@atlanticproxy.com`;
    const resellerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      firstName: 'Enterprise',
      lastName: 'User',
      email: resellerEmail,
      password: 'enterprise123'
    });
    
    const resellerToken = resellerResponse.data.token;
    
    // Upgrade to reseller and set platinum tier
    await axios.patch(`${API_BASE}/api/admin/users/${resellerResponse.data.user.id}/role`, {
      role: 'reseller'
    }, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ Enterprise user created');
    console.log(`   Email: ${resellerEmail}`);
    
    // Step 2: Create some proxy endpoints for analytics
    console.log('\n2. Creating proxy endpoints for analytics...');
    const proxyTypes = ['residential', 'datacenter', 'mobile'];
    const countries = ['US', 'UK', 'DE'];
    
    for (let i = 0; i < 3; i++) {
      await axios.post(`${API_BASE}/api/proxies`, {
        type: proxyTypes[i],
        country: countries[i]
      }, {
        headers: { Authorization: `Bearer ${resellerToken}` }
      });
    }
    
    console.log('✅ Proxy endpoints created for testing');
    
    // Step 3: Test enterprise dashboard
    console.log('\n3. Testing enterprise dashboard...');
    const dashboardResponse = await axios.get(`${API_BASE}/api/enterprise/dashboard`, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ Enterprise dashboard accessed');
    console.log(`   SLA Uptime: ${dashboardResponse.data.slaMetrics.uptime}%`);
    console.log(`   Success Rate: ${dashboardResponse.data.slaMetrics.successRate}%`);
    console.log(`   Geographic Regions: ${dashboardResponse.data.geoAnalytics.length}`);
    
    // Step 4: Test SLA metrics
    console.log('\n4. Testing SLA metrics...');
    const slaResponse = await axios.get(`${API_BASE}/api/enterprise/sla-metrics?period=7d`, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ SLA metrics retrieved');
    console.log(`   Total Requests: ${slaResponse.data.metrics.totalRequests}`);
    console.log(`   Active Endpoints: ${slaResponse.data.metrics.activeEndpoints}`);
    
    // Step 5: Test geographic analytics
    console.log('\n5. Testing geographic analytics...');
    const geoResponse = await axios.get(`${API_BASE}/api/enterprise/geographic-analytics`, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ Geographic analytics retrieved');
    console.log(`   Countries analyzed: ${geoResponse.data.analytics.length}`);
    
    // Step 6: Test custom report generation
    console.log('\n6. Testing custom report generation...');
    const reportResponse = await axios.post(`${API_BASE}/api/enterprise/reports/generate`, {
      reportType: 'usage_summary',
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      groupBy: 'day',
      metrics: ['bytes', 'requests', 'success_rate']
    }, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ Custom report generated');
    console.log(`   Report type: ${reportResponse.data.report.reportType}`);
    console.log(`   Data points: ${reportResponse.data.report.data.length}`);
    
    // Step 7: Test white-label configuration
    console.log('\n7. Testing white-label configuration...');
    const whitelabelConfig = {
      brandName: 'Custom Proxy Solutions',
      domain: 'customproxy.com',
      primaryColor: '#1e40af',
      secondaryColor: '#64748b',
      logoUrl: 'https://example.com/logo.png'
    };
    
    const whitelabelResponse = await axios.post(`${API_BASE}/api/whitelabel/config`, whitelabelConfig, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ White-label configuration saved');
    console.log(`   Brand: ${whitelabelResponse.data.config.brand_name}`);
    console.log(`   Domain: ${whitelabelResponse.data.config.domain}`);
    
    // Step 8: Test white-label preview
    console.log('\n8. Testing white-label preview...');
    const previewResponse = await axios.get(`${API_BASE}/api/whitelabel/preview`, {
      headers: { Authorization: `Bearer ${resellerToken}` }
    });
    
    console.log('✅ White-label preview generated');
    console.log(`   Preview brand: ${previewResponse.data.preview.brandName}`);
    console.log(`   Primary color: ${previewResponse.data.preview.primaryColor}`);
    
    console.log('\n🎉 All enterprise features tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Enterprise dashboard access');
    console.log('   ✅ SLA monitoring and metrics');
    console.log('   ✅ Advanced analytics (geographic, performance)');
    console.log('   ✅ Custom report generation');
    console.log('   ✅ White-label configuration');
    console.log('   ✅ Brand customization system');
    
  } catch (error) {
    console.error('\n❌ Enterprise features test failed:');
    console.error('   Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    process.exit(1);
  }
}

testEnterpriseFeatures();