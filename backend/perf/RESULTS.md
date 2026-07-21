# NeoCart Backend Performance Optimization Results

This report details the results of introducing Redis caching and redundant query deduplication to the NeoCart backend.

All measurements were taken using `autocannon -c 20 -d 15` against a local Node.js server connected to MongoDB Atlas and local Redis. The baseline and after measurements are backed by raw output files saved in the `perf/` directory.

## 🚀 Executive Summary

- **Product list (`GET /api/product/list`)**: p99 latency dropped from **1994ms** to **96ms** (−95%). Throughput increased by **862%**.
- **Auth route (`GET /api/user/getcurrentuser`)**: p99 latency dropped from **895ms** to **27ms** (−97%). Throughput increased by **1866%**.
- **MongoDB Load**: Hot-path queries reduced from 1-2 per request to **0** on cache hit.
- **Safety**: 18/18 safety checks passed, verifying data integrity, fallback behaviors, and auth security.

> **Quotable Metric:** *"Eliminated all MongoDB reads on hot paths via Redis caching and redundant-query removal — product list p99 latency dropped from 1994ms to 96ms (−95%), auth route p99 from 895ms to 27ms (−97%), measured with autocannon -c20 -d15 before and after on a live Atlas-connected backend."*

---

## 📊 Detailed Metrics: Before vs. After

### Endpoint 1: `GET /api/product/list`
This endpoint previously performed a full `Product.find({})` collection scan on every request. It was optimized by adding a Redis cache with a 300s TTL and eager invalidation on all 8 product mutation endpoints.

| Metric | Baseline | After | Improvement |
|---|---|---|---|
| **Requests/sec** | 29.2 | **281** | **+862%** |
| **Latency p50** | 553 ms | **62 ms** | **−89%** |
| **Latency p97.5**| 1673 ms | **93 ms** | **−94%** |
| **Latency p99** | 1994 ms | **96 ms** | **−95%** |
| **Mongo queries/req** | 1 | **0** (cache hit) | **−100%** |

*Note: The product route's post-optimization throughput (281 req/sec) is constrained by Node.js JSON serialization overhead for the large ~2.3MB response payload (~640 MB/s), rather than database or cache I/O.*

### Endpoint 2: `GET /api/user/getcurrentuser`
This endpoint verifies the auth session. It previously performed two redundant MongoDB queries (`isAuth.js` and the controller itself). It was optimized by (1) deduplicating the controller query to reuse `req.user`, and (2) caching the user document in Redis after session validation.

| Metric | Baseline | After | Improvement |
|---|---|---|---|
| **Requests/sec** | 57.1 | **1123** | **+1866%** |
| **Latency p50** | 99 ms | **16 ms** | **−84%** |
| **Latency p97.5**| 886 ms | **25 ms** | **−97%** |
| **Latency p99** | 895 ms | **27 ms** | **−97%** |
| **Mongo queries/req** | 2 | **0** (cache hit) | **−100%** |

---

## 🛠️ Optimizations Applied

### 1. Redundant Query Deduplication
Audited all controllers using the `isAuth` or `adminAuth` middlewares. These middlewares attach a fully populated `req.user` to the request object. 
- **Fixed 4 instances** across `userController.js` and `cartController.js` where the code unnecessarily performed a `User.findById(req.userId)` read despite the data already being in `req.user`.

### 2. Robust Redis Caching Layer
Implemented a resilient `cache.js` utility that silently falls back to MongoDB if Redis becomes unavailable.
- **Product Cache (`products:list`)**: Caches the full inventory list. Flushed proactively on any product mutation (add, update, delete, review).
- **User Cache (`user:<id>`)**: Caches user profiles. Consulted *only after* token validation, session existence, and blacklist checks pass, ensuring revoked tokens are always blocked. Flushed immediately upon user deactivation or role changes.

---

## 🛡️ Safety Verification
A comprehensive automated test suite (`scripts/safety-check.mjs`) ran 18 specific checks to prove the optimizations introduced no regressions:

1. **Cache Correctness**: Confirmed cached product data perfectly matches MongoDB source, and sensitive fields (e.g. `password`) are never exposed in the cached user object.
2. **Deactivation Safety**: Confirmed that when a user is deactivated in the database, the cache is instantly invalidated and the very next request returns 401 Unauthorized.
3. **Graceful Fallback**: Verified that if the Redis server goes offline, the cache utility swallows errors and the application successfully falls back to serving traffic from MongoDB.
4. **Cache Invalidation**: Confirmed that product mutations properly wipe the cache key and trigger a fresh database read on the next request.
5. **Auth Security**: Verified that requests missing cookies, using garbage tokens, or using falsely signed tokens are all correctly rejected with 401s, bypassing the cache entirely.

**Result: 18/18 tests passed.**

---

*Raw artifacts and logs backing these numbers are stored in the `perf/` directory (baseline-product-list.txt, baseline-auth-route.txt, after-product-list.txt, after-auth-route.txt, safety-check-results.json).*
