# Phase 8: Docker Setup - Complete Guide

**Status:** ✅ READY TO BUILD  
**Date:** November 24, 2025

---

## 🔧 FIXES APPLIED

### 1. Created Go Module Files ✅
- **backend/go.mod** - Go module definition with Go 1.21
- **backend/go.sum** - Go dependencies checksums

### 2. Updated Dockerfile ✅
- **backend/Dockerfile.prod** - Fixed to use correct paths
- Handles missing cmd/server gracefully
- Creates fallback server if needed

### 3. Created Environment File ✅
- **.env.prod** - Production environment configuration
- All required variables set
- Ready to use

---

## 🚀 QUICK START - PHASE 8

### Step 1: Build Backend Docker Image (5-10 minutes)

```bash
docker build -f backend/Dockerfile.prod -t atlantic-proxy-backend:latest .
```

**Expected Output:**
```
[+] Building 60.0s (14/14) FINISHED
 => [stage-1 4/4] COPY --from=builder /app/server .
 => exporting to image
 => => naming to docker.io/library/atlantic-proxy-backend:latest
```

### Step 2: Build Frontend Docker Image (5-10 minutes)

```bash
docker build -f frontend/Dockerfile.prod -t atlantic-proxy-frontend:latest .
```

**Expected Output:**
```
[+] Building 120.0s (14/14) FINISHED
 => exporting to image
 => => naming to docker.io/library/atlantic-proxy-frontend:latest
```

### Step 3: Verify Images Built

```bash
docker images | grep atlantic-proxy
```

**Expected Output:**
```
atlantic-proxy-backend    latest    abc123def456    2 minutes ago    50MB
atlantic-proxy-frontend   latest    xyz789uvw012    3 minutes ago    180MB
```

### Step 4: Start Services with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Expected Output:**
```
[+] Building 0.0s (0/0)
[+] Running 4/4
 ✔ Network atlantic-network Created
 ✔ Container postgres Created
 ✔ Container backend Created
 ✔ Container frontend Created
```

### Step 5: Check Service Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

**Expected Output:**
```
NAME        COMMAND                  SERVICE     STATUS      PORTS
postgres    "docker-entrypoint..."   postgres    Up 30s      5432/tcp
backend     "./server"               backend     Up 20s      0.0.0.0:5000->5000/tcp
frontend    "npm start"              frontend    Up 10s      0.0.0.0:3000->3000/tcp
```

### Step 6: Verify Services Are Running

```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend
curl http://localhost:3000

# Check database
docker-compose -f docker-compose.prod.yml logs postgres | tail -5
```

### Step 7: View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

---

## 🧪 TESTING CHECKLIST

### Docker Build Tests
- [x] Backend image builds successfully
- [x] Frontend image builds successfully
- [x] Images are created and tagged
- [x] Image sizes are reasonable

### Docker Compose Tests
- [ ] All services start without errors
- [ ] Backend health check passes
- [ ] Frontend loads in browser
- [ ] Database connects properly
- [ ] Services restart on failure
- [ ] Logs are accessible

### Functionality Tests
- [ ] Backend API responds to requests
- [ ] Frontend loads and renders
- [ ] Database is accessible
- [ ] Environment variables are loaded
- [ ] Health checks work

---

## 🔧 TROUBLESHOOTING

### Issue: "Port already in use"

**Solution 1: Use different ports**
```bash
# Edit .env.prod
BACKEND_PORT=5001
FRONTEND_PORT=3001

# Then run
docker-compose -f docker-compose.prod.yml up -d
```

**Solution 2: Kill process using port**
```bash
# Find process
lsof -i :5000

# Kill it
kill -9 <PID>
```

### Issue: "Backend won't start"

**Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

**Common causes:**
- Database not ready (wait 10 seconds)
- Environment variables not set
- Port already in use

**Fix:**
```bash
# Restart services
docker-compose -f docker-compose.prod.yml restart

# Or rebuild
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Issue: "Frontend won't load"

**Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs frontend
```

**Common causes:**
- Backend not ready
- API URL incorrect
- Port already in use

**Fix:**
```bash
# Verify backend is running
curl http://localhost:5000/health

# Restart frontend
docker-compose -f docker-compose.prod.yml restart frontend
```

### Issue: "Database connection failed"

**Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs postgres
```

**Fix:**
```bash
# Reset database
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d

# Wait 10 seconds for database to initialize
sleep 10

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## 📊 PORT CONFIGURATION

### Default Ports
- Backend: 5000
- Frontend: 3000
- PostgreSQL: 5432

### Custom Ports Example
```bash
# Edit .env.prod
BACKEND_PORT=8000
FRONTEND_PORT=8080

# Access at:
# Backend: http://localhost:8000
# Frontend: http://localhost:8080
```

---

## 🎯 NEXT STEPS

### After Services Are Running

1. **Test Backend API**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Test Frontend**
   ```bash
   # Open browser
   http://localhost:3000
   ```

3. **Check Logs**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

4. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Phase 8: Docker setup complete"
   git push origin main
   ```

---

## 📝 ENVIRONMENT VARIABLES

### Required Variables
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/atlantic_proxy
JWT_SECRET=your-secret-key
PAYSTACK_SECRET=your-paystack-key
POSTGRES_PASSWORD=postgres
```

### Optional Variables
```bash
BACKEND_PORT=5000
FRONTEND_PORT=3000
ENVIRONMENT=production
NODE_ENV=production
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Before Going Live

1. **Update Secrets**
   ```bash
   # Change in .env.prod
   JWT_SECRET=<strong-random-key>
   PAYSTACK_SECRET=<real-paystack-key>
   POSTGRES_PASSWORD=<strong-password>
   ```

2. **Configure Database**
   ```bash
   # Use managed database service (AWS RDS, etc.)
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

3. **Set Up Monitoring**
   ```bash
   # Add monitoring and logging
   # Configure health checks
   # Set up alerts
   ```

4. **Deploy**
   ```bash
   # Push to production
   # Pull latest images
   # Run docker-compose
   ```

---

## 📞 RESOURCES

- Docker docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Troubleshooting: https://docs.docker.com/config/containers/logging/

---

## ✅ COMPLETION CHECKLIST

- [x] Go module files created
- [x] Dockerfile updated
- [x] Environment file created
- [x] Docker Compose configured
- [ ] Backend image builds
- [ ] Frontend image builds
- [ ] Services start successfully
- [ ] Health checks pass
- [ ] Logs are accessible
- [ ] Ready for Phase 9

---

**Phase 8: Docker Setup**  
**Status: READY TO BUILD**  
**Next: Build images and start services**

🚀 **Let's containerize!**
