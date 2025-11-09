const express = require('express');
const { z } = require('zod');
const pool = require('../config/database');
const resellerManager = require('../services/reseller-manager');
const { requireRole, requirePermission } = require('../middleware/roles');
const router = express.Router();

// Validation schemas
const applicationSchema = z.object({
  companyName: z.string().min(1).max(255),
  website: z.string().url().optional(),
  businessType: z.string().min(1).max(100),
  expectedVolume: z.string().min(1).max(100),
  experience: z.string().max(2000).optional(),
  marketingPlan: z.string().max(2000).optional()
});

// Apply for reseller program
router.post('/apply', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const applicationData = applicationSchema.parse(req.body);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user already has an application
    const existingApp = await resellerManager.getResellerApplication(userId);
    if (existingApp && existingApp.status === 'pending') {
      return res.status(400).json({ error: 'Application already submitted and pending review' });
    }
    
    const application = await resellerManager.createResellerApplication(userId, applicationData);
    
    res.status(201).json({
      message: 'Reseller application submitted successfully',
      application
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Reseller application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get application status
router.get('/application', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const application = await resellerManager.getResellerApplication(userId);
    
    res.json({ application });
    
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Get reseller dashboard (reseller only)
router.get('/dashboard', requireRole('reseller'), async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const stats = await resellerManager.getResellerStats(userId);
    const customers = await resellerManager.getResellerCustomers(userId, 10);
    
    res.json({
      stats,
      recentCustomers: customers
    });
    
  } catch (error) {
    console.error('Get reseller dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch reseller dashboard' });
  }
});

// Get reseller customers (reseller only)
router.get('/customers', requireRole('reseller'), async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { limit = 50 } = req.query;
    
    const customers = await resellerManager.getResellerCustomers(userId, parseInt(limit));
    
    res.json({ customers });
    
  } catch (error) {
    console.error('Get reseller customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get marketing materials (reseller only)
router.get('/marketing-materials', requireRole('reseller'), async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM marketing_materials WHERE is_active = true';
    const params = [];
    
    if (type) {
      params.push(type);
      query += ` AND material_type = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ materials: result.rows });
    
  } catch (error) {
    console.error('Get marketing materials error:', error);
    res.status(500).json({ error: 'Failed to fetch marketing materials' });
  }
});

// Admin routes for reseller management
router.get('/admin/applications', requirePermission('users:read'), async (req, res) => {
  try {
    const { status = 'pending', limit = 50 } = req.query;
    
    const result = await pool.query(
      `SELECT ra.*, u.email, u.first_name, u.last_name 
       FROM reseller_applications ra
       JOIN users u ON ra.user_id = u.id
       WHERE ra.status = $1
       ORDER BY ra.created_at DESC
       LIMIT $2`,
      [status, parseInt(limit)]
    );
    
    res.json({ applications: result.rows });
    
  } catch (error) {
    console.error('Get admin applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Approve reseller application (admin only)
router.post('/admin/applications/:id/approve', requirePermission('users:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;
    
    await resellerManager.approveResellerApplication(parseInt(id), adminId);
    
    res.json({ message: 'Reseller application approved successfully' });
    
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve application' });
  }
});

// Reject reseller application (admin only)
router.post('/admin/applications/:id/reject', requirePermission('users:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await pool.query(
      'UPDATE reseller_applications SET status = $1, rejection_reason = $2 WHERE id = $3',
      ['rejected', reason, id]
    );
    
    res.json({ message: 'Reseller application rejected' });
    
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

module.exports = router;