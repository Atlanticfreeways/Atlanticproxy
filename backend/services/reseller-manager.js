const pool = require('../config/database');

class ResellerManager {
  async createResellerApplication(userId, applicationData) {
    try {
      const {
        companyName,
        website,
        businessType,
        expectedVolume,
        experience,
        marketingPlan
      } = applicationData;

      const result = await pool.query(
        `INSERT INTO reseller_applications 
         (user_id, company_name, website, business_type, expected_volume, experience, marketing_plan, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, companyName, website, businessType, expectedVolume, experience, marketingPlan, 'pending']
      );

      return result.rows[0];
    } catch (error) {
      console.error('Create reseller application error:', error);
      throw error;
    }
  }

  async getResellerApplication(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM reseller_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get reseller application error:', error);
      return null;
    }
  }

  async approveResellerApplication(applicationId, adminId) {
    try {
      // Get application details
      const appResult = await pool.query(
        'SELECT user_id FROM reseller_applications WHERE id = $1',
        [applicationId]
      );

      if (appResult.rows.length === 0) {
        throw new Error('Application not found');
      }

      const userId = appResult.rows[0].user_id;

      // Update application status
      await pool.query(
        'UPDATE reseller_applications SET status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3',
        ['approved', adminId, applicationId]
      );

      // Upgrade user to reseller
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['reseller', userId]);

      // Create reseller profile
      await pool.query(
        `INSERT INTO reseller_profiles (user_id, commission_rate, tier, status) 
         VALUES ($1, $2, $3, $4)`,
        [userId, 30.0, 'bronze', 'active']
      );

      return true;
    } catch (error) {
      console.error('Approve reseller application error:', error);
      throw error;
    }
  }

  async getResellerStats(userId) {
    try {
      // Get reseller profile
      const profileResult = await pool.query(
        'SELECT * FROM reseller_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        return null;
      }

      const profile = profileResult.rows[0];

      // Get customer count
      const customerResult = await pool.query(
        'SELECT COUNT(*) as customer_count FROM referrals WHERE referrer_id = $1',
        [userId]
      );

      // Get monthly sales
      const salesResult = await pool.query(
        `SELECT 
          COALESCE(SUM(commission_earned), 0) as total_commissions,
          COUNT(*) as total_sales
         FROM referrals 
         WHERE referrer_id = $1 AND created_at >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      );

      return {
        profile,
        customerCount: parseInt(customerResult.rows[0].customer_count),
        monthlyCommissions: parseFloat(salesResult.rows[0].total_commissions),
        monthlySales: parseInt(salesResult.rows[0].total_sales)
      };
    } catch (error) {
      console.error('Get reseller stats error:', error);
      return null;
    }
  }

  async getResellerCustomers(userId, limit = 50) {
    try {
      const result = await pool.query(
        `SELECT 
          u.id, u.email, u.first_name, u.last_name, u.company,
          r.commission_earned, r.status as referral_status, r.created_at as referred_at,
          s.plan_name, s.status as subscription_status
         FROM referrals r
         JOIN users u ON r.referred_id = u.id
         LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
         WHERE r.referrer_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get reseller customers error:', error);
      return [];
    }
  }

  async updateResellerTier(userId) {
    try {
      const customerResult = await pool.query(
        'SELECT COUNT(*) as customer_count FROM referrals WHERE referrer_id = $1',
        [userId]
      );

      const customerCount = parseInt(customerResult.rows[0].customer_count);
      let tier = 'bronze';
      let commissionRate = 30.0;

      if (customerCount >= 50) {
        tier = 'platinum';
        commissionRate = 40.0;
      } else if (customerCount >= 20) {
        tier = 'gold';
        commissionRate = 35.0;
      } else if (customerCount >= 10) {
        tier = 'silver';
        commissionRate = 32.5;
      }

      await pool.query(
        'UPDATE reseller_profiles SET tier = $1, commission_rate = $2 WHERE user_id = $3',
        [tier, commissionRate, userId]
      );

      return { tier, commissionRate };
    } catch (error) {
      console.error('Update reseller tier error:', error);
      return null;
    }
  }
}

module.exports = new ResellerManager();