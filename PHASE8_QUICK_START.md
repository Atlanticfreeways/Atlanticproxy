# Phase 8: Deployment & DevOps - Quick Start

**Fast-track guide to get Phase 8 done in 6-8 hours**

---

## 🎯 WHAT YOU'LL BUILD

- ✅ Production Docker images for backend and frontend
- ✅ Docker Compose for local development
- ✅ GitHub Actions CI/CD pipeline
- ✅ Automated testing
- ✅ Automated deployment

---

## ⚡ QUICK TASKS (6-8 hours)

### 1️⃣ Backend Dockerfile (30 minutes)

**Create:** `backend/Dockerfile.prod`

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 5000
CMD ["./server"]
```

**Test:**
```bash
docker build -f backend/Dockerfile.prod -t atlantic-backend .
docker run -p 5000:5000 atlantic-backend
```

---

### 2️⃣ Frontend Dockerfile (30 minutes)

**Create:** `frontend/Dockerfile.prod`

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

**Test:**
```bash
docker build -f frontend/Dockerfile.prod -t atlantic-frontend .
docker run -p 3000:3000 atlantic-frontend
```

---

### 3️⃣ Docker Compose (1 hour)

**Create:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - PAYSTACK_SECRET=${PAYSTACK_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Test:**
```bash
# Create .env.prod with your values
docker-compose -f docker-compose.prod.yml up
# Visit http://localhost:3000
```

---

### 4️⃣ Environment Configuration (30 minutes)

**Create:** `.env.prod.example`

```bash
# Backend
DATABASE_URL=postgresql://user:password@postgres:5432/atlantic_proxy
JWT_SECRET=your-secret-key
PAYSTACK_SECRET=your-paystack-key
ENVIRONMENT=production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure-password
POSTGRES_DB=atlantic_proxy

# App
PORT=5000
NODE_ENV=production
```

**Setup:**
```bash
cp .env.prod.example .env.prod
# Edit .env.prod with your values
```

---

### 5️⃣ GitHub Actions - Test Pipeline (2 hours)

**Create:** `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-go@v4
      with:
        go-version: '1.21'
    - run: cd backend && go mod download
    - run: cd backend && go test -v -race ./...
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db?sslmode=disable

  frontend-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: cd frontend && npm ci
    - run: cd frontend && npm run build
```

---

### 6️⃣ GitHub Actions - Deploy Pipeline (2 hours)

**Create:** `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: docker/setup-buildx-action@v2
    - uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    - uses: docker/build-push-action@v4
      with:
        context: ./backend
        file: ./backend/Dockerfile.prod
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/atlantic-backend:latest
    - uses: docker/build-push-action@v4
      with:
        context: ./frontend
        file: ./frontend/Dockerfile.prod
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/atlantic-frontend:latest
```

---

## 🧪 TESTING

```bash
# Test 1: Build Docker images
docker build -f backend/Dockerfile.prod -t atlantic-backend .
docker build -f frontend/Dockerfile.prod -t atlantic-frontend .

# Test 2: Run with Docker Compose
docker-compose -f docker-compose.prod.yml up

# Test 3: Check services
curl http://localhost:5000/health
curl http://localhost:3000

# Test 4: Push to GitHub
git add .
git commit -m "Add Phase 8: Deployment & DevOps"
git push

# Test 5: Check GitHub Actions
# Go to GitHub → Actions tab
# Verify test pipeline runs
```

---

## ✅ CHECKLIST

- [ ] Backend Dockerfile created
- [ ] Frontend Dockerfile created
- [ ] Docker Compose created
- [ ] Environment file created
- [ ] Test pipeline created
- [ ] Deploy pipeline created
- [ ] Docker images build successfully
- [ ] Docker Compose runs all services
- [ ] GitHub Actions pipelines work
- [ ] All services healthy

---

## 🚀 NEXT STEPS

1. **Create all 6 files** (2-3 hours)
2. **Test locally** (1-2 hours)
3. **Push to GitHub** (30 minutes)
4. **Verify CI/CD** (1-2 hours)
5. **Done!** Phase 8 complete

---

## 📊 TIME BREAKDOWN

- Backend Docker: 30 min
- Frontend Docker: 30 min
- Docker Compose: 1 hour
- Environment: 30 min
- Test Pipeline: 2 hours
- Deploy Pipeline: 2 hours
- Testing: 1-2 hours

**Total: 6-8 hours**

---

## 🎯 SUCCESS

Phase 8 is complete when:
- ✅ All Docker files created
- ✅ Docker Compose works locally
- ✅ GitHub Actions pipelines run
- ✅ All tests pass
- ✅ Ready for Phase 9

---

## 📞 HELP

- Docker docs: https://docs.docker.com/
- GitHub Actions: https://docs.github.com/en/actions
- Docker Compose: https://docs.docker.com/compose/

---

**Phase 8: Deployment & DevOps**  
**Time: 6-8 hours**  
**Status: READY TO START**

🚀 **Let's containerize and automate!**
