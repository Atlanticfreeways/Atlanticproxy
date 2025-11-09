const express = require('express');
const pool = require('../config/database');
const Utils = require('../utils/helpers');
const router = express.Router();

// Track referral signup
const trackReferralSignup = async (referralCode, newUserId) => {
  try {
    const codeResult = await pool.query(
      'SELECT id, user_id, commission_rate FROM referral_codes WHERE code = $1 AND is_active = true',
      [referralCode]
    );
    
    if (codeResult.rows.length === 0) return false;
    
    const { id: codeId, user_id: referrerId, commission_rate } = codeResult.rows[0];
    
    // Create referral record
    await pool.query(
      'INSERT INTO referrals (referrer_id, referred_id, referral_code_id, commission_earned) VALUES ($1, $2, $3, $4)',
      [referrerId, newUserId, codeId, 0] // Commission will be calculated later
    );
    
    // Update referral code stats
    await pool.query(
      'UPDATE referral_codes SET total_referrals = total_referrals + 1 WHERE id = $1',
      [codeId]
    );
    
    return true;
  } catch (error) {
    console.error('Referral tracking error:', error);
    return false;
  }
};

// Get referral stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await pool.query(
      'SELECT code, commission_rate, total_referrals, total_earnings FROM referral_codes WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Referral code not found' });
    }
    
    const referralCode = result.rows[0];
    
    // Get recent referrals
    const referralsResult = await pool.query(
      `SELECT r.*, u.email as referred_email, u.first_name, u.last_name 
       FROM referrals r 
       JOIN users u ON r.referred_id = u.id 
       WHERE r.referrer_id = $1 
       ORDER BY r.created_at DESC 
       LIMIT 10`,
      [userId]
    );
    
    res.json({
      referralCode: referralCode,
      recentReferrals: referralsResult.rows
    });
    
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ error: 'Failed to fetch referral statistics' });
  }
});

// Generate new referral code
router.post('/generate-code', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const newCode = Utils.generateReferralCode(userId);
    
    // Update existing code or create new one
    const result = await pool.query(
      `INSERT INTO referral_codes (user_id, code) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET code = $2, created_at = NOW() 
       RETURNING *`,
      [userId, newCode]
    );
    
    res.json({
      message: 'Referral code generated successfully',
      referralCode: result.rows[0]
    });
    
  } catch (error) {
    console.error('Generate referral code error:', error);
    res.status(500).json({ error: 'Failed to generate referral code' });
  }
});

module.exports = { router, trackReferralSignup };