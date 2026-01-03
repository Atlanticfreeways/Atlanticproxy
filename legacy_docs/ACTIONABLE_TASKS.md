# 🚀 Actionable Tasks (No Credentials Required)

These tasks can be executed immediately while waiting for Oxylabs Residential Proxies credentials. They focus on production readiness, deployment automation, and code quality.

---

## 1. 📦 Production Installers
**Goal:** Create distributable packages for end-users.

- [ ] **macOS Installer (.dmg)**
  - Create a standard script to package the binary into a `.dmg` image.
  - Verification: Mount and run on local machine.
- [ ] **Windows Installer (.exe)**
  - Use a tool like NSIS (or just a zip archive with a `.bat` launcher first) to package `service.exe`.
- [ ] **Linux Packages (.deb)**
  - Create `control` file and directory structure.
  - Build `.deb` package using `dpkg-deb`.
- [ ] **Installation Scripts**
  - Write `install.sh` for one-line installation on Linux/macOS.
  - Write `install.ps1` for Windows.

## 2. 🐳 Deployment Automation (DevOps)
**Goal:** Simplify deployment for server admins.

- [ ] **Dockerfile**
  - Create a multi-stage Dockerfile (Build -> Run) to create a tiny production image (Alpine/Distroless).
- [ ] **Docker Compose**
  - Create `docker-compose.yml` to spin up the Service + optional UI.
- [ ] **GitHub Actions (CI)**
  - Create `.github/workflows/build.yml` to automatically build binaries on push.
  - Add test step to CI pipeline.

## 3. 📈 Advanced Monitoring
**Goal:** Better observability for production usage.

- [ ] **Prometheus Metrics**
  - Add `/metrics` endpoint using `prometheus/client_golang`.
  - Export: Active connections, Request count, Bandwidth, Error rate.
- [ ] **Grafana Dashboard**
  - Create a JSON dashboard model visualizing the exported metrics.

## 4. 🧪 Unit Testing (Mocked)
**Goal:** Increase confidence in logic without external API calls.

- [ ] **Rotation Logic**
  - Test `GetNextProxy` and sticky session expiration using a Mock proxy pool.
- [ ] **Billing Logic**
  - Test complex scenarios: Plan upgrade mid-month, quota exhaustion, currency switching.
- [ ] **Ad-Block Parsers**
  - Benchmark parser performance with large real-world lists.

## 5. 🧹 Code Quality & Docs
**Goal:** Maintainability.

- [ ] **GoDoc Comments**
  - Complete documentation for `pkg/oxylabs` and `internal/proxy`.
- [ ] **Architecture Diagram**
  - Create a simplified diagram of how components interact (using Mermaid).

---

## Recommended Next Step
**Start with Deployment Automation (Docker)**. It's high impact, easy to verify locally, and creates the foundation for the installers.
