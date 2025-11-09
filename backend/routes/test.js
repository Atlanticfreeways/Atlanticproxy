const express = require('express');
const oxylabs = require('../services/oxylabs');
const usageTracker = require('../services/usage-tracker');
const commissionCalculator = require('../services/commission-calculator');
const router = express.Router();

// Test Oxylabs connection
router.get('/oxylabs', async (req, res) => {
  try {
    const result = await oxylabs.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test proxy creation
router.post('/proxy', async (req, res) => {
  try {
    const endpoint = await oxylabs.createEndpoint({
      type: 'residential',
      country: 'US'
    });
    res.json({ success: true, endpoint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test usage tracking
router.post('/usage/:userId/:endpointId', async (req, res) => {
  try {
    const { userId, endpointId } = req.params;
    const result = await usageTracker.simulateUsage(parseInt(userId), parseInt(endpointId));
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test commission calculation
router.post('/commission', async (req, res) => {
  try {
    const { referrerId, referredId, amount } = req.body;
    const commission = await commissionCalculator.recordCommission(
      parseInt(referrerId), 
      parseInt(referredId), 
      parseFloat(amount)
    );
    res.json({ success: true, commission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;