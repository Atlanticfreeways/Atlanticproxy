#!/bin/bash

set -e

echo "🚀 Starting Atlantic Proxy deployment..."

# Load environment variables
if [ -f .env.prod ]; then
    export $(cat .env.prod | xargs)
fi

# Build and push images
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "🔄 Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Health check
echo "🏥 Performing health check..."
sleep 10
curl -f http://localhost/api/health || exit 1

# SSL certificate renewal (if using Let's Encrypt)
if [ "$SSL_PROVIDER" = "letsencrypt" ]; then
    echo "🔒 Renewing SSL certificates..."
    docker run --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot renew
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at https://$DOMAIN"