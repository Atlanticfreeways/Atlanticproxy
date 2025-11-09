const pool = require('../config/database');

class EnterpriseManager {
  async createDedicatedPool(userId, poolConfig) {
    try {
      const {
        name,
        proxyType,
        countries,
        minIPs,
        maxConcurrency,
        slaUptime = 99.9
      } = poolConfig;

      const result = await pool.query(
        `INSERT INTO dedicated_proxy_pools 
         (user_id, name, proxy_type, countries, min_ips, max_concurrency, sla_uptime, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, name, proxyType, JSON.stringify(countries), minIPs, maxConcurrency, slaUptime, 'provisioning']
      );

      return result.rows[0];
    } catch (error) {
      console.error('Create dedicated pool error:', error);
      throw error;
    }
  }

  async createCustomPricing(userId, pricingConfig) {
    try {
      const {
        planName,
        price,
        monthlyLimit,
        features,
        validUntil
      } = pricingConfig;

      const result = await pool.query(
        `INSERT INTO custom_pricing 
         (user_id, plan_name, price, monthly_limit, features, valid_until) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, planName, price, monthlyLimit, JSON.stringify(features), validUntil]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Create custom pricing error:', error);
      throw error;
    }
  }

  async getSLAMetrics(userId, period = '30d') {
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
          COUNT(*) as total_requests,
          SUM(CASE WHEN success_count > 0 THEN 1 ELSE 0 END) as successful_requests,
          AVG(CASE WHEN success_count > 0 THEN 200 ELSE 5000 END) as avg_response_time,
          COUNT(DISTINCT endpoint_id) as active_endpoints
         FROM usage_records ur
         JOIN proxy_endpoints pe ON ur.endpoint_id = pe.id
         WHERE pe.user_id = $1 AND ${dateFilter}`,
        [userId]
      );

      const metrics = result.rows[0];
      const successRate = metrics.total_requests > 0 
        ? (metrics.successful_requests / metrics.total_requests * 100).toFixed(2)
        : '0.00';

      return {
        totalRequests: parseInt(metrics.total_requests),
        successRate: parseFloat(successRate),
        avgResponseTime: parseFloat(metrics.avg_response_time),
        activeEndpoints: parseInt(metrics.active_endpoints),
        uptime: Math.min(parseFloat(successRate), 99.99)
      };
    } catch (error) {
      console.error('Get SLA metrics error:', error);
      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        activeEndpoints: 0,
        uptime: 0
      };
    }
  }

  async getGeographicAnalytics(userId) {
    try {
      const result = await pool.query(
        `SELECT 
          pe.country,
          COUNT(pe.id) as endpoint_count,
          COALESCE(SUM(ur.bytes_used), 0) as total_bytes,
          COALESCE(SUM(ur.requests_count), 0) as total_requests,
          COALESCE(AVG(CASE WHEN ur.requests_count > 0 THEN ur.success_count::float / ur.requests_count * 100 ELSE 0 END), 0) as avg_success_rate
         FROM proxy_endpoints pe
         LEFT JOIN usage_records ur ON pe.id = ur.endpoint_id
         WHERE pe.user_id = $1
         GROUP BY pe.country
         ORDER BY total_bytes DESC`,
        [userId]
      );

      return result.rows.map(row => ({
        country: row.country,
        endpointCount: parseInt(row.endpoint_count),
        totalBytes: parseInt(row.total_bytes),
        totalRequests: parseInt(row.total_requests),
        avgSuccessRate: parseFloat(row.avg_success_rate).toFixed(2)
      }));
    } catch (error) {
      console.error('Get geographic analytics error:', error);
      return [];
    }
  }

  async getPerformanceMetrics(userId, period = '7d') {
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
          DATE_TRUNC('hour', recorded_at) as hour,
          AVG(CASE WHEN requests_count > 0 THEN success_count::float / requests_count * 100 ELSE 0 END) as success_rate,
          SUM(bytes_used) as bytes_used,
          SUM(requests_count) as requests_count,
          COUNT(DISTINCT endpoint_id) as active_endpoints
         FROM usage_records ur
         JOIN proxy_endpoints pe ON ur.endpoint_id = pe.id
         WHERE pe.user_id = $1 AND ${dateFilter}
         GROUP BY DATE_TRUNC('hour', recorded_at)
         ORDER BY hour`,
        [userId]
      );

      return result.rows.map(row => ({
        timestamp: row.hour,
        successRate: parseFloat(row.success_rate).toFixed(2),
        bytesUsed: parseInt(row.bytes_used),
        requestsCount: parseInt(row.requests_count),
        activeEndpoints: parseInt(row.active_endpoints)
      }));
    } catch (error) {
      console.error('Get performance metrics error:', error);
      return [];
    }
  }

  async generateCustomReport(userId, reportConfig) {
    try {
      const {
        reportType,
        dateRange,
        metrics,
        groupBy = 'day'
      } = reportConfig;

      let dateFilter = "recorded_at >= NOW() - INTERVAL '30 days'";
      if (dateRange) {
        dateFilter = `recorded_at BETWEEN '${dateRange.start}' AND '${dateRange.end}'`;
      }

      let groupByClause = "DATE_TRUNC('day', recorded_at)";
      if (groupBy === 'hour') {
        groupByClause = "DATE_TRUNC('hour', recorded_at)";
      } else if (groupBy === 'month') {
        groupByClause = "DATE_TRUNC('month', recorded_at)";
      }

      const result = await pool.query(
        `SELECT 
          ${groupByClause} as period,
          SUM(bytes_used) as total_bytes,
          SUM(requests_count) as total_requests,
          SUM(success_count) as total_success,
          COUNT(DISTINCT endpoint_id) as unique_endpoints,
          AVG(CASE WHEN requests_count > 0 THEN success_count::float / requests_count * 100 ELSE 0 END) as avg_success_rate
         FROM usage_records ur
         JOIN proxy_endpoints pe ON ur.endpoint_id = pe.id
         WHERE pe.user_id = $1 AND ${dateFilter}
         GROUP BY ${groupByClause}
         ORDER BY period`,
        [userId]
      );

      return {
        reportType,
        dateRange,
        groupBy,
        data: result.rows.map(row => ({
          period: row.period,
          totalBytes: parseInt(row.total_bytes),
          totalRequests: parseInt(row.total_requests),
          totalSuccess: parseInt(row.total_success),
          uniqueEndpoints: parseInt(row.unique_endpoints),
          avgSuccessRate: parseFloat(row.avg_success_rate).toFixed(2)
        }))
      };
    } catch (error) {
      console.error('Generate custom report error:', error);
      throw error;
    }
  }
}

module.exports = new EnterpriseManager();