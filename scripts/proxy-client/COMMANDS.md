# AtlanticProxy Service Commands

## 🔧 Update and Restart Service

The service is currently crash-looping with the old binary. Run this to fix it:

```bash
cd /Users/machine/Project/GitHub/Atlanticproxy/proxy-client

# Run the update script (requires sudo password)
sudo ./update-service.sh
```

## 📊 Monitor Service

### View Logs
```bash
# Main log (should show successful startup after update)
tail -f /var/log/atlantic-proxy.log

# Error log (should stop showing iptables errors after update)
tail -f /var/log/atlantic-proxy.error.log

# Last 50 lines of error log
tail -50 /var/log/atlantic-proxy.error.log
```

### Check Service Status
```bash
# List running service
sudo launchctl list | grep atlanticproxy

# Check if process is running
ps aux | grep atlantic-proxy-client
```

## 🛠️ Manual Service Control

### Stop Service
```bash
sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.client.plist
```

### Start Service
```bash
sudo launchctl load /Library/LaunchDaemons/com.atlanticproxy.client.plist
```

### Restart Service
```bash
sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.client.plist
sudo launchctl load /Library/LaunchDaemons/com.atlanticproxy.client.plist
```

## 🧪 Test Manually (Without Service)

```bash
# Stop the service first
sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.client.plist

# Run manually to see output
sudo /usr/local/bin/atlantic-proxy-client
```

## ✅ Expected Output After Update

### Success Log Should Show:
```
Starting AtlanticProxy Client Service...
Initializing AtlanticProxy components...
Kill switch enabled (macOS mode - limited functionality)
AtlanticProxy service started successfully
```

### Error Log Should Be:
```
(empty or minimal errors)
```

## 🐛 If Still Having Issues

1. **Verify binary was updated:**
   ```bash
   ls -la /usr/local/bin/atlantic-proxy-client
   ```

2. **Check build was successful:**
   ```bash
   ls -la build/atlantic-proxy-client
   ```

3. **Rebuild if needed:**
   ```bash
   make build-local
   sudo ./update-service.sh
   ```

4. **View real-time logs:**
   ```bash
   # Terminal 1: Error log
   tail -f /var/log/atlantic-proxy.error.log
   
   # Terminal 2: Main log
   tail -f /var/log/atlantic-proxy.log
   ```