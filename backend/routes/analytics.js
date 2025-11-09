const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Get usage analytics
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { period = '7d' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    let dateFilter;
    switch (period) {
      case '24h':
        dateFilter = "recorded_at >= NOW() - INTERVAL '24 hours'";
        break;
      case '7d':
        dateFilter = "recorded_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "recorded_at >= NOW() - INTERVAL '30 days'";
        break;
      default:
        dateFilter = "recorded_at >= NOW() - INTERVAL '7 days'";
    }
    
    // Get usage over time
    const usageResult = await pool.query(
      `SELECT 
        DATE_TRUNC('day', recorded_at) as date,
        SUM(bytes_used) as bytes,
        SUM(requests_count) as requests,
        SUM(success_count) as success
       FROM usage_records 
       WHERE user_id = $1 AND ${dateFilter}
       GROUP BY DATE_TRUNC('day', recorded_at)
       ORDER BY date`,
      [userId]
    );
    
    // Get usage by proxy type
    const typeResult = await pool.query(
      `SELECT 
        pe.proxy_type,
        SUM(ur.bytes_used) as bytes,
        SUM(ur.requests_count) as requests
       FROM usage_records ur
       JOIN proxy_endpoints pe ON ur.endpoint_id = pe.id
       WHERE ur.user_id = $1 AND ${dateFilter}
       GROUP BY pe.proxy_type`,
      [userId]
    );
    
    res.json({
      usageOverTime: usageResult.rows,
      usageByType: typeResult.rows
    });
    
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;