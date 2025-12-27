sleep 5 && docker ps

The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
Machines-MBP:Atlanticproxy machine$ sleep 5 && docker ps
^Cdocker ps 2>&1
Machines-MBP:Atlanticproxy machine$ docker ps 2>&1
^Csleep 10 && docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d
Machines-MBP:Atlanticproxy machine$ sleep 10 && docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d
^Ccanceled
Machines-MBP:Atlanticproxy machine$ docker info 2>&1 | head -5
^C
Machines-MBP:Atlanticproxy machine$ chmod +x DEPLOY.sh && ./DEPLOY.sh 2>&1 | head -50
🚀 Atlantic Proxy - Production Deployment
==========================================

1. Checking Docker...
✅ Docker found
2. Checking Docker daemon...
^CMachines-MBP:Atlanticproxy machine$ docker ps 2>&1
./DEPLOY.sh
CONTAINER ID   IMAGE                                          COMMAND                  CREATED        STATUS                       PORTS                                                                                                         NAMES
3b2c1853066a   nginx:alpine                                   "/docker-entrypoint.…"   23 hours ago   Up 11 hours                  0.0.0.0:9080->80/tcp, 0.0.0.0:9443->443/tcp                                                                   atlanticfrewaycard-nginx-1
8140b63f894c   atlanticfrewaycard-app                         "docker-entrypoint.s…"   23 hours ago   Up 11 hours (unhealthy)      0.0.0.0:3000->3000/tcp                                                                                        atlanticfrewaycard-app-1
a5c21f49d901   postgres:15-alpine                             "docker-entrypoint.s…"   28 hours ago   Up 11 hours (unhealthy)      0.0.0.0:5432->5432/tcp                                                                                        atlanticfrewaycard-postgres-1
f9979316bfc2   mongo:7                                        "docker-entrypoint.s…"   28 hours ago   Up 11 hours (unhealthy)      0.0.0.0:27017->27017/tcp                                                                                      atlanticfrewaycard-mongodb-1
0ae26b2b6cdc   redis:7-alpine                                 "docker-entrypoint.s…"   28 hours ago   Up 11 hours (healthy)        0.0.0.0:6379->6379/tcp                                                                                        atlanticfrewaycard-redis-1
bd655ed2de93   rabbitmq:3.13-management                       "docker-entrypoint.s…"   28 hours ago   Up 11 hours (unhealthy)      4369/tcp, 5671/tcp, 0.0.0.0:5672->5672/tcp, 15671/tcp, 15691-15692/tcp, 25672/tcp, 0.0.0.0:15672->15672/tcp   atlanticfrewaycard-rabbitmq-1
c2e90d4fcb3a   nginx:alpine                                   "/docker-entrypoint.…"   32 hours ago   Restarting (1) 4 hours ago                                                                                                                 namaskahapp-nginx-1
5fb80e49ff6d   namaskahapp-app                                "uvicorn main:app --…"   32 hours ago   Up 4 hours (unhealthy)       0.0.0.0:8000->8000/tcp                                                                                        namaskahapp-app-1
28e77078370d   redis:7-alpine                                 "docker-entrypoint.s…"   6 days ago     Up 11 hours                  6379/tcp                                                                                                      atlanticesim-redis-1
2dbfc1bb1ac8   postgres:15                                    "docker-entrypoint.s…"   6 days ago     Up 11 hours                  5432/tcp                                                                                                      atlanticesim-postgres-1
5bca3cfd5441   nginx/nginx-prometheus-exporter:latest         "/usr/bin/nginx-prom…"   9 days ago     Up 11 hours (unhealthy)      0.0.0.0:9113->9113/tcp                                                                                        nginx-exporter
7136c6e0bb5d   prometheuscommunity/postgres-exporter:latest   "/bin/postgres_expor…"   9 days ago     Up 11 hours (unhealthy)      0.0.0.0:9187->9187/tcp                                                                                        postgres-exporter
f32b01d34850   prom/node-exporter:latest                      "/bin/node_exporter …"   9 days ago     Up 11 hours (unhealthy)      0.0.0.0:9100->9100/tcp                                                                                        node-exporter
69e04bfabc98   prom/prometheus:latest                         "/bin/prometheus --c…"   9 days ago     Up 11 hours (unhealthy)      0.0.0.0:9090->9090/tcp                                                                                        prometheus
fad783a4aa6d   oliver006/redis_exporter:latest                "/redis_exporter"        9 days ago     Up 11 hours (unhealthy)      0.0.0.0:9121->9121/tcp                                                                                        redis-exporter
5e7c740eebfb   prom/alertmanager:latest                       "/bin/alertmanager -…"   9 days ago     Up 11 hours (unhealthy)      0.0.0.0:9093->9093/tcp                                                                                        alertmanager
Machines-MBP:Atlanticproxy machine$ ./DEPLOY.sh
🚀 Atlantic Proxy - Production Deployment
==========================================

1. Checking Docker...
✅ Docker found
2. Checking Docker daemon...
^C❌ Docker daemon not running. Please start Docker Desktop.
killall Docker 2>/dev/null; sleep 2; open /Applications/Docker.app
Machines-MBP:Atlanticproxy machine$ killall Docker 2>/dev/null; sleep 2; open /Applications/Docker.app
^C
cd "/Users/machine/Project/GitHub/Atlanticproxy/backend" && go version
Machines-MBP:Atlanticproxy machine$ cd "/Users/machine/Project/GitHub/Atlanticproxy/backend" && go version
go version go1.25.3 darwin/amd64
Machines-MBP:backend machine$ cd "/Users/machine/Project/GitHub/Atlanticproxy" && which go
/usr/local/bin/go
Machines-MBP:Atlanticproxy machine$ which node
/usr/local/bin/node
Machines-MBP:Atlanticproxy machine$ ./DEPLOY.sh
🚀 Atlantic Proxy - Production Deployment
==========================================

1. Checking Docker...
✅ Docker found
2. Checking Docker daemon...
