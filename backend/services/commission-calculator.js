const pool = require('../config/database');

class CommissionCalculator {
  // Calculate commission based on user's subscription payment
  async calculateCommission(referrerId, amount, type = 'subscription') {
    try {
      // Get referrer's commission rate
      const rateResult = await pool.query(
        'SELECT commission_rate FROM referral_codes WHERE user_id = $1',
        [referrerId]
      );
      
      if (rateResult.rows.length === 0) return 0;
      
      const commissionRate = rateResult.rows[0].commission_rate;
      const commission = Math.round(amount * (commissionRate / 100) * 100) / 100;
      
      return commission;
    } catch (error) {
      console.error('Commission calculation error:', error);
      return 0;
    }
  }

  // Record commission earning
  async recordCommission(referrerId, referredId, amount, type = 'subscription') {
    try {
      const commission = await this.calculateCommission(referrerId, amount, type);
      
      if (commission <= 0) return false;
      
      // Update referral record with commission
      await pool.query(
        `UPDATE referrals 
         SET commission_earned = commission_earned + $1, status = 'confirmed'
         WHERE referrer_id = $2 AND referred_id = $3`,
        [commission, referrerId, referredId]
      );
      
      // Update referral code total earnings
      await pool.query(
        'UPDATE referral_codes SET total_earnings = total_earnings + $1 WHERE user_id = $2',
        [commission, referrerId]
      );
      
      return commission;
    } catch (error) {
      console.error('Commission recording error:', error);
      return false;
    }
  }

  // Get commission tiers based on referral count
  getCommissionTier(referralCount) {
    if (referralCount >= 16) return { tier: 'Gold', rate: 25 };
    if (referralCount >= 6) return { tier: 'Silver', rate: 20 };
    return { tier: 'Bronze', rate: 15 };
  }

  // Update user's commission rate based on referral count
  async updateCommissionRate(userId) {
    try {
      const countResult = await pool.query(
        'SELECT total_referrals FROM referral_codes WHERE user_id = $1',
        [userId]
      );
      
      if (countResult.rows.length === 0) return false;
      
      const referralCount = countResult.rows[0].total_referrals;
      const { rate } = this.getCommissionTier(referralCount);
      
      await pool.query(
        'UPDATE referral_codes SET commission_rate = $1 WHERE user_id = $2',
        [rate, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Commission rate update error:', error);
      return false;
    }
  }
}

module.exports = new CommissionCalculator();