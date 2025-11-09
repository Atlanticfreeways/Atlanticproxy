const pool = require('../config/database');

class SubscriptionManager {
  // Predefined subscription plans
  getPlans() {
    return {
      starter: {
        name: 'Starter',
        type: 'individual',
        price: 29.99,
        monthlyLimit: 5 * 1024 * 1024 * 1024, // 5GB
        features: ['5GB bandwidth', 'Residential proxies', 'Basic support']
      },
      growth: {
        name: 'Growth', 
        type: 'individual',
        price: 99.99,
        monthlyLimit: 25 * 1024 * 1024 * 1024, // 25GB
        features: ['25GB bandwidth', 'All proxy types', 'Priority support', 'Analytics']
      },
      professional: {
        name: 'Professional',
        type: 'reseller',
        price: 299.99,
        monthlyLimit: 100 * 1024 * 1024 * 1024, // 100GB
        features: ['100GB bandwidth', 'Reseller dashboard', 'API access', 'White-label options']
      },
      enterprise: {
        name: 'Enterprise',
        type: 'enterprise',
        price: 999.99,
        monthlyLimit: null, // Unlimited
        features: ['Unlimited bandwidth', 'Dedicated pools', 'SLA guarantee', 'Custom integrations']
      }
    };
  }

  async createSubscription(userId, planName, paymentMethodId = null) {
    try {
      const plans = this.getPlans();
      const plan = plans[planName];
      
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + 1);

      const result = await pool.query(
        `INSERT INTO subscriptions (user_id, plan_name, plan_type, monthly_limit, price, starts_at, ends_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, plan.name, plan.type, plan.monthlyLimit, plan.price, startsAt, endsAt]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  }

  async getUserSubscription(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
        [userId, 'active']
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  }

  async cancelSubscription(userId) {
    try {
      await pool.query(
        'UPDATE subscriptions SET status = $1 WHERE user_id = $2 AND status = $3',
        ['cancelled', userId, 'active']
      );

      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }

  async checkUsageLimit(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription || !subscription.monthly_limit) {
        return { withinLimit: true, usage: 0, limit: null };
      }

      // Get current month usage
      const usageResult = await pool.query(
        `SELECT COALESCE(SUM(bytes_used), 0) as total_bytes
         FROM usage_records 
         WHERE user_id = $1 AND recorded_at >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      );

      const currentUsage = parseInt(usageResult.rows[0].total_bytes);
      const withinLimit = currentUsage < subscription.monthly_limit;

      return {
        withinLimit,
        usage: currentUsage,
        limit: subscription.monthly_limit,
        percentage: Math.round((currentUsage / subscription.monthly_limit) * 100)
      };
    } catch (error) {
      console.error('Usage limit check error:', error);
      return { withinLimit: true, usage: 0, limit: null };
    }
  }
}

module.exports = new SubscriptionManager();