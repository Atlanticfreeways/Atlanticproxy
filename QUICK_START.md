# Quick Start - Local Testing

## 🚀 Start Everything

```bash
./start.sh
```

This will start:
- Backend on http://localhost:8082
- Frontend on http://localhost:3000

## 🧪 Test Flow

### 1. Health Check
```bash
curl http://localhost:8082/health
```

### 2. Visit Dashboard
Open: http://localhost:3000/dashboard

### 3. Test Payment Flow
1. Go to: http://localhost:3000/trial
2. Enter email: test@example.com
3. Click "Continue to Payment"
4. Use test card: **4084084084084081**
5. CVV: **408**, PIN: **0000**

### 4. Test All Pages
- Overview: http://localhost:3000/dashboard
- Locations: http://localhost:3000/dashboard/locations
- Protocol: http://localhost:3000/dashboard/protocol
- API: http://localhost:3000/dashboard/api
- Statistics: http://localhost:3000/dashboard/statistics
- Servers: http://localhost:3000/dashboard/servers
- Security: http://localhost:3000/dashboard/security
- Settings: http://localhost:3000/dashboard/settings
- Billing: http://localhost:3000/dashboard/billing
- Usage: http://localhost:3000/dashboard/usage
- Activity: http://localhost:3000/dashboard/activity

## 🛑 Stop Services

Press `Ctrl+C` in the terminal running `./start.sh`

## 📝 Notes

- Backend logs will show in terminal
- Frontend will auto-reload on changes
- Check `.env` file for configuration
- Payment uses Paystack test mode

## ⚠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8082
lsof -ti:8082 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Backend Won't Start
- Check `.env` file exists
- Verify Go is installed: `go version`
- Check logs for errors

### Frontend Won't Start
- Run `npm install` in atlantic-dashboard
- Verify Node.js: `node --version`
- Check for port conflicts

## ✅ Success Indicators

- Backend: `✅ Backend running on http://localhost:8082`
- Frontend: `✅ All services started successfully!`
- Health: `curl http://localhost:8082/health` returns `{"status":"ok"}`
