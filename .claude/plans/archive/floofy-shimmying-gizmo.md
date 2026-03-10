# Plan: Test Fixes, Auth Hardening, Stub Completion

**Date:** 2026-02-06 | **Branch:** master | **Latest:** `7451481d`

---

## Phase 1: Fix Test Suite (~132 failing → 0)

### Root Cause
Commit `b33aeb22` added a global JWT `onRequest` hook in `buildServer()`. Tests calling `buildServer()` directly get 401s because they don't provide JWT tokens. The existing `buildTestApp()` helper already has a mock auth bypass — tests just need to use it.

### 1.1 Migrate 8 test files from `buildServer` → `buildTestApp`

| Test File | Current | Fix |
|-----------|---------|-----|
| `apps/api/test/cv.test.ts` | `buildServer` | → `buildTestApp` |
| `apps/api/test/cv_entities.test.ts` | `buildServer` | → `buildTestApp` |
| `apps/api/test/backups.test.ts` | `buildServer` | → `buildTestApp` |
| `apps/api/test/versioning.test.ts` | `buildServer` | → `buildTestApp` |
| `apps/api/test/artifacts.test.ts` | `buildServer` | → `buildTestApp` |
| `apps/api/test/masks.test.ts` | `buildServer` | → `buildTestApp` (may already pass via optional auth) |
| `apps/api/test/performance.test.ts` | `buildServer` | → `buildTestApp` |
| `apps/api/test/redaction.test.ts` | `buildServer` | → `buildTestApp` |

**Pattern per file:**
1. Change import: `import { buildServer } from "../src"` → `import { buildTestApp } from "./app-builder"`
2. Replace `buildServer({...})` calls with `await buildTestApp({...})`
3. Note: `buildTestApp` is async, `buildServer` is sync — add `await`
4. `buildTestApp` creates its own repos (maskRepo, cvRepos, backupRepo) so passing only profileRepo is sufficient for most tests

**Key file:** `apps/api/test/app-builder.ts` — already exports `buildTestApp()` with mock auth hook (default admin user + x-mock-user-id/x-mock-roles header support)

**Special case:** `profiles.test.ts` already uses `buildTestApp` for main tests but has one `buildServer` call at line 183 for error testing — needs special handling (provide a valid JWT or switch to `buildTestApp` with a failing repo).

### 1.2 Fix non-auth test failures

- `hunter-protocol.integration.test.ts` — already uses `buildTestApp` but fails with "Profile creation failed: undefined". Investigate test fixture setup.
- `webhook-fulfillment.integration.test.ts` — data access error at line 48. Read file, diagnose.

### Verification
```bash
pnpm --filter @in-midst-my-life/api test
# Expect: 0 failures (excluding infra-dependent integration tests that skip gracefully)
```

**Commit:** `test: migrate failing tests to buildTestApp auth helper`

---

## Phase 2: Auth Hardening

### 2.1 Improve global auth hook in `index.ts`

**File:** `apps/api/src/index.ts` (lines ~325-365)

Current flaw: exact path matching (`publicRoutes.has(url)`) doesn't handle parameterized routes. A request to `/profiles/abc123` doesn't match `/profiles` in the set.

**Fix strategy:** Tighten the allowlist to be explicit about what's public:

```
Public (no auth):
  /health, /ready, /metrics                    — system routes (outside auth scope already)
  /billing/webhooks/stripe                      — Stripe signature verification
  /agent/v1/query                               — agent bearer token auth

Public reads (GET only, optional auth):
  GET /taxonomy/masks, /taxonomy/epochs, /taxonomy/stages  — browsing
  GET /billing/plans                             — pricing info
  GET /public-profiles, /public-profiles/:slug, /public-profiles/search  — public directory

Everything else → require JWT (authMiddleware)
```

The key fix: use **prefix matching** for public-profiles paths and **exact matching** for everything else. All `/profiles/:id/*` routes (CV, narratives, exports, backups) require JWT by default.

### 2.2 Add ownership middleware to profile-scoped routes (P0/P1)

