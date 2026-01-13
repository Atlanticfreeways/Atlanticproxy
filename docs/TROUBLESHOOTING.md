# Troubleshooting Guide

This guide covers common issues encountered when running or developing AtlanticProxy.

## Service Startup Issues

### `address already in use`
**Error:** `listen tcp :8082: bind: address already in use`
**Cause:** Another process is using the port, or the service is already running.
**Solution:**
1. Check what's using the port:
   ```bash
   lsof -i :8082
   ```
2. Kill the process:
   ```bash
   kill -9 <PID>
   ```
3. Or change `SERVER_PORT` in `.env`.

### `resource busy` (TUN Interface)
**Error:** `failed to create TUN device: resource busy`
**Cause:** The OS hasn't released the TUN device from a previous run.
**Solution:**
1. Restart the service - retry logic should handle it.
2. Manually destroy the interface (macOS):
   ```bash
   sudo ifconfig utun9 down
   sudo ifconfig utun9 destroy
   ```

### DNS Resolution Failures
**Error:** `dial tcp: lookup pr.oxylabs.io: no such host`
**Cause:** DNS blocking (firewall/ISP) or network connectivity.
**Solution:**
1. Check internet connection.
2. Try manual lookup: `nslookup pr.oxylabs.io`
3. Service automatically falls back to 8.8.8.8 and 1.1.1.1.

---

## Proxy & Connectivity Issues

### Proxy Authentication Failed
**Symptoms:** 407 Proxy Authentication Required errors.
**Cause:** Incorrect Oxylabs credentials or expired session.
**Solution:**
1. Verify `OXYLABS_USERNAME` and `OXYLABS_PASSWORD`.
2. Ensure you are using **Residential Proxies** credentials (not Realtime Crawler).
3. Check Oxylabs dashboard for IP blocks.

### Slow Connection / Timeouts
**Cause:** High latency exit node or overloaded proxy session.
**Solution:**
1. Force a new session via API: `POST /api/rotation/session/new`
2. Switch geo-location to a closer region.
3. Check system CPU/Memory usage.

---

## Billing & Payment Issues

### "Subscription not activating"
**Cause:** Webhook failure or signature mismatch.
**Solution:**
1. Check service logs for `[WEBHOOK]` entries.
2. Verify `PAYSTACK_SECRET_KEY` matches Paystack dashboard.
3. Ensure localhost is exposed (ngrok) for local dev webhooks.

### "Too Many Requests" (429)
**Cause:** User has exceeded plan quota.
**Solution:**
1. Check usage: `GET /api/billing/usage`
2. Upgrade plan or wait for monthly reset.
3. (Admin) Reset quota in database:
   ```sql
   UPDATE usage_tracking SET data_transferred_bytes = 0 WHERE user_id = '...';
   ```

---

## Database Issues

### "database is locked"
**Cause:** Multiple processes accessing SQLite file.
**Solution:**
1. Ensure only one service instance is running.
2. Check file permissions on `atlantic.db`.
3. Stop any manual SQL clients keeping the db open.

### Data Persistence
**Issue:** Data lost after restart.
**Cause:** `DATABASE_PATH` pointing to recurring temp directory or incorrect docker volume.
**Solution:**
Use persistent path: `DATABASE_PATH=~/.atlanticproxy/data.db`

---

## Debugging Tools

### Enable Debug Logs
Set `LOG_LEVEL=debug` in `.env` to see detailed request flows and proxy headers.

### Trace Requests
Every request has `X-Request-ID`. grep logs for this ID to see full lifecycle.

### Check Open Files
Mac/Linux have file descriptor limits.
```bash
ulimit -n
# Recommended: 65535
```
