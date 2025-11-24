# Atlantic Proxy Frontend - Deployment Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

## Development Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run e2e tests
npm run test:e2e
```

## Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

```bash
# Build Docker image
docker build -t atlantic-proxy-frontend .

# Run container
docker run -p 3000:3000 atlantic-proxy-frontend
```

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)
- `REACT_APP_ENV` - Environment (development/production)
- `REACT_APP_LOG_LEVEL` - Logging level (debug/info/warn/error)

## Performance Optimization

- Code splitting enabled
- Lazy loading for routes
- Image optimization
- CSS minification
- Bundle analysis: `npm run analyze`

## Monitoring

- Error tracking via Sentry
- Performance monitoring via Datadog
- Real-time logs via CloudWatch

## Troubleshooting

### API Connection Issues
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration on backend
- Ensure authentication token is valid

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## Support

For issues, contact: support@atlanticproxy.com