**Middleware:** `createOwnershipMiddleware()` from `apps/api/src/middleware/auth.ts`
- Extracts `profileId` or `id` from `request.params` (also checks `request.body`)
- Returns 401 if no user, 403 if user doesn't own resource
- Admin bypass built-in

**Files to add ownership middleware (7 files):**

| File | LOC | Endpoints | Strategy |
|------|-----|-----------|----------|
| `apps/api/src/routes/cv.ts` | 403 | ~50 | Plugin-level `addHook('onRequest', ownership)` — all CV ops are profile-scoped |
| `apps/api/src/routes/curriculum-vitae-multiplex.ts` | 448 | ~15 | Same plugin-level hook |
| `apps/api/src/routes/narratives.ts` | 453 | ~8 | Same plugin-level hook |
| `apps/api/src/routes/exports.ts` | 548 | ~6 | Same plugin-level hook |
| `apps/api/src/routes/backups.ts` | 306 | ~4 | Same plugin-level hook |
| `apps/api/src/routes/artifacts.ts` | 379 | ~6 | Same plugin-level hook |
| `apps/api/src/routes/attestation-blocks.ts` | 78 | ~4 | Same plugin-level hook |

**Implementation pattern** (same for all 7):
```typescript
import { createOwnershipMiddleware } from '../middleware/auth';

// Inside plugin registration function:
const ownershipCheck = createOwnershipMiddleware();
fastify.addHook('onRequest', ownershipCheck);
// ... existing routes unchanged
```

This works because all these route files are registered as Fastify plugins with a `/profiles/:profileId` prefix — the hook applies to all routes within the plugin scope.

### 2.3 Add admin middleware to taxonomy mutations (P2)

**File:** `apps/api/src/routes/masks.ts` (254 LOC)

GETs remain public. POST/PATCH/DELETE get `onRequest: [adminCheck]`:

```typescript
import { createAdminMiddleware } from '../middleware/require-admin';
const adminCheck = createAdminMiddleware();

// Per-route, on mutations only:
fastify.post('/taxonomy/masks', { onRequest: [adminCheck] }, handler);
fastify.patch('/taxonomy/masks/:id', { onRequest: [adminCheck] }, handler);
fastify.delete('/taxonomy/masks/:id', { onRequest: [adminCheck] }, handler);
// Same for epochs and stages
```

### 2.4 Fix developer API fallbacks (P3)

**File:** `apps/api/src/routes/developer-api.ts` (526 LOC)

Remove all `request.user?.id || 'user-id'` fallbacks. With global auth enforced, `request.user` is guaranteed to exist. Replace with:
```typescript
const userId = request.user!.sub;  // or request.user!.profileId
```

### 2.5 Update tests for auth changes

After adding ownership, some `buildTestApp` tests may need `x-mock-user-id` headers matching the profileId they're accessing. Update test fixtures to include proper ownership.

### Verification
```bash
pnpm --filter @in-midst-my-life/api test
# All tests still pass with auth changes
```

**Commits:**
- `feat: enforce secure-by-default JWT auth on all routes`
- `feat: add ownership middleware to profile-scoped routes`
- `feat: protect taxonomy mutations with admin middleware`
- `fix: remove auth fallbacks in developer API`

---

## Phase 3: Complete Stubs

### 3.1 Timeline GraphQL resolvers

**File:** `apps/api/src/services/graphql-resolvers.ts` (lines 99-120)

**Important:** `renderTimeline()` and `renderTimelineForMask()` from content-model are **sort/filter** functions — they take `TimelineEntry[]` as input, NOT profiles. The resolvers need to first **construct** entries from CV data.

**Strategy:**
1. Add `cvRepos` to `GraphQLContext` interface
2. Build `TimelineEntry[]` from CV experiences, education, projects (map CV entity → TimelineEntry)
3. Pass constructed entries through `renderTimeline()` / `renderTimelineForMask()`

**Key functions to reuse:**
- `renderTimeline(entries, order)` — `packages/content-model/src/timeline.ts:310`
- `renderTimelineForMask(entries, mask, options)` — `packages/content-model/src/timeline.ts:339`

**CV repos needed:** `experiences`, `educations`, `projects` from existing `CvRepos` type

### 3.2 Narrative generation wiring

**File:** `apps/api/src/routes/narratives.ts` (lines 160-224)

**Currently:** Returns mock `TabulaPersonarumEntry` and mock narrative blocks.
**Wire to:** `buildWeightedNarrative(view)` from `packages/content-model/src/narrative.ts:460`

Also wire `generateNarrative` GraphQL resolver in `graphql-resolvers.ts` (lines 122-173) to call `buildNarrativeOutput()` from content-model.

**Key functions to reuse:**
- `applyMask(config)` — `packages/content-model/src/narrative.ts:143`
- `buildWeightedNarrative(view)` — `packages/content-model/src/narrative.ts:460`
- `buildNarrativeOutput(view)` — `packages/content-model/src/narrative.ts:468`

### 3.3 Narrative snapshot persistence

**File:** `apps/api/src/services/graphql-resolvers.ts` (lines 175-181)

`narrativeSnapshot()` and `narrativeSnapshots()` return null/[]. Wire to existing `NarrativeRepo` (check `apps/api/src/repositories/narratives.ts`). Add `narrativeRepo` to GraphQL context.

### 3.4 Local FS checksums and glob matching

**File:** `packages/core/src/integrations/local-fs-integration.ts`

- Line 561: Replace base64 stub with `crypto.createHash('sha256')` from `node:crypto`
- Line 568: Replace regex hack with `minimatch` library (add to `packages/core/package.json`)

### 3.5 Artifact sync scheduler

**File:** `apps/orchestrator/src/artifact-sync-scheduler.ts` (lines 66-91)

Replace stub task with real API queries:
1. Fetch profiles from API
2. For each profile, fetch active integrations
3. Enqueue `artifact_sync_incremental` tasks with real metadata

### Deferred (not in this plan)
- GraphQL subscriptions (requires WebSocket + Redis PubSub infrastructure)
- Share dialog UI (UX feature, not critical path)
- ZIP download (backend bundling service)
- ContentEdge creation (requires new graph DB table)

### Verification
```bash
pnpm typecheck          # All packages pass
pnpm test               # All unit tests pass
pnpm --filter core test # FS integration tests
```

**Commits:**
- `feat: wire timeline GraphQL resolvers from CV data`
- `feat: implement narrative generation and snapshot persistence`
- `feat: implement SHA256 checksums and glob matching`
- `feat: wire artifact sync scheduler to API`

---

## Execution Order

```
Phase 1 (tests) ─── MUST be first (safety net)
    │
    ▼
Phase 2.1 (global auth) ── Foundation for all auth work
    │
    ├─► Phase 2.2 (ownership) ─┐
    ├─► Phase 2.3 (admin)      ├─► Phase 2.5 (update tests)
    └─► Phase 2.4 (dev API)   ─┘
                                    │
                                    ▼
                              Phase 3 (stubs) ── Can parallelize 3.1-3.5
```

**Total: ~8-10 commits, 3 phases**

## Critical Files Summary

### Must Read Before Editing
- `apps/api/test/app-builder.ts` — mock auth pattern
- `apps/api/src/middleware/auth.ts` — all middleware functions
- `apps/api/src/middleware/require-admin.ts` — admin middleware
- `apps/api/src/index.ts` — global auth hook (lines 325-365)
- `packages/content-model/src/timeline.ts` — renderTimeline signatures
- `packages/content-model/src/narrative.ts` — buildWeightedNarrative signature

### Files Modified (by phase)
**Phase 1:** 8-10 test files in `apps/api/test/`
**Phase 2:** `index.ts`, `cv.ts`, `curriculum-vitae-multiplex.ts`, `narratives.ts`, `exports.ts`, `backups.ts`, `artifacts.ts`, `attestation-blocks.ts`, `masks.ts`, `developer-api.ts`
**Phase 3:** `graphql-resolvers.ts`, `narratives.ts`, `local-fs-integration.ts`, `artifact-sync-scheduler.ts`
