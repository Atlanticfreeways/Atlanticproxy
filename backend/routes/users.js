const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, company, phone, role, is_verified, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Get referral code
    const referralResult = await pool.query(
      'SELECT code, commission_rate, total_referrals, total_earnings FROM referral_codes WHERE user_id = $1',
      [userId]
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        phone: user.phone,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      referralCode: referralResult.rows[0] || null
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get active proxies count
    const proxiesResult = await pool.query(
      'SELECT COUNT(*) as count FROM proxy_endpoints WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );
    
    // Get usage stats for current month
    const usageResult = await pool.query(
      `SELECT 
        COALESCE(SUM(bytes_used), 0) as total_bytes,
        COALESCE(SUM(requests_count), 0) as total_requests,
        COALESCE(SUM(success_count), 0) as total_success
       FROM usage_records 
       WHERE user_id = $1 AND recorded_at >= date_trunc('month', CURRENT_DATE)`,
      [userId]
    );
    
    const usage = usageResult.rows[0];
    const successRate = usage.total_requests > 0 
      ? ((usage.total_success / usage.total_requests) * 100).toFixed(1)
      : '0.0';
    
    res.json({
      activeProxies: parseInt(proxiesResult.rows[0].count),
      bandwidthUsed: `${(usage.total_bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`,
      successRate: `${successRate}%`,
      avgResponse: '187ms', // Mock data for now
      currentPlan: 'Growth',
      requestsToday: usage.total_requests.toLocaleString()
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;