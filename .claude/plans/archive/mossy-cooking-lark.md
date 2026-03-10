# Ship & Polish Sprint — Final Phase

## Context

After 5 commits in the Big Beautiful Bow sprint (self-fetch fix, settings wiring, mock guards, migration rename), the repository is feature-complete. 20 commits sit unpushed on master, and 22 resolved GitHub issues remain open. This plan ships everything and ties up loose ends.

**Already done** (discovered during verification):
- `docs/DEPLOYMENT.md` already exists (25KB, comprehensive)
- `apps/api/test/user-settings.test.ts` already exists
- CI workflow already has `--frozen-lockfile`, Node 22, pnpm 10
- Docker health checks already configured on all services
- Only 4 TODOs remain in the entire codebase (down from 12)

---

## Track 1: Push & Close Issues

### Step 1: Push 20 unpushed commits

```bash
git push origin master
```

### Step 2: Batch-close 22 resolved GitHub issues

Close with comment "Resolved in master — see seed alignment gap resolution commits":

| Issues to Close |
|----------------|
| #24-#36 (G1-G13), #38-#43 (G15-G20), #45-#47 (G22-G24) |

Leave open with status update comments:
- **#37** (G14) — "Serper web search works; LinkedIn/Indeed deferred pending commercial API access"
- **#44** (G21/§5.3) — "Worker queue handles all current use cases; full autonomous loop deferred"
- **#48** (G25) — "Local FS artifact storage works; cloud S3/GCS is a future enhancement"

---

## Track 2: Test Coverage for Untested Middleware

### Commit 1: Add middleware tests

**Files without test coverage**:

| Middleware | Path | Tests Needed |
|-----------|------|-------------|
| `require-admin.ts` | `apps/api/src/middleware/require-admin.ts` | Role check passes, non-admin rejected (403), missing user rejected (401) |
| `feature-gate.ts` | `apps/api/src/middleware/feature-gate.ts` | Enabled flag passes, disabled flag rejected, missing flag behavior |

Create:
- `apps/api/test/require-admin.test.ts`
- `apps/api/test/feature-gate.test.ts`

Use Fastify `.inject()` pattern matching existing test files (e.g., `user-settings.test.ts`).

---

## Track 3: TODO Cleanup

### Commit 2: Resolve remaining 4 TODOs

| File | Line | TODO | Action |
|------|------|------|--------|
| `apps/api/src/routes/integrations/operations.ts` | 117 | "Enqueue task in orchestrator" | Convert to descriptive comment: "Task enqueueing deferred — orchestrator integration via HTTP webhook" |
| `apps/api/src/routes/artifacts.ts` | 330 | "Create ContentEdge in Phase 6+" | Convert to: "ContentEdge creation deferred to graph DB integration phase" |
| `packages/core/src/integrations/local-fs-integration.ts` | 561 | "Compute actual SHA256 hash" | Implement — use `crypto.createHash('sha256')` on file buffer |
| `packages/core/src/integrations/local-fs-integration.ts` | 568 | "Use proper glob library" | Convert to: "Glob matching uses basic string includes; upgrade to minimatch if patterns grow complex" |

The SHA256 TODO (line 561) is the only one worth implementing — it's a 3-line fix using Node's built-in crypto.

---

## Track 4: Docker Compose Prod Hardening

### Commit 3: Redis auth + env documentation update

**File**: `infra/docker-compose.prod.yml`

1. Add `requirepass` to Redis service command (or `REDIS_PASSWORD` env) so prod Redis isn't open
2. Wire `REDIS_URL` in API/orchestrator to include auth: `redis://:${REDIS_PASSWORD}@redis:6379`

**File**: `docs/DEPLOYMENT.md`

3. Add `REDIS_PASSWORD` to required env vars section (doc already exists, just needs this addition)

---

## Execution Order

1. **Track 1** — Push + close issues (no code changes, zero risk)
2. **Track 2** — Middleware tests (commit 1)
3. **Track 3** — TODO cleanup + SHA256 fix (commit 2)
4. **Track 4** — Redis auth hardening (commit 3)

---

## File Summary

| Action | File | Commit |
|--------|------|--------|
| Push | 20 unpushed commits | -- |
| Close | 22 GitHub issues via `gh` | -- |
| Create | `apps/api/test/require-admin.test.ts` | 1 |
| Create | `apps/api/test/feature-gate.test.ts` | 1 |
| Modify | `apps/api/src/routes/integrations/operations.ts` | 2 |
| Modify | `apps/api/src/routes/artifacts.ts` | 2 |
| Modify | `packages/core/src/integrations/local-fs-integration.ts` | 2 |
| Modify | `infra/docker-compose.prod.yml` | 3 |
| Modify | `docs/DEPLOYMENT.md` | 3 |

---

## Verification

1. `pnpm test` — all existing + new tests pass
2. `pnpm typecheck` — zero errors
3. `docker compose -f infra/docker-compose.prod.yml config` — validates compose syntax
4. `gh issue list --state open` — only 3 remaining (#37, #44, #48)
5. `git log --oneline origin/master..master` — 0 unpushed after Track 1

---

## What We're NOT Changing

| Category | Reason |
|----------|--------|
| ESLint-disable comments (~35 files) | Pre-existing; touching triggers lint-staged cascade |
| `as any` casts (~50) | CJS/ESM boundary limitations |
| G14 LinkedIn/Indeed | Commercial API requirement, not code |
| G25 Cloud storage | Local FS viable for single-server |
| §5.3 Autonomous loop | Worker queue covers all current use cases |
| `docs/DEPLOYMENT.md` rewrite | Already 25KB and comprehensive |
| CI workflow changes | Already correct (Node 22, pnpm 10, frozen-lockfile) |
