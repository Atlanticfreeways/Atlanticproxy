# AtlanticProxy V1.0 Verification Guide

This guide will help you verify that the recent fixes and implementations are working correctly.

## 1. Start the Service
The core service requires root privileges to configure the network interface (TUN).

```bash
cd "/Users/machine/Library/CloudStorage/GoogleDrive-oghenesuvweomashone@gmail.com/My Drive/Github Projects/Atlanticproxy/scripts/proxy-client"
sudo go run ./cmd/service
```
**Success Criteria:**
- You see "Atlantic: macOS TUN interface configured successfully" in the logs.
- You see "AtlanticProxy service started successfully".
- No "failed to set netmask" errors.

## 2. Verify Proxy Rotation
While the service is running, open a new terminal window:

```bash
cd "/Users/machine/Library/CloudStorage/GoogleDrive-oghenesuvweomashone@gmail.com/My Drive/Github Projects/Atlanticproxy/scripts/proxy-client"
go run validate_rotation.go
```
**Success Criteria:**
- The script outputs "✅ Rotation SUCCESS: Multiple IPs detected".

## 3. Verify Authentication (New!)
Run the automated auth validation script:
```bash
cd "/Users/machine/Library/CloudStorage/GoogleDrive-oghenesuvweomashone@gmail.com/My Drive/Github Projects/Atlanticproxy/scripts/proxy-client"
# Ensure service is running (Step 1)
./validate_auth
```
**Success Criteria:**
- Script passes all 5 checks (Register, Login, GetMe, Logout, Invalid Token).
- Outputs: "🎉 All Auth Tests Passed!"

## 4. Verify Dashboard & Billing
1. Start the dashboard (if not running):
   ```bash
   cd ../../atlantic-dashboard
   npm run dev
   ```
2. Open http://localhost:3000/dashboard/billing.
3. Verify that the "Current Plan" section loads (it might say "Starter").
4. Try clicking "Upgrade" on a plan.
   - **Paystack:** Should redirect to a Paystack checkout URL.
   - **Crypto:** Should show a QR code and address.

## 5. Verify Quotas (Optional)
If you have a limited plan active:
1. Make requests through the proxy.
2. Check `http://localhost:3000/dashboard` -> Usage stats.
3. Verify the "Data Transferred" count increases.

## Troubleshooting
- **"bind: address already in use":** Kill valid process on port 8080/8082 (`lsof -i :8080`).
- **"failed to set netmask":** Ensure you ran with `sudo`.
