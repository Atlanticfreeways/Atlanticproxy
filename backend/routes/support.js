const express = require('express');
const { z } = require('zod');
const pool = require('../config/database');
const { requirePermission } = require('../middleware/roles');
const router = express.Router();

// Validation schemas
const createTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  message: z.string().min(1).max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

// Create support ticket
router.post('/tickets', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { subject, message, priority = 'medium' } = createTicketSchema.parse(req.body);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, message, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, subject, message, priority]
    );
    
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: result.rows[0]
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Get user's tickets
router.get('/tickets', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ tickets: result.rows });
    
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

// Get ticket by ID
router.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Users can only see their own tickets, admins can see all
    const query = userRole === 'admin' 
      ? 'SELECT st.*, u.email, u.first_name, u.last_name FROM support_tickets st JOIN users u ON st.user_id = u.id WHERE st.id = $1'
      : 'SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2';
    
    const params = userRole === 'admin' ? [id] : [id, userId];
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ ticket: result.rows[0] });
    
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Update ticket status (admin only)
router.patch('/tickets/:id/status', requirePermission('support:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await pool.query(
      'UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
    
    res.json({ message: 'Ticket status updated successfully' });
    
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Get all tickets (admin only)
router.get('/admin/tickets', requirePermission('support:read'), async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query;
    
    let query = `
      SELECT st.*, u.email, u.first_name, u.last_name, u.role
      FROM support_tickets st 
      JOIN users u ON st.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND st.status = $${params.length}`;
    }
    
    if (priority) {
      params.push(priority);
      query += ` AND st.priority = $${params.length}`;
    }
    
    params.push(parseInt(limit));
    query += ` ORDER BY st.created_at DESC LIMIT $${params.length}`;
    
    const result = await pool.query(query, params);
    
    res.json({ tickets: result.rows });
    
  } catch (error) {
    console.error('Get admin tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get support stats (admin only)
router.get('/admin/stats', requirePermission('support:read'), async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_tickets,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_tickets,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as tickets_today
      FROM support_tickets
    `;
    
    const result = await pool.query(statsQuery);
    
    res.json({ stats: result.rows[0] });
    
  } catch (error) {
    console.error('Get support stats error:', error);
    res.status(500).json({ error: 'Failed to fetch support statistics' });
  }
});

module.exports = router;