const express = require('express');
const pool = require('../config/database');
const subscriptionManager = require('../services/subscription-manager');
const invoiceGenerator = require('../services/invoice-generator');
const router = express.Router();

// Get billing overview
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const subscription = await subscriptionManager.getUserSubscription(userId);
    const invoices = await invoiceGenerator.getUserInvoices(userId, 5);
    const usageCheck = await subscriptionManager.checkUsageLimit(userId);
    
    res.json({
      subscription,
      recentInvoices: invoices,
      currentUsage: {
        bytes: usageCheck.usage,
        limit: usageCheck.limit,
        percentage: usageCheck.percentage || 0,
        withinLimit: usageCheck.withinLimit
      }
    });
    
  } catch (error) {
    console.error('Get billing overview error:', error);
    res.status(500).json({ error: 'Failed to fetch billing information' });
  }
});

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = subscriptionManager.getPlans();
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Subscribe to a plan
router.post('/subscribe', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { planName } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const subscription = await subscriptionManager.createSubscription(userId, planName);
    const invoice = await invoiceGenerator.createInvoice(userId, subscription.id, subscription.price);
    
    res.status(201).json({
      message: 'Subscription created successfully',
      subscription,
      invoice
    });
    
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: error.message || 'Failed to create subscription' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const success = await subscriptionManager.cancelSubscription(userId);
    
    if (success) {
      res.json({ message: 'Subscription cancelled successfully' });
    } else {
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
    
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Mark invoice as paid (for testing)
router.post('/invoices/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify invoice belongs to user
    const invoiceResult = await pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const success = await invoiceGenerator.markInvoicePaid(id);
    
    if (success) {
      res.json({ message: 'Invoice marked as paid' });
    } else {
      res.status(500).json({ error: 'Failed to process payment' });
    }
    
  } catch (error) {
    console.error('Pay invoice error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;