# Load Testing Guide

**Version:** 1.0.0  
**Last Updated:** November 25, 2025

---

## Overview

Load testing verifies that Atlantic Proxy can handle production traffic and identifies performance bottlenecks.

---

## Tools

### Apache Bench (ab)
Simple HTTP load testing tool.

```bash
# Install
sudo apt-get install apache2-utils

# Basic test
ab -n 1000 -c 100 http://localhost:5000/health
```

### wrk
Modern HTTP benchmarking tool.

```bash
# Install
git clone https://github.com/wg/wrk.git
cd wrk
make

# Basic test
./wrk -t4 -c100 -d30s http://localhost:5000/health
```

### k6
Load testing platform with scripting.

```bash
# Install
sudo apt-get install k6

# Run test
k6 run load-test.js
```

### JMeter
Enterprise load testing tool.

```bash
# Install
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.5.tgz
tar -xzf apache-jmeter-5.5.tgz

# Run GUI
./apache-jmeter-5.5/bin/jmeter.sh
```

---

## Test Scenarios

### 1. Normal Load Test

**Objective:** Verify system handles normal traffic

```bash
# 100 concurrent users for 5 minutes
ab -n 30000 -c 100 -t 300 http://localhost:5000/health

# Expected results:
# - Response time: < 200ms
# - Error rate: < 0.1%
# - Throughput: > 100 req/s
```

### 2. Peak Load Test

**Objective:** Verify system handles peak traffic

```bash
# 1000 concurrent users for 5 minutes
ab -n 300000 -c 1000 -t 300 http://localhost:5000/health

# Expected results:
# - Response time: < 500ms
# - Error rate: < 1%
# - Throughput: > 1000 req/s
```

### 3. Stress Test

**Objective:** Find system breaking point

```bash
# Gradually increase load
for c in 100 500 1000 2000 5000; do
  echo "Testing with $c concurrent users..."
  ab -n 100000 -c $c -t 60 http://localhost:5000/health
done
```

### 4. Sustained Load Test

**Objective:** Verify system stability over time

```bash
# 500 concurrent users for 30 minutes
ab -n 900000 -c 500 -t 1800 http://localhost:5000/health

# Monitor for:
# - Memory leaks
# - Connection leaks
# - Performance degradation
```

### 5. Spike Test

**Objective:** Verify system handles sudden traffic spikes

```bash
# Simulate spike with wrk
wrk -t4 -c100 -d10s http://localhost:5000/health
# Wait 30 seconds
wrk -t4 -c1000 -d10s http://localhost:5000/health
# Wait 30 seconds
wrk -t4 -c100 -d10s http://localhost:5000/health
```

---

## k6 Load Test Script

### Basic Script

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 200 },  // Ramp to 200
    { duration: '5m', target: 200 },  // Stay at 200
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  let response = http.get('http://localhost:5000/health');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### API Load Test Script

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

let token = '';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  // Register
  let registerRes = http.post('http://localhost:5000/api/auth/register', {
    email: `user${__VU}@example.com`,
    password: 'password123',
    name: 'Test User',
  });
  
  check(registerRes, {
    'register status is 201': (r) => r.status === 201,
  });
  
  if (registerRes.status === 201) {
    token = registerRes.json('token');
  }
  
  // Get proxies
  let proxiesRes = http.get('http://localhost:5000/api/proxies', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  check(proxiesRes, {
    'proxies status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

### Run k6 Test

```bash
# Run test
k6 run load-test.js

# Run with output
k6 run --out csv=results.csv load-test.js

# Run with specific VUs
k6 run -u 100 -d 5m load-test.js
```

---

## Performance Metrics

### Key Metrics

1. **Response Time**
   - Average: < 200ms
   - P95: < 500ms
   - P99: < 1000ms

2. **Throughput**
   - Requests per second: > 1000
   - Requests per minute: > 60000

3. **Error Rate**
   - Normal load: < 0.1%
   - Peak load: < 1%
   - Stress test: < 5%

4. **Resource Usage**
   - CPU: < 80%
   - Memory: < 80%
   - Disk I/O: < 80%
   - Network: < 80%

### Monitoring During Tests

```bash
# Monitor system resources
watch -n 1 'docker stats'

# Monitor application logs
docker-compose logs -f backend

# Monitor database
docker-compose exec db psql -U atlantic_user -d atlantic_proxy \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Test Results Analysis

### Apache Bench Output

```
Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
...

Server Software:        
Server Hostname:        localhost
Server Port:            5000

Document Path:          /health
Document Length:        15 bytes

Concurrency Level:      100
Time taken for tests:   10.234 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      150000 bytes
HTML transferred:       150000 bytes
Requests per second:    977.14 [#/sec] (mean)
Time per request:       102.34 [ms] (mean)
Time per request:       1.02 [ms] (mean, across all concurrent requests)
Transfer rate:          14.31 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   0.5      1       5
Processing:    10  100  20.3     98     150
Waiting:        5   95  20.1     93     145
Total:         10  101  20.4     99     155

Percentage of the requests served within a certain time (ms)
  50%     99
  66%    105
  75%    110
  80%    115
  90%    125
  95%    135
  99%    150
 100%    155 (longest request)
```

### Interpretation

- **Requests per second:** 977 req/s ✅ (target: > 100)
- **Mean response time:** 102ms ✅ (target: < 200ms)
- **P95 response time:** 135ms ✅ (target: < 500ms)
- **Failed requests:** 0 ✅ (target: < 0.1%)

---

## Bottleneck Identification

### Common Bottlenecks

1. **Database**
   - Slow queries
   - Missing indexes
   - Connection pool exhausted
   - Lock contention

2. **Application**
   - Memory leaks
   - CPU intensive operations
   - Inefficient algorithms
   - Blocking I/O

3. **Infrastructure**
   - Network latency
   - Disk I/O
   - CPU limits
   - Memory limits

### Profiling

```bash
# CPU profiling
go tool pprof http://localhost:5000/debug/pprof/profile

# Memory profiling
go tool pprof http://localhost:5000/debug/pprof/heap

# Goroutine profiling
go tool pprof http://localhost:5000/debug/pprof/goroutine
```

---

## Optimization Strategies

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_proxies_user_id ON proxies(user_id);
CREATE INDEX idx_analytics_proxy_id ON analytics(proxy_id);

-- Analyze tables
ANALYZE proxies;
ANALYZE analytics;

-- Check query plans
EXPLAIN ANALYZE SELECT * FROM proxies WHERE user_id = 1;
```

### Application Optimization

```go
// Connection pooling
db.SetMaxOpenConns(50)
db.SetMaxIdleConns(10)

// Caching
cache := make(map[string]interface{})

// Batch operations
// Instead of individual queries, batch them
```

### Infrastructure Optimization

```bash
# Increase file descriptors
ulimit -n 65536

# Tune TCP settings
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535

# Enable connection reuse
sysctl -w net.ipv4.tcp_tw_reuse=1
```

---

## Continuous Load Testing

### Automated Testing

```yaml
# GitHub Actions workflow
name: Load Testing
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install k6
        run: sudo apt-get install k6
      - name: Run load test
        run: k6 run load-test.js
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: load-test-results
          path: results.csv
```

---

## Reporting

### Test Report Template

```markdown
# Load Test Report

**Date:** November 25, 2025
**Duration:** 30 minutes
**Concurrent Users:** 100-1000

## Results

### Performance Metrics
- Average Response Time: 102ms
- P95 Response Time: 135ms
- P99 Response Time: 150ms
- Requests per Second: 977

### Resource Usage
- CPU: 45%
- Memory: 512MB
- Disk I/O: 20%
- Network: 50Mbps

### Error Rate
- Total Requests: 10000
- Failed Requests: 0
- Error Rate: 0%

## Conclusion
System successfully handled 1000 concurrent users with acceptable performance.

## Recommendations
1. Optimize database queries
2. Implement caching
3. Scale horizontally
```

---

## Resources

### Tools
- Apache Bench: https://httpd.apache.org/docs/2.4/programs/ab.html
- wrk: https://github.com/wg/wrk
- k6: https://k6.io/
- JMeter: https://jmeter.apache.org/

### Documentation
- Load Testing Best Practices: https://k6.io/docs/
- Performance Testing Guide: https://www.perfmatrix.com/

---

**Load Testing Guide**  
**Status: Ready for Testing**

🚀 **Test and optimize!**
