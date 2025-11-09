const { Pool } = require('pg');

class QueryOptimizer {
  constructor(pool) {
    this.pool = pool;
  }

  // Optimized user queries with indexes
  async getUserWithProxies(userId) {
    return this.pool.query(`
      SELECT u.*, 
             json_agg(
               json_build_object(
                 'id', p.id,
                 'name', p.name,
                 'status', p.status,
                 'created_at', p.created_at
               )
             ) FILTER (WHERE p.id IS NOT NULL) as proxies
      FROM users u
      LEFT JOIN proxies p ON u.id = p.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);
  }

  // Optimized analytics with aggregation
  async getUsageStats(userId, days = 30) {
    return this.pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as requests,
        SUM(bytes_transferred) as bytes,
        AVG(response_time) as avg_response_time
      FROM usage_logs 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [userId]);
  }

  // Batch insert for better performance
  async batchInsertUsage(records) {
    const values = records.map((_, i) => 
      `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
    ).join(',');
    
    const params = records.flatMap(r => [
      r.user_id, r.proxy_id, r.bytes_transferred, r.response_time, r.created_at
    ]);

    return this.pool.query(`
      INSERT INTO usage_logs (user_id, proxy_id, bytes_transferred, response_time, created_at)
      VALUES ${values}
    `, params);
  }

  // Create essential indexes
  async createIndexes() {
    const indexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proxies_user_id ON proxies(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referrals_code ON referrals(code)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id)'
    ];

    for (const index of indexes) {
      try {
        await this.pool.query(index);
      } catch (error) {
        console.error('Index creation error:', error.message);
      }
    }
  }
}

module.exports = QueryOptimizer;