const pool = require('../config/database');

class UsageTracker {
  async recordUsage(userId, endpointId, data = {}) {
    try {
      const {
        bytesUsed = 0,
        requestsCount = 1,
        successCount = 1
      } = data;

      await pool.query(
        `INSERT INTO usage_records (user_id, endpoint_id, bytes_used, requests_count, success_count) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, endpointId, bytesUsed, requestsCount, successCount]
      );

      return true;
    } catch (error) {
      console.error('Usage tracking error:', error);
      return false;
    }
  }

  async getUserUsage(userId, period = '30d') {
    try {
      let dateFilter;
      switch (period) {
        case '24h':
          dateFilter = "recorded_at >= NOW() - INTERVAL '24 hours'";
          break;
        case '7d':
          dateFilter = "recorded_at >= NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "recorded_at >= NOW() - INTERVAL '30 days'";
          break;
        default:
          dateFilter = "recorded_at >= NOW() - INTERVAL '30 days'";
      }

      const result = await pool.query(
        `SELECT 
          COALESCE(SUM(bytes_used), 0) as total_bytes,
          COALESCE(SUM(requests_count), 0) as total_requests,
          COALESCE(SUM(success_count), 0) as total_success
         FROM usage_records 
         WHERE user_id = $1 AND ${dateFilter}`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Get usage error:', error);
      return { total_bytes: 0, total_requests: 0, total_success: 0 };
    }
  }

  async getEndpointUsage(endpointId, period = '7d') {
    try {
      let dateFilter;
      switch (period) {
        case '24h':
          dateFilter = "recorded_at >= NOW() - INTERVAL '24 hours'";
          break;
        case '7d':
          dateFilter = "recorded_at >= NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "recorded_at >= NOW() - INTERVAL '30 days'";
          break;
        default:
          dateFilter = "recorded_at >= NOW() - INTERVAL '7 days'";
      }

      const result = await pool.query(
        `SELECT 
          COALESCE(SUM(bytes_used), 0) as total_bytes,
          COALESCE(SUM(requests_count), 0) as total_requests,
          COALESCE(SUM(success_count), 0) as total_success,
          COUNT(*) as total_records
         FROM usage_records 
         WHERE endpoint_id = $1 AND ${dateFilter}`,
        [endpointId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Get endpoint usage error:', error);
      return { total_bytes: 0, total_requests: 0, total_success: 0, total_records: 0 };
    }
  }

  // Simulate usage for development/testing
  async simulateUsage(userId, endpointId) {
    const mockUsage = {
      bytesUsed: Math.floor(Math.random() * 1000000), // Random bytes
      requestsCount: Math.floor(Math.random() * 100) + 1,
      successCount: Math.floor(Math.random() * 95) + 1 // High success rate
    };

    return this.recordUsage(userId, endpointId, mockUsage);
  }
}

module.exports = new UsageTracker();