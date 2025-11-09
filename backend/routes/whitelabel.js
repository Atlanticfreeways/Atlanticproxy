const express = require('express');
const { z } = require('zod');
const pool = require('../config/database');
const { requireRole } = require('../middleware/roles');
const router = express.Router();

// Validation schema
const whitelabelSchema = z.object({
  domain: z.string().min(1).max(255).optional(),
  brandName: z.string().min(1).max(255),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  customCss: z.string().max(10000).optional(),
  emailTemplates: z.object({}).optional()
});

// Require reseller or admin role
router.use((req, res, next) => {
  const userRole = req.user?.role;
  if (!['admin', 'reseller'].includes(userRole)) {
    return res.status(403).json({ error: 'White-label features require reseller role or higher' });
  }
  next();
});

// Get white-label configuration
router.get('/config', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const result = await pool.query(
      'SELECT * FROM whitelabel_configs WHERE user_id = $1',
      [userId]
    );
    
    res.json({ 
      config: result.rows[0] || null,
      hasConfig: result.rows.length > 0
    });
    
  } catch (error) {
    console.error('Get white-label config error:', error);
    res.status(500).json({ error: 'Failed to fetch white-label configuration' });
  }
});

// Create or update white-label configuration
router.post('/config', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const configData = whitelabelSchema.parse(req.body);
    
    // Check if config exists
    const existingResult = await pool.query(
      'SELECT id FROM whitelabel_configs WHERE user_id = $1',
      [userId]
    );
    
    let result;
    if (existingResult.rows.length > 0) {
      // Update existing config
      result = await pool.query(
        `UPDATE whitelabel_configs 
         SET domain = $2, brand_name = $3, logo_url = $4, primary_color = $5, 
             secondary_color = $6, custom_css = $7, email_templates = $8, updated_at = NOW()
         WHERE user_id = $1 RETURNING *`,
        [
          userId, 
          configData.domain, 
          configData.brandName, 
          configData.logoUrl,
          configData.primaryColor, 
          configData.secondaryColor, 
          configData.customCss,
          JSON.stringify(configData.emailTemplates || {})
        ]
      );
    } else {
      // Create new config
      result = await pool.query(
        `INSERT INTO whitelabel_configs 
         (user_id, domain, brand_name, logo_url, primary_color, secondary_color, custom_css, email_templates)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          userId, 
          configData.domain, 
          configData.brandName, 
          configData.logoUrl,
          configData.primaryColor, 
          configData.secondaryColor, 
          configData.customCss,
          JSON.stringify(configData.emailTemplates || {})
        ]
      );
    }
    
    res.json({
      message: 'White-label configuration saved successfully',
      config: result.rows[0]
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Save white-label config error:', error);
    res.status(500).json({ error: 'Failed to save white-label configuration' });
  }
});

// Activate white-label configuration
router.post('/config/activate', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    // Check if user has reseller role with sufficient tier
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows[0]?.role === 'reseller') {
      const tierResult = await pool.query(
        'SELECT tier FROM reseller_profiles WHERE user_id = $1',
        [userId]
      );
      
      const tier = tierResult.rows[0]?.tier;
      if (!['gold', 'platinum'].includes(tier)) {
        return res.status(403).json({ 
          error: 'White-label activation requires Gold tier or higher' 
        });
      }
    }
    
    await pool.query(
      'UPDATE whitelabel_configs SET is_active = $1, updated_at = NOW() WHERE user_id = $2',
      [true, userId]
    );
    
    res.json({ message: 'White-label configuration activated successfully' });
    
  } catch (error) {
    console.error('Activate white-label config error:', error);
    res.status(500).json({ error: 'Failed to activate white-label configuration' });
  }
});

// Deactivate white-label configuration
router.post('/config/deactivate', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    await pool.query(
      'UPDATE whitelabel_configs SET is_active = $1, updated_at = NOW() WHERE user_id = $2',
      [false, userId]
    );
    
    res.json({ message: 'White-label configuration deactivated successfully' });
    
  } catch (error) {
    console.error('Deactivate white-label config error:', error);
    res.status(500).json({ error: 'Failed to deactivate white-label configuration' });
  }
});

// Get white-label preview
router.get('/preview', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const result = await pool.query(
      'SELECT * FROM whitelabel_configs WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No white-label configuration found' });
    }
    
    const config = result.rows[0];
    
    // Generate preview HTML/CSS
    const previewData = {
      brandName: config.brand_name,
      logoUrl: config.logo_url,
      primaryColor: config.primary_color || '#2563eb',
      secondaryColor: config.secondary_color || '#64748b',
      customCss: config.custom_css || '',
      domain: config.domain || 'your-domain.com'
    };
    
    res.json({ preview: previewData });
    
  } catch (error) {
    console.error('Get white-label preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// Admin routes for white-label management
router.get('/admin/configs', requireRole('admin'), async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let query = `
      SELECT wc.*, u.email, u.first_name, u.last_name, u.role
      FROM whitelabel_configs wc
      JOIN users u ON wc.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status === 'active') {
      query += ' AND wc.is_active = true';
    } else if (status === 'inactive') {
      query += ' AND wc.is_active = false';
    }
    
    params.push(parseInt(limit));
    query += ` ORDER BY wc.created_at DESC LIMIT $${params.length}`;
    
    const result = await pool.query(query, params);
    
    res.json({ configs: result.rows });
    
  } catch (error) {
    console.error('Get admin white-label configs error:', error);
    res.status(500).json({ error: 'Failed to fetch white-label configurations' });
  }
});

module.exports = router;