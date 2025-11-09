const express = require('express');
const { z } = require('zod');
const pool = require('../config/database');
const enterpriseManager = require('../services/enterprise-manager');
const { requireRole, requirePermission } = require('../middleware/roles');
const router = express.Router();

// Require enterprise role or admin for all routes
router.use((req, res, next) => {
  const userRole = req.user?.role;
  if (!['admin', 'enterprise'].includes(userRole)) {
    // Allow resellers with high tier access
    if (userRole === 'reseller') {
      return pool.query('SELECT tier FROM reseller_profiles WHERE user_id = $1', [req.user.userId])
        .then(result => {
          if (result.rows[0]?.tier === 'platinum') {
            next();
          } else {
            res.status(403).json({ error: 'Enterprise features require platinum tier or higher' });
          }
        })
        .catch(() => res.status(403).json({ error: 'Access denied' }));
    } else {
      return res.status(403).json({ error: 'Enterprise features require enterprise role' });
    }
  }
  next();
});

// Get enterprise dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const [slaMetrics, geoAnalytics, performanceMetrics] = await Promise.all([
      enterpriseManager.getSLAMetrics(userId, '30d'),
      enterpriseManager.getGeographicAnalytics(userId),
      enterpriseManager.getPerformanceMetrics(userId, '7d')
    ]);
    
    // Get dedicated pools
    const poolsResult = await pool.query(
      'SELECT * FROM dedicated_proxy_pools WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    // Get active alerts
    const alertsResult = await pool.query(
      'SELECT * FROM performance_alerts WHERE user_id = $1 AND status = $2 ORDER BY triggered_at DESC LIMIT 10',
      [userId, 'active']
    );
    
    res.json({
      slaMetrics,
      geoAnalytics,
      performanceMetrics: performanceMetrics.slice(-24), // Last 24 hours
      dedicatedPools: poolsResult.rows,
      activeAlerts: alertsResult.rows
    });
    
  } catch (error) {
    console.error('Get enterprise dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch enterprise dashboard' });
  }
});

// Get SLA metrics
router.get('/sla-metrics', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { period = '30d' } = req.query;
    
    const metrics = await enterpriseManager.getSLAMetrics(userId, period);
    
    res.json({ metrics });
    
  } catch (error) {
    console.error('Get SLA metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch SLA metrics' });
  }
});

// Get performance metrics
router.get('/performance-metrics', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { period = '7d' } = req.query;
    
    const metrics = await enterpriseManager.getPerformanceMetrics(userId, period);
    
    res.json({ metrics });
    
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get geographic analytics
router.get('/geographic-analytics', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const analytics = await enterpriseManager.getGeographicAnalytics(userId);
    
    res.json({ analytics });
    
  } catch (error) {
    console.error('Get geographic analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch geographic analytics' });
  }
});

// Generate custom report
router.post('/reports/generate', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reportConfig = req.body;
    
    const report = await enterpriseManager.generateCustomReport(userId, reportConfig);
    
    res.json({ report });
    
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({ error: 'Failed to generate custom report' });
  }
});

// Request dedicated proxy pool
router.post('/dedicated-pools/request', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const poolConfig = req.body;
    
    const pool = await enterpriseManager.createDedicatedPool(userId, poolConfig);
    
    res.status(201).json({
      message: 'Dedicated proxy pool request submitted',
      pool
    });
    
  } catch (error) {
    console.error('Request dedicated pool error:', error);
    res.status(500).json({ error: 'Failed to request dedicated pool' });
  }
});

// Get custom integrations
router.get('/integrations', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const result = await pool.query(
      'SELECT * FROM custom_integrations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ integrations: result.rows });
    
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Create custom integration
router.post('/integrations', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { integrationType, name, configuration } = req.body;
    
    const result = await pool.query(
      'INSERT INTO custom_integrations (user_id, integration_type, name, configuration) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, integrationType, name, JSON.stringify(configuration)]
    );
    
    res.status(201).json({
      message: 'Custom integration created',
      integration: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

// Get performance alerts
router.get('/alerts', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { status = 'active', limit = 50 } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM performance_alerts WHERE user_id = $1 AND status = $2 ORDER BY triggered_at DESC LIMIT $3',
      [userId, status, parseInt(limit)]
    );
    
    res.json({ alerts: result.rows });
    
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Acknowledge alert
router.patch('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    await pool.query(
      'UPDATE performance_alerts SET status = $1 WHERE id = $2 AND user_id = $3',
      ['acknowledged', id, userId]
    );
    
    res.json({ message: 'Alert acknowledged' });
    
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

module.exports = router;