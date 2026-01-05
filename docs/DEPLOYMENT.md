# Production Deployment Guide

This guide details how to deploy AtlanticProxy in a production environment.

## Infrastructure Requirements

- **OS:** Linux (Ubuntu 22.04 LTS recommended)
- **CPU:** 2+ cores (for high encryption throughput)
- **RAM:** 4GB+ (for connection tracking and caching)
- **Disk:** 20GB+ SSD (for logs and database)
- **Network:** Public static IP, open ports 80, 443, 8080, 8082

---

## 1. System Preparation

### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx
```

### Install Go
```bash
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

---

## 2. Application Setup

### Clone Repository
```bash
git clone https://github.com/yourcompany/atlanticproxy.git
cd atlanticproxy/scripts/proxy-client
```

### Build Service
```bash
# Build binary
go build -ldflags="-w -s" -o atlantic-service ./cmd/service

# Move to bin directory
sudo mv atlantic-service /usr/local/bin/
sudo chmod +x /usr/local/bin/atlantic-service
```

### Create Service User
```bash
sudo useradd -r -s /bin/false atlantic
sudo mkdir -p /var/lib/atlanticproxy
sudo chown atlantic:atlantic /var/lib/atlanticproxy
```

---

## 3. Configuration

### Environment Variables
Create a production environment file: `sudo nano /etc/atlanticproxy.env`

```bash
SERVER_PORT=8082
LOG_LEVEL=info
LOG_FORMAT=json
DATABASE_PATH=/var/lib/atlanticproxy/data.db

# Oxylabs
OXYLABS_USERNAME=customer-yourcompany
OXYLABS_PASSWORD=your_production_password

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

Set permissions:
```bash
sudo chown atlantic:atlantic /etc/atlanticproxy.env
sudo chmod 600 /etc/atlanticproxy.env
```

---

## 4. Systemd Service

Create service file: `sudo nano /etc/systemd/system/atlanticproxy.service`

```ini
[Unit]
Description=AtlanticProxy Service
After=network.target

[Service]
Type=simple
User=atlantic
Group=atlantic
EnvironmentFile=/etc/atlanticproxy.env
ExecStart=/usr/local/bin/atlantic-service
Restart=always
RestartSec=5
LimitNOFILE=65535

# Security hardening
ProtectSystem=full
PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable atlanticproxy
sudo systemctl start atlanticproxy
sudo systemctl status atlanticproxy
```

---

## 5. Nginx Reverse Proxy (SSL/TLS)

Create Nginx config: `sudo nano /etc/nginx/sites-available/atlanticproxy`

```nginx
server {
    listen 80;
    server_name proxy.yourdomain.com;

    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/atlanticproxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Setup (Let's Encrypt)
```bash
sudo certbot --nginx -d proxy.yourdomain.com
```

---

## 6. Firewall Configuration

Using UFW:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # Proxy port (if authenticating directly)
sudo ufw enable
```

---

## 7. Monitoring & Maintenance

### View Logs
```bash
journalctl -u atlanticproxy -f -o json-pretty
```

### Database Backup
Add to crontab (`sudo crontab -u atlantic -e`):
```bash
0 2 * * * cp /var/lib/atlanticproxy/data.db /var/lib/atlanticproxy/backups/data_$(date +\%Y\%m\%d).db
```

### Updates
To update version:
1. `git pull`
2. `go build -o atlantic-service ./cmd/service`
3. `sudo systemctl stop atlanticproxy`
4. `sudo mv atlantic-service /usr/local/bin/`
5. `sudo systemctl start atlanticproxy`
