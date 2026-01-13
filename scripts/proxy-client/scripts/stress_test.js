import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 100 }, // Ramp up to 100 users
        { duration: '3m', target: 100 }, // Stay at 100 users
        { duration: '1m', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        http_req_failed: ['rate<0.01'],    // Less than 1% failure rate
    },
};

export default function () {
    // Test a simple proxy request
    // Assumes the proxy is running on localhost:8080
    // We use a public IP check service to verify the proxy is working
    let res = http.get('http://httpbin.org/ip', {
        proxy: 'http://localhost:8080',
        timeout: '10s',
    });

    check(res, {
        'status is 200': (r) => r.status === 200,
        'protocol is Correct': (r) => r.json().origin !== undefined,
    });

    sleep(1);
}
