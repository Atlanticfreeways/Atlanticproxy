const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/database');

describe('API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.end();
  });

  describe('Authentication', () => {
    test('should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Proxies', () => {
    test('should create proxy', async () => {
      const response = await request(app)
        .post('/api/proxies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Proxy',
          type: 'residential',
          location: 'US'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Proxy');
    });

    test('should get user proxies', async () => {
      const response = await request(app)
        .get('/api/proxies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      const requests = Array(6).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});