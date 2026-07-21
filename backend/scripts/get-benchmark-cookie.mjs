// scripts/get-benchmark-cookie.mjs
// Registers + logs in the benchmark test user, saves the cookie to perf/benchmark-cookie.txt
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';
const EMAIL = 'bench_perf_001@neocart.local';
const PASS  = 'BenchPerf1234!';
const NAME  = 'Bench User';

function request(url, method, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const u = new URL(url);
        const opts = {
            hostname: u.hostname,
            port:     u.port || 80,
            path:     u.pathname,
            method,
            headers: {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Origin':         'http://localhost:5173',
            }
        };
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function main() {
    // 1. Register (ignore 400 = already exists)
    console.log('Registering benchmark user...');
    const regRes = await request(`${BASE}/api/auth/registration`, 'POST', { name: NAME, email: EMAIL, password: PASS });
    console.log(`  Register status: ${regRes.status}`);

    // 2. Login
    console.log('Logging in...');
    const loginRes = await request(`${BASE}/api/auth/login`, 'POST', { email: EMAIL, password: PASS });
    console.log(`  Login status: ${loginRes.status}`);

    if (loginRes.status !== 200 && loginRes.status !== 201) {
        console.error('Login failed:', loginRes.body);
        process.exit(1);
    }

    // 3. Extract Set-Cookie header
    const setCookie = loginRes.headers['set-cookie'];
    if (!setCookie || !setCookie.length) {
        console.error('No Set-Cookie header in login response!');
        process.exit(1);
    }

    // Find the token= cookie
    const tokenCookieLine = setCookie.find(c => c.startsWith('token='));
    if (!tokenCookieLine) {
        console.error('No token cookie found. Cookies:', setCookie);
        process.exit(1);
    }

    // Extract just "token=<value>" (before the first semicolon)
    const cookieStr = tokenCookieLine.split(';')[0].trim();
    console.log(`  Cookie captured (${cookieStr.length} chars): ${cookieStr.substring(0, 40)}...`);

    // 4. Save
    const outPath = path.join(__dirname, '..', 'perf', 'benchmark-cookie.txt');
    fs.writeFileSync(outPath, cookieStr, 'utf8');
    console.log(`  Saved to ${outPath}`);

    // 5. Verify it works on a protected route
    console.log('Verifying cookie on protected route GET /api/user/getcurrentuser...');
    const u = new URL(`${BASE}/api/user/getcurrentuser`);
    const verifyRes = await new Promise((resolve, reject) => {
        const opts = {
            hostname: u.hostname,
            port:     u.port || 80,
            path:     u.pathname,
            method:   'GET',
            headers: {
                'Cookie': cookieStr,
                'Origin': 'http://localhost:5173',
            }
        };
        const req = http.request(opts, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.end();
    });

    console.log(`  Protected route status: ${verifyRes.status}`);
    if (verifyRes.status === 200) {
        const user = JSON.parse(verifyRes.body);
        console.log(`  Auth verified: ${user.name} (${user.email})`);
        console.log('');
        console.log('SUCCESS: Cookie is valid and working.');
    } else {
        console.error('Auth verification failed:', verifyRes.body);
        process.exit(1);
    }
}

main().catch(e => { console.error(e); process.exit(1); });
