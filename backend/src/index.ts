import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'mock-token', user: { id: '1', email: 'user@example.com' } });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ token: 'mock-token', user: { id: '1', email: req.body.email } });
});

// Proxy routes
app.get('/api/proxies', (req, res) => {
  res.json([
    { id: '1', name: 'US-NY', type: 'residential', country: 'US', status: 'active' }
  ]);
});

app.post('/api/proxies', (req, res) => {
  res.status(201).json({ id: '2', ...req.body });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
