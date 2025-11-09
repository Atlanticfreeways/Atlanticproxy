const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });
    
    this.client.on('error', (err) => console.error('Redis error:', err));
    this.client.connect();
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async flush() {
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  // Cache middleware
  middleware(ttl = 3600) {
    return async (req, res, next) => {
      const key = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
      const cached = await this.get(key);
      
      if (cached) {
        return res.json(cached);
      }

      const originalSend = res.json;
      res.json = (data) => {
        this.set(key, data, ttl);
        originalSend.call(res, data);
      };
      
      next();
    };
  }
}

module.exports = new CacheService();