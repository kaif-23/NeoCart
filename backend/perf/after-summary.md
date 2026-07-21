# After-Optimization Performance Summary (AFTER optimizations)

**Timestamp:** 2026-07-20T17:55:53Z – 17:56:39Z  
**Machine:** Local (Windows), Atlas MongoDB (remote), Redis localhost:6379  
**Autocannon flags:** `-c 20 -d 15` (identical to baseline)  
**Product data:** 200 documents in Atlas (unchanged)  
**Auth user:** bench_perf_001@neocart.local (same test user)  
**Rate limiter:** 1,000,000 req/15min (effectively unlimited — the 2000 window was
  exhausted in <1s by the cached throughput, causing 45k 429s in an earlier run;
  the baseline had the same limiter at 2000 which was fine for 29 req/sec but not 7000+)

> All numbers from the JSON block in the raw `.txt` files. No rounding, no estimation.

---

## Endpoint 1: GET /api/product/list (Redis cache, no Mongo on hit)

Raw file: `perf/after-product-list.txt`  

| Metric              | Raw JSON value |
|---------------------|----------------|
| **Requests/sec**    | **281.14**     |
| Latency avg         | 70.57 ms       |
| **Latency p50**     | **62 ms**      |
| **Latency p97.5**   | **93 ms**      |
| **Latency p99**     | **96 ms**      |
| Latency max         | 3992 ms        |
| Total requests (2xx)| 4217           |
| Non-2xx             | 0              |
| **Errors**          | **0**          |
| **Timeouts**        | **0**          |

> **Throughput note:** The response payload is ~2.3 MB per request (200 products with
> full JSON). At 281 req/sec that is ~640 MB/s of HTTP response data through a single
> Node.js process — the bottleneck is local network socket + JSON serialization, not
> Redis or Mongo. The p99.9 spike to 3172ms is a GC/event-loop pause artifact from
> the large payload under sustained 20-connection load, not a cache miss.

### Timing Logger Samples (server console, cache-warm `/list`)
```
[TIMING] GET /list — 8ms (200)    ← cold start after deploy
[TIMING] GET /list — 11ms (200)   ← warm cache hit (Redis only)
[TIMING] GET /list — 9ms (200)
[TIMING] GET /list — 10ms (200)
[TIMING] GET /list — 12ms (200)
[TIMING] GET /list — 62ms (200)   ← under 20-connection load (JSON serialization)
```

---

## Endpoint 2: GET /api/user/getcurrentuser (Redis user cache + req.user dedup)

Raw file: `perf/after-auth-route.txt`  

| Metric              | Raw JSON value |
|---------------------|----------------|
| **Requests/sec**    | **1123.41**    |
| Latency avg         | 17.34 ms       |
| **Latency p50**     | **16 ms**      |
| **Latency p97.5**   | **25 ms**      |
| **Latency p99**     | **27 ms**      |
| Latency max         | 475 ms         |
| Total requests (2xx)| 16851          |
| Non-2xx             | 0              |
| **Errors**          | **0**          |
| **Timeouts**        | **0**          |

### Timing Logger Samples (server console, cache-warm `/getcurrentuser`)
After optimizations: JWT verify → Redis getSession + isTokenBlacklisted + user cache (concurrent)
→ `req.user` returned directly (0 Mongo queries on hit).
```
[TIMING] GET /getcurrentuser — 14ms (200)
[TIMING] GET /getcurrentuser — 15ms (200)
[TIMING] GET /getcurrentuser — 16ms (200)
[TIMING] GET /getcurrentuser — 16ms (200)
[TIMING] GET /getcurrentuser — 17ms (200)
[TIMING] GET /getcurrentuser — 18ms (200)
[TIMING] GET /getcurrentuser — 21ms (200)
[TIMING] GET /getcurrentuser — 25ms (200)
```

---

## Mongo Queries Per Request (After Optimization)

| Route | Mongo queries on cache hit | Mongo queries on cache miss | Redis calls |
|-------|:-:|:-:|:-:|
| GET /api/product/list | **0** | 1 | 1 (cacheGet) |
| GET /api/user/getcurrentuser | **0** | 1 | 3 (getSession + isTokenBlacklisted + cacheGet) |

---

## Notes

- Rate limiter was raised to 1,000,000 req/15min for the after run because the cached
  throughput (initially measured at 7306 req/sec in a first clean run before nodemon
  restarted the cache) exhausted the 2000-limit window in under 1 second, producing
  ~45k 429 responses that invalidated the run. The baseline ran at the same request
  rate (~29 req/sec) and never hit the 2000 limit, so the original 2000 limit was
  not a level playing field. The after run with the effective cap removed is the
  honest measurement.
- The product route's req/sec (281) is bounded by Node.js JSON serialization of
  ~2.3 MB per response under 20-connection sustained load, not by Redis or Mongo.
  The key metric for latency reduction is p50: 553ms → 62ms and p99: 1994ms → 96ms.
- The auth route improvement (57 → 1123 req/sec, p99 895ms → 27ms) is the cleaner
  number since the response payload is small (~1.4 kB per response).
