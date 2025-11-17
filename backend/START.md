# Start AtlanticProxy Backend

## ✅ Setup Complete!

Database created and schema loaded successfully.

## 🚀 Run the Server

```bash
cd /Users/machine/Project/GitHub/Atlanticproxy/backend-go

# Start server
go run cmd/server/main.go
```

Server will start on `http://localhost:5000`

## 🧪 Test the API

Open a new terminal and test:

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 Configuration

Edit `.env` to add your Oxylabs credentials:

```bash
nano .env
```

Update these lines:
```
OXYLABS_USERNAME=your_actual_username
OXYLABS_PASSWORD=your_actual_password
```

## 🎯 What's Working

- ✅ Database connected
- ✅ User registration
- ✅ User login (JWT)
- ✅ Proxy connection management
- ✅ CORS enabled for frontend

## 🔗 Integration

The backend is ready to integrate with:
1. **Frontend** (Next.js on port 3000)
2. **Proxy Client** (Go service running on user machines)

**Backend is ready to serve!** 🚀