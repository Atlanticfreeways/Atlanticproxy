# Render Manual Setup Instructions

## Backend Service Configuration

**Service Type**: Web Service
**Environment**: Go
**Root Directory**: `backend`
**Build Command**: `go build -o app ./cmd/server`
**Start Command**: `./app`

### Environment Variables:
- `PORT`: `10000`
- `DATABASE_URL`: postgresql://atlanticproxy_user:VP6P6NR6MjkCLtU1jvPIhxZxu5n0cju9@dpg-d4dsrcadbo4c73ful880-a/atlanticproxy
- `JWT_SECRET`: 302c79185a6ef52005a5ebc969902bb0
- `FRONTEND_URL`: `https://your-frontend-url.onrender.com`

## Frontend Service Configuration

**Service Type**: Web Service  
**Environment**: Node
**Root Directory**: `frontend`
**Build Command**: `npm install && npm run build`
**Start Command**: `npm start`

### Environment Variables:
- `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com`

## Database Configuration

**Type**: PostgreSQL
**Database Name**: `atlantic_proxy`
**Plan**: Free

## Manual Setup Steps:

1. Create PostgreSQL database first
2. Create backend service with above config
3. Create frontend service with above config
4. Update environment variables with actual URLs
5. Deploy both services

## Fixed Issues:
- ✅ Corrected Go version from 1.25.3 to 1.21
- ✅ Removed problematic render.yaml
- ✅ Simplified build commands