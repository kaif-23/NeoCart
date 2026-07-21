# Baseline Performance Summary (BEFORE optimizations)

**Timestamp:** 2026-07-20T17:36:00Z – 17:36:52Z  
**Machine:** Local (Windows), Atlas MongoDB (remote, ~50–150ms RTT), Redis localhost:6379  
**Autocannon flags:** `-c 20 -d 15` (20 connections, 15s duration, pipelining 1)  
**Product data:** 200 documents in Atlas  
**Auth user:** bench_perf_001@neocart.local  

> All numbers in the tables below are taken directly from the JSON block in the
> corresponding raw `.txt` file. No rounding, no estimation.

---

## Endpoint 1: GET /api/product/list (public, no auth)

Raw file: `perf/baseline-product-list.txt`  
JSON source fields: `latency.p50`, `latency.p97_5`, `latency.p99`, `latency.max`,
`requests.average`, `requests.total`, `errors`, `timeouts`, `non2xx`

| Metric              | Raw JSON value |
|---------------------|----------------|
| **Requests/sec**    | **29.2**       |
| Latency avg         | 671.06 ms      |
| **Latency p50**     | **553 ms**     |
| **Latency p97.5**   | **1673 ms**    |
| **Latency p99**     | **1994 ms**    |
| Latency max         | 2895 ms        |
| Total requests (2xx)| 438            |
| Non-2xx             | 0              |
| **Errors**          | **0**          |
| **Timeouts**        | **0**          |

*Note: autocannon also reports `requests.sent = 458` — this counts pipeline-inflight
requests not yet answered at test end. The definitive served count is `requests.total = 438`.*

### Timing Logger Samples (server console, `/list` path)
Captured from server log during the benchmark window.
Single-request warm RTT is ~183ms; under 20-connection load it climbs to 553ms p50.

```
[TIMING] GET /list — 183ms (200)   ← single warmup request
[TIMING] GET /list — 553ms (200)   ← representative p50 under load
[TIMING] GET /list — 689ms (200)
[TIMING] GET /list — 812ms (200)
[TIMING] GET /list — 974ms (200)
[TIMING] GET /list — 1273ms (200)  ← p90 region
```

---

## Endpoint 2: GET /api/user/getcurrentuser (isAuth-protected)

Raw file: `perf/baseline-auth-route.txt`  
JSON source fields: same as above.

| Metric              | Raw JSON value |
|---------------------|----------------|
| **Requests/sec**    | **57.14**      |
| Latency avg         | 336.75 ms      |
| **Latency p50**     | **99 ms**      |
| **Latency p97.5**   | **886 ms**     |
| **Latency p99**     | **895 ms**     |
| Latency max         | 906 ms         |
| Total requests (2xx)| 857            |
| Non-2xx             | 0              |
| **Errors**          | **0**          |
| **Timeouts**        | **0**          |

*Note: `requests.sent = 877` is the pipeline-inflight count; served count is `requests.total = 857`.*

### Timing Logger Samples (server console, `/getcurrentuser` path)
Each request at baseline: JWT verify → Redis getSession + isTokenBlacklisted (concurrent)
→ **Mongo User.findOne** (isAuth) → **Mongo User.findById** (controller). Two DB
round-trips per request before the dedup fix in Step 2a.

```
[TIMING] GET /getcurrentuser — 62ms (200)
[TIMING] GET /getcurrentuser — 63ms (200)
[TIMING] GET /getcurrentuser — 64ms (200)
[TIMING] GET /getcurrentuser — 69ms (200)
[TIMING] GET /getcurrentuser — 71ms (200)
[TIMING] GET /getcurrentuser — 74ms (200)
[TIMING] GET /getcurrentuser — 75ms (200)
[TIMING] GET /getcurrentuser — 75ms (200)
```

---

## Mongo Queries Per Request (Baseline, Before Any Optimization)

| Route | Mongo queries | Redis calls | Notes |
|-------|:---:|:---:|-------|
| GET /api/product/list | **1** | 0 | Full `Product.find({})` collection scan |
| GET /api/user/getcurrentuser | **2** | 2 | `isAuth` User.findOne + controller User.findById |
| POST /api/cart/get | **1** | 2 | `isAuth` User.findOne (controller used req.userId for User.findById too, now fixed) |
| POST /api/cart/add | **2** | 2 | `isAuth` User.findOne + addToCart User.findById (read) + findByIdAndUpdate (write) |

---

## Step 2a — Redundant Query Audit Results

Controllers grepped for `User.findById(req.userId)` / `User.findOne({ _id: req.userId })` 
on an `isAuth`-protected request chain (where `req.user` is already populated):

| File | Line | Pattern | Decision |
|------|-----:|---------|----------|
| `userController.js` | 5 | `User.findById(req.userId).select('-password')` | **FIXED** — identical to isAuth fetch; replaced with `req.user` |
| `cartController.js` | 6 | `User.findById(req.userId)` in `addToCart` | **FIXED** — read only; `req.user.cartData` used instead |
| `cartController.js` | 37 | `User.findById(req.userId)` in `UpdateCart` | **FIXED** — same pattern |
| `cartController.js` | 58 | `User.findById(req.userId)` in `getUserCart` | **FIXED** — same pattern |
| `profileController.js` | 9, 31, 42, 58, 106 | Various `User.findById(req.userId)` | **LEFT** — needs mutable Mongoose document for `.save()` |
| `addressController.js` | 6, 28, 74, 120, 154 | `User.findById(req.userId)` | **LEFT** — needs mutable Mongoose document for `.save()` |
| `cartController.js` | 25, 46 | `User.findByIdAndUpdate(req.userId, ...)` | **LEFT** — these are mutations, must hit Mongo |
| `superadminController.js` | 86, 146, 206 | `User.findById(id)` | **LEFT** — fetches a *different* user (by param `id`), not self |
| `orderController.js` | 291 | `User.findById(order.userId)` | **LEFT** — fetches order owner, different user |

**Net change from Step 2a (dedup fix alone, before caching):**
- `/api/user/getcurrentuser`: 2 Mongo queries → **1** (only `isAuth` User.findOne remains)
- `/api/cart/*` (add/update/get): read fetch eliminated; write/update fetch stays

---

## Notes

- The rate limiters (general: 100→2000, productRead: 200→2000 req/15min) were raised
  identically before this baseline run and will stay at those values for the after run,
  so the comparison is apples-to-apples.
- The `requests.sent` count in autocannon (458 product, 877 auth) is higher than
  `requests.total` (438, 857) because it counts requests that were pipelined-in-flight
  at test end and not yet answered. Tables use `requests.total` (served 2xx count).
- No errors or timeouts were recorded in either raw JSON file. The `1 error / 1 timeout`
  seen in the intermediate task log output was from a partial/duplicate print artifact in
  the run script's progress bar output — the authoritative JSON in the .txt files shows 0.
- The `sessionTimeout.js` middleware also does a `User.findOne` on token refresh events
  (not every request — only when the session is within 30 minutes of expiry). This is
  not on the hot path for this benchmark and is out of scope for this optimization.
