# Ad-Blocking Partnership Evaluation

**Date:** December 27, 2025
**Decision:** Internal Development (Phase 8 Implementation)

## 1. Context
We evaluated whether to rely on an external paid API for ad-blocking or to implement a local, compliant solution using reputable blocklists.

## 2. Options Considered
1. **Third-Party API (e.g., AdGuard API)**
   - **Pros:** Managed updates, high accuracy.
   - **Cons:** Added latency (external RTT), privacy concerns (sending DNS queries to third party), cost per user.

2. **Internal Implementation (Chosen)**
   - **Architecture:** Local Blocklist + DNS Interceptor.
   - **Performance:** Sub-millisecond lookup (HashMap `O(1)`).
   - **Privacy:** All decisioning happens on-device.
   - **Compliance:** Region-aware `ComplianceManager`.

## 3. Decision Documentation
We have chosen the **Internal Implementation**.
- **Latency Requirement:** <5ms overhead achieved (0ms network cost).
- **Control:** We retain full control over the `blocklist_wrapper` and can whitelist critical domains dynamically.
- **Cost:** $0 operational cost per query.

## 4. Next Steps
- Periodically update the blocklist source (e.g., weekly cron).
- Monitor false-positive rates via user feedback.
