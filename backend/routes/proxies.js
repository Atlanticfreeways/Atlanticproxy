const express = require('express');
const { z } = require('zod');
const pool = require('../config/database');
const oxylabs = require('../services/oxylabs');
const usageTracker = require('../services/usage-tracker');
const Utils = require('../utils/helpers');
const router = express.Router();

// Validation schemas
const createProxySchema = z.object({
  type: z.enum(['residential', 'datacenter', 'mobile', 'isp']),
  country: z.string().length(2).optional(),
  city: z.string().optional()
});

// Create proxy endpoint
router.post('/', async (req, res) => {
  try {
    const { type, country, city } = createProxySchema.parse(req.body);
    const userId = req.user?.userId; // From auth middleware
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Create endpoint via Oxylabs
    const oxylabsEndpoint = await oxylabs.createEndpoint({
      type,
      country: country || 'US',
      city
    });
    
    // Save to database
    const result = await pool.query(
      'INSERT INTO proxy_endpoints (user_id, endpoint_url, proxy_type, country, city) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, oxylabsEndpoint.endpoint_url, type, country, city]
    );
    
    // Simulate initial usage for development
    if (process.env.NODE_ENV === 'development') {
      await usageTracker.simulateUsage(userId, result.rows[0].id);
    }
    
    res.status(201).json({
      message: 'Proxy endpoint created successfully',
      endpoint: result.rows[0]
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create proxy error:', error);
    res.status(500).json({ error: 'Failed to create proxy endpoint' });
  }
});

// Get user's proxy endpoints
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM proxy_endpoints WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ endpoints: result.rows });
    
  } catch (error) {
    console.error('Get proxies error:', error);
    res.status(500).json({ error: 'Failed to fetch proxy endpoints' });
  }
});

// Delete proxy endpoint
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check ownership
    const endpoint = await pool.query(
      'SELECT * FROM proxy_endpoints WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (endpoint.rows.length === 0) {
      return res.status(404).json({ error: 'Proxy endpoint not found' });
    }
    
    // Delete from database
    await pool.query('DELETE FROM proxy_endpoints WHERE id = $1', [id]);
    
    res.json({ message: 'Proxy endpoint deleted successfully' });
    
  } catch (error) {
    console.error('Delete proxy error:', error);
    res.status(500).json({ error: 'Failed to delete proxy endpoint' });
  }
});

module.exports = router;