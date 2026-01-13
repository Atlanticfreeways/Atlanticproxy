
The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
bash-3.2$ cd /Users/machine/Project/GitHub/Atlanticproxy/proxy-client
bash-3.2$ sudo ./update-service.sh
Password:
🛑 Stopping service...
📦 Updating binary...
🚀 Starting service...
✅ Service updated and restarted!

📊 Monitor logs with:
   tail -f /var/log/atlantic-proxy.log
   tail -f /var/log/atlantic-proxy.error.log
bash-3.2$ tail -f /var/log/atlantic-proxy.error.log
2025/11/11 02:11:41 Starting AtlanticProxy Client Service...
time="2025-11-11T02:11:41+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:11:41+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:11:41+01:00" level=error msg="Component error:failed to configure TUN interface: not implemented"
2025/11/11 02:11:41 Service failed:failed to configure TUN interface: not implemented
2025/11/11 02:11:50 Starting AtlanticProxy Client Service...
time="2025-11-11T02:11:50+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:11:50+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:11:50+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:11:50 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1

2025/11/11 02:12:02 Starting AtlanticProxy Client Service...
time="2025-11-11T02:12:02+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:12:02+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:12:02+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:12:02 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:12:12 Starting AtlanticProxy Client Service...
time="2025-11-11T02:12:12+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:12:12+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:12:12+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:12:12 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:12:23 Starting AtlanticProxy Client Service...
time="2025-11-11T02:12:23+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:12:23+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:12:23+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:12:23 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:12:32 Starting AtlanticProxy Client Service...
time="2025-11-11T02:12:32+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:12:32+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:12:32+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:12:32 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:12:46 Starting AtlanticProxy Client Service...
time="2025-11-11T02:12:46+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:12:46+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:12:46+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:12:46 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:12:53 Starting AtlanticProxy Client Service...
time="2025-11-11T02:12:53+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:12:53+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:12:53+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:12:53 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:13:03 Starting AtlanticProxy Client Service...
time="2025-11-11T02:13:03+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:13:03+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:13:04+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:13:04 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:13:14 Starting AtlanticProxy Client Service...
time="2025-11-11T02:13:14+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:13:14+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:13:14+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:13:14 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:13:25 Starting AtlanticProxy Client Service...
time="2025-11-11T02:13:25+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:13:25+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:13:25+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:13:25 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:13:34 Starting AtlanticProxy Client Service...
time="2025-11-11T02:13:34+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:13:34+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:13:34+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:13:34 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:13:44 Starting AtlanticProxy Client Service...
time="2025-11-11T02:13:44+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:13:44+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:13:45+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:13:45 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:13:55 Starting AtlanticProxy Client Service...
time="2025-11-11T02:13:55+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:13:55+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:13:55+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:13:55 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:14:06 Starting AtlanticProxy Client Service...
time="2025-11-11T02:14:06+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:14:06+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:14:06+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:14:06 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:14:15 Starting AtlanticProxy Client Service...
time="2025-11-11T02:14:15+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:14:15+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:14:15+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:14:15 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:14:25 Starting AtlanticProxy Client Service...
time="2025-11-11T02:14:25+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:14:25+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:14:25+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:14:25 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:14:35 Starting AtlanticProxy Client Service...
time="2025-11-11T02:14:35+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:14:36+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:14:36+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:14:36 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:14:46 Starting AtlanticProxy Client Service...
time="2025-11-11T02:14:46+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:14:46+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:14:46+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:14:46 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:14:57 Starting AtlanticProxy Client Service...
time="2025-11-11T02:14:57+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:14:57+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:14:57+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:14:57 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:15:06 Starting AtlanticProxy Client Service...
time="2025-11-11T02:15:06+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:15:06+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:15:06+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:15:06 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:15:16 Starting AtlanticProxy Client Service...
time="2025-11-11T02:15:16+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:15:16+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:15:16+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:15:16 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:15:30 Starting AtlanticProxy Client Service...
time="2025-11-11T02:15:30+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:15:30+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:15:30+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:15:30 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:15:37 Starting AtlanticProxy Client Service...
time="2025-11-11T02:15:37+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:15:37+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:15:37+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:15:37 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:15:47 Starting AtlanticProxy Client Service...
time="2025-11-11T02:15:47+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:15:47+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:15:47+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:15:47 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:16:02 Starting AtlanticProxy Client Service...
time="2025-11-11T02:16:02+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:16:02+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:16:02+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:16:02 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
^C
bash-3.2$ clear
bash-3.2$ cd /Users/machine/Project/GitHub/Atlanticproxy/proxy-client
bash-3.2$ sudo ./update-service.sh
🛑 Stopping service...
📦 Updating binary...
🚀 Starting service...
✅ Service updated and restarted!

📊 Monitor logs with:
   tail -f /var/log/atlantic-proxy.log
   tail -f /var/log/atlantic-proxy.error.log
bash-3.2$ tail -f /var/log/atlantic-proxy.error.log
time="2025-11-11T02:16:02+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:16:02 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:16:08 Starting AtlanticProxy Client Service...
time="2025-11-11T02:16:08+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:16:08+01:00" level=info msg="AtlanticProxy service started successfully"
time="2025-11-11T02:16:08+01:00" level=error msg="Component error:failed to configure TUN interface: failed to set netmask: exit status 1"
2025/11/11 02:16:08 Service failed:failed to configure TUN interface: failed to set netmask: exit status 1
2025/11/11 02:16:15 Starting AtlanticProxy Client Service...
time="2025-11-11T02:16:15+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:16:15+01:00" level=info msg="AtlanticProxy service started successfully"
^C
bash-3.2$ clear
bash-3.2$ cd /Users/machine/Project/GitHub/Atlanticproxy/proxy-client
bash-3.2$ sudo ./force-update.sh
🔨 Force rebuilding...
Building for local platform...
go build -ldflags "-X main.version=cdc898f" -o build/atlantic-proxy-client ./cmd/service


🛑 Stopping service...
📦 Updating binary...
🧹 Clearing old logs...
🚀 Starting service...

✅ Service force-updated!

📊 Monitor with: tail -f /var/log/atlantic-proxy.error.log
bash-3.2$ 
bash-3.2$ tail -f /var/log/atlantic-proxy.error.log
2025/11/11 02:19:03 Starting AtlanticProxy Client Service...
time="2025-11-11T02:19:03+01:00" level=info msg="Initializing AtlanticProxy components..."
time="2025-11-11T02:19:03+01:00" level=info msg="AtlanticProxy service started successfully"

