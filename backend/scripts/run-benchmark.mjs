// scripts/run-benchmark.mjs
// Usage: node scripts/run-benchmark.mjs <label> <url> [cookieFile]
// label: "baseline" or "after"
// Runs autocannon -c 20 -d 15 and saves results to perf/<label>-<route>.txt
import autocannon from 'autocannon';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const perfDir = path.join(__dirname, '..', 'perf');

const label      = process.argv[2]; // e.g. "baseline-product-list"
const url        = process.argv[3]; // e.g. "http://localhost:3000/api/product/list"
const cookieFile = process.argv[4]; // optional: path to cookie file

if (!label || !url) {
    console.error('Usage: node scripts/run-benchmark.mjs <label> <url> [cookieFile]');
    process.exit(1);
}

const headers = {};
if (cookieFile && fs.existsSync(cookieFile)) {
    headers['cookie'] = fs.readFileSync(cookieFile, 'utf8').trim();
    console.log(`Using cookie: ${headers['cookie'].substring(0, 40)}...`);
}
headers['origin'] = 'http://localhost:5173';

console.log(`\nRunning autocannon: -c 20 -d 15 ${url}`);
console.log('This will take 15 seconds...\n');

const instance = autocannon({
    url,
    connections:  20,
    duration:     15,
    headers,
    pipelining:   1,
    timeout:      10,
}, (err, result) => {
    if (err) {
        console.error('Autocannon error:', err);
        process.exit(1);
    }

    // Pretty-print summary
    const summary = autocannon.printResult(result);
    console.log(summary);

    // Build text to save
    const outText = [
        `=== Autocannon Benchmark: ${label} ===`,
        `URL:         ${url}`,
        `Connections: 20`,
        `Duration:    15s`,
        `Timestamp:   ${new Date().toISOString()}`,
        '',
        '--- Raw Result (JSON) ---',
        JSON.stringify(result, null, 2),
        '',
        '--- Human Summary ---',
        summary,
    ].join('\n');

    const outFile = path.join(perfDir, `${label}.txt`);
    fs.writeFileSync(outFile, outText, 'utf8');
    console.log(`\nSaved to ${outFile}`);

    // Print the key metrics we'll extract
    console.log('\n=== KEY METRICS ===');
    console.log(`Requests/sec:  ${result.requests.average}`);
    console.log(`Latency p50:   ${result.latency.p50}ms`);
    console.log(`Latency p97.5: ${result.latency.p97_5}ms`);
    console.log(`Latency p99:   ${result.latency.p99}ms`);
    console.log(`Latency max:   ${result.latency.max}ms`);
    console.log(`Total reqs:    ${result.requests.total}`);
    console.log(`Non-2xx:       ${result['non2xx'] || 0}`);
    console.log(`Errors:        ${result.errors}`);
    console.log(`Timeouts:      ${result.timeouts}`);
});

// Live progress
autocannon.track(instance, { renderProgressBar: true });
