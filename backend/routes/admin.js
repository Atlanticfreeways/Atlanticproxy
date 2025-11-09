const express = require('express');
const pool = require('../config/database');
const { requireRole, upgradeToReseller } = require('../middleware/roles');
const router = express.Router();

// All admin routes require admin role
router.use(requireRole('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.company, u.role, 
             u.is_verified, u.created_at,
             COUNT(pe.id) as proxy_count,
             COALESCE(SUM(ur.bytes_used), 0) as total_usage
      FROM users u
      LEFT JOIN proxy_endpoints pe ON u.id = pe.user_id
      LEFT JOIN usage_records ur ON u.id = ur.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (role) {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }
    
    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;
    
    params.push(parseInt(limit), parseInt(offset));
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await pool.query(query, params);
    
    res.json({ users: result.rows });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const userResult = await pool.query(
      `SELECT u.*, 
              COUNT(pe.id) as proxy_count,
              COALESCE(SUM(ur.bytes_used), 0) as total_usage,
              s.plan_name, s.status as subscription_status
       FROM users u
       LEFT JOIN proxy_endpoints pe ON u.id = pe.user_id
       LEFT JOIN usage_records ur ON u.id = ur.user_id
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
       WHERE u.id = $1
       GROUP BY u.id, s.plan_name, s.status`,
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get referral stats
    const referralResult = await pool.query(
      'SELECT code, total_referrals, total_earnings FROM referral_codes WHERE user_id = $1',
      [id]
    );
    
    // Get recent activity
    const activityResult = await pool.query(
      'SELECT event_type, created_at FROM analytics_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );
    
    res.json({
      user: userResult.rows[0],
      referralCode: referralResult.rows[0] || null,
      recentActivity: activityResult.rows
    });
    
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'reseller', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    
    res.json({ message: 'User role updated successfully' });
    
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get system stats
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as regular_users,
        (SELECT COUNT(*) FROM users WHERE role = 'reseller') as resellers,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month,
        (SELECT COUNT(*) FROM proxy_endpoints) as total_proxies,
        (SELECT COUNT(*) FROM proxy_endpoints WHERE status = 'active') as active_proxies,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
        (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'paid' AND paid_at >= NOW() - INTERVAL '30 days') as revenue_month,
        (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')) as open_tickets
    `;
    
    const result = await pool.query(statsQuery);
    
    res.json({ stats: result.rows[0] });
    
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

// Suspend user
router.post('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Deactivate user's proxies
    await pool.query('UPDATE proxy_endpoints SET status = $1 WHERE user_id = $2', ['suspended', id]);
    
    // Cancel active subscriptions
    await pool.query('UPDATE subscriptions SET status = $1 WHERE user_id = $2 AND status = $3', ['suspended', id, 'active']);
    
    // Log the action
    await pool.query(
      'INSERT INTO analytics_events (user_id, event_type, event_data) VALUES ($1, $2, $3)',
      [id, 'user_suspended', { reason, suspended_by: req.user.userId }]
    );
    
    res.json({ message: 'User suspended successfully' });
    
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

module.exports = router;