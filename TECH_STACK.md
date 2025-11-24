
The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
Machines-MBP:Atlanticproxy machine$ # 1. Build images
docker build -f backend/Dockerfile.prod -t atlantic-proxy-backend:latest .
docker build -f frontend/Dockerfile.prod -t atlantic-proxy-frontend:latest .^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^H^Hq translate '1. Build images'
nv.prod.example .env.prod
# Edit .env.prod with your values

# 3. Run services
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
curl http://localhost:5000/health
curl http://localhost:3000

# 5. Push to GitHub
git add .
git commit -m "Phase 8: Add Docker and CI/CD"
git push origin main
Machines-MBP:Atlanticproxy machine$ docker build -f backend/Dockerfile.prod -t atlantic-proxy-backend:latest .
[+] Building 328.7s (13/17)                         docker:desktop-linux
 => [internal] load build definition from Dockerfile.prod           0.8s
 => => transferring dockerfile: 606B                                0.2s
 => [internal] load .dockerignore                                   0.7s
 => => transferring context: 2B                                     0.1s
 => [internal] load metadata for docker.io/library/golang:1.21-al  12.2s
 => [internal] load metadata for docker.io/library/alpine:latest   12.2s
 => [auth] library/alpine:pull token for registry-1.docker.io       0.0s
 => [auth] library/golang:pull token for registry-1.docker.io       0.0s
 => [builder 1/6] FROM docker.io/library/golang:1.21-alpine@sha2  293.8s
 => => resolve docker.io/library/golang:1.21-alpine@sha256:2414035  0.1s
 => => sha256:2414035b086e3c42b99654c8b26e6f5b1b 10.30kB / 10.30kB  0.0s
 => => sha256:8ee9b9e11ef79e314a7584040451a6df8e72 1.92kB / 1.92kB  0.0s
 => => sha256:c2321c7cf7210be837249dba0f3699fad6dd 2.10kB / 2.10kB  0.0s
 => => sha256:41db7493d1c6f3f26428d119962e3862 290.89kB / 290.89kB  2.3s
 => => sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3 3.62MB / 3.62MB  2.6s
 => => sha256:54bf7053e2d96c2c7f4637ad7580bd643 67.01MB / 67.01MB  26.1s
 => => sha256:4579008f8500d429ec007d092329191009711942 126B / 126B  3.2s
 => => extracting sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fe  4.5s
 => => sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb557 32B / 32B  3.3s
 => => extracting sha256:41db7493d1c6f3f26428d119962e3862c14a9e20  11.7s
 => => extracting sha256:54bf7053e2d96c2c7f4637ad7580bd64345b3c9  259.4s
 => => extracting sha256:4579008f8500d429ec007d092329191009711942d  0.0s
 => => extracting sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb55  0.0s
 => [stage-1 1/4] FROM docker.io/library/alpine:latest@sha256:4b7c  0.4s
 => => resolve docker.io/library/alpine:latest@sha256:4b7ce07002c6  0.1s
 => => sha256:706db57fb2063f39f69632c5b5c9c439633fda35 581B / 581B  0.0s
 => => sha256:4b7ce07002c69e8f3d704a9c5d6fd3053be5 9.22kB / 9.22kB  0.0s
 => => sha256:85f2b723e106c34644cd5851d7e81ee87da9 1.02kB / 1.02kB  0.0s
 => [internal] load build context                                 314.4s
 => => transferring context: 629.94MB                             313.0s
 => [stage-1 2/4] RUN apk --no-cache add ca-certificates           28.8s
 => [stage-1 3/4] WORKDIR /root/                                    1.8s
 => [builder 2/6] WORKDIR /app                                      2.1s
 => ERROR [builder 3/6] COPY go.mod go.sum ./                       0.0s
------
 > [builder 3/6] COPY go.mod go.sum ./:
------
Dockerfile.prod:7
--------------------
   5 |     
   6 |     # Copy go mod files
   7 | >>> COPY go.mod go.sum ./
   8 |     
   9 |     # Download dependencies
--------------------
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref e753a81d-ea48-4f71-bb9c-4e2a49be04d2::p9gkelyh8tlsjiav2loldqlig: "/go.sum": not found
Machines-MBP:Atlanticproxy machine$ docker build -f frontend/Dockerfile.proq translate '1. Build images'
ERROR: "docker buildx build" requires exactly 1 argument.
See 'docker buildx build --help'.

Usage:  docker buildx build [OPTIONS] PATH | URL | -

Start a build
Machines-MBP:Atlanticproxy machine$ nv.prod.example .env.prod
bash: nv.prod.example: command not found
Machines-MBP:Atlanticproxy machine$ # Edit .env.prod with your values
Machines-MBP:Atlanticproxy machine$ 
Machines-MBP:Atlanticproxy machine$ # 3. Run services
Machines-MBP:Atlanticproxy machine$ docker-compose -f docker-compose.prod.yml up -d
WARN[0000] The "DATABASE_URL" variable is not set. Defaulting to a blank string. 
WARN[0000] The "JWT_SECRET" variable is not set. Defaulting to a blank string. 
WARN[0000] The "PAYSTACK_SECRET" variable is not set. Defaulting to a blank string. 
[+] Building 47.0s (14/17)                          docker:desktop-linux
 => [backend internal] load .dockerignore                           0.1s
 => => transferring context: 2B                                     0.0s
 => [backend internal] load build definition from Dockerfile.prod   0.1s
 => => transferring dockerfile: 606B                                0.0s
 => [backend internal] load metadata for docker.io/library/golang:  8.6s
 => [backend internal] load metadata for docker.io/library/alpine:  8.6s
 => [backend auth] library/golang:pull token for registry-1.docker  0.0s
 => [backend auth] library/alpine:pull token for registry-1.docker  0.0s
 => [backend builder 1/6] FROM docker.io/library/golang:1.21-alpin  0.0s
 => [backend stage-1 1/4] FROM docker.io/library/alpine:latest@sha  0.0s
 => CACHED [backend stage-1 2/4] RUN apk --no-cache add ca-certifi  0.0s
 => CACHED [backend stage-1 3/4] WORKDIR /root/                     0.0s
 => [backend internal] load build context                          12.7s
 => => transferring context: 62.09MB                               12.6s
 => CACHED [backend builder 2/6] WORKDIR /app                       0.0s
 => [backend builder 3/6] COPY go.mod go.sum ./                     0.6s
 => ERROR [backend builder 4/6] RUN go mod download                21.8s
------                                                                   
 > [backend builder 4/6] RUN go mod download:
18.89 go: go.mod requires go >= 1.24.0 (running go 1.21.13; GOTOOLCHAIN=local)
------
failed to solve: process "/bin/sh -c go mod download" did not complete successfully: exit code: 1
Machines-MBP:Atlanticproxy machine$ 
Machines-MBP:Atlanticproxy machine$ # 4. Verify
Machines-MBP:Atlanticproxy machine$ curl http://localhost:5000/health
curl: (7) Failed to connect to localhost port 5000 after 5 ms: Couldn't connect to server
Machines-MBP:Atlanticproxy machine$ curl http://localhost:3000
