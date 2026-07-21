// scripts/sanity-check.mjs
// Runs quick correctness checks after Step 2 caching changes.
import http from 'http';
import fs from 'fs';

const BASE   = 'http://localhost:3000';
const ORIGIN = 'http://localhost:5173';
const COOKIE = fs.readFileSync('perf/benchmark-cookie.txt', 'utf8').trim();

let passed = 0;
let failed = 0;

function log(label, ok, detail = '') {
    if (ok) { passed++; console.log(`  ✅ PASS: ${label}${detail ? ' — ' + detail : ''}`); }
    else     { failed++; console.error(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`); }
}

function get(path, cookie) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'localhost', port: 3000, path, method: 'GET',
            headers: { Origin: ORIGIN, ...(cookie ? { Cookie: cookie } : {}) }
        };
        const req = http.request(opts, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('\n=== Sanity Checks (Step 2 post-cache) ===\n');

    // 1. Product list returns 200 and correct count
    console.log('--- Check 1: Product list cold (cache miss) ---');
    const p1 = await get('/api/product/list');
    const products = JSON.parse(p1.body);
    log('product list status 200', p1.status === 200, `status=${p1.status}`);
    log('product list returns array', Array.isArray(products), `length=${products.length}`);
    log('product count is 200', products.length === 200, `got ${products.length}`);

    // 2. Product list warm (cache hit) — should be same data, much faster
    console.log('\n--- Check 2: Product list warm (cache hit) ---');
    const t1 = Date.now();
    const p2 = await get('/api/product/list');
    const warmMs = Date.now() - t1;
    const products2 = JSON.parse(p2.body);
    log('cache hit returns 200', p2.status === 200, `status=${p2.status}`);
    log('cache hit returns same count', products2.length === products.length, `length=${products2.length}`);
    log('cache hit is fast (<80ms)', warmMs < 80, `took ${warmMs}ms`);

    // 3. Auth route returns correct user
    console.log('\n--- Check 3: Auth route returns req.user (no redundant DB query) ---');
    const a1 = await get('/api/user/getcurrentuser', COOKIE);
    const user = JSON.parse(a1.body);
    log('auth route status 200', a1.status === 200, `status=${a1.status}`);
    log('user name present', !!user.name, `name=${user.name}`);
    log('password not exposed', !('password' in user), `keys=${Object.keys(user).join(',')}`);
    log('cartData present in response', 'cartData' in user, '');

    // 4. Second auth call (cache hit) — should also work
    console.log('\n--- Check 4: Auth route second call (user cache hit) ---');
    const a2 = await get('/api/user/getcurrentuser', COOKIE);
    const user2 = JSON.parse(a2.body);
    log('cache hit auth status 200', a2.status === 200, `status=${a2.status}`);
    log('cache hit returns same user', user2._id === user._id, `id=${user2._id}`);

    // 5. No-cookie returns 401
    console.log('\n--- Check 5: No cookie → 401 (not served from cache) ---');
    const a3 = await get('/api/user/getcurrentuser');
    log('no-cookie returns 401', a3.status === 401, `status=${a3.status}`);

    // Summary
    console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
    if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
