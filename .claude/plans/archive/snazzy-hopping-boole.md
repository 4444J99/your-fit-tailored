# Plan: Root Declutter, Inverted Interview Alignment & Role-Curated Masks

## Context

The project is feature-complete (68+ commits, zero open issues/PRs), but three concerns remain:

1. **Root clutter**: 35 visible items in the root directory — user wants ~10
2. **Inverted Interview prominence**: The north-star vision (employer answers candidate's questions, system assembles role-specific view) lives in `docs/INVERTED-INTERVIEW.md` but isn't prominent in README or reflected in the mask system
3. **Role-curated masks**: 16 archetypal masks score well for abstract contexts, but the system doesn't understand "Senior Frontend Engineer" ≈ "UI Developer" ≈ "React Lead" are the same role family. An employer should state their role and the CV should assemble for that role family.

Three commits.

---

## Commit 1: Declutter root directory

**Message**: `chore: declutter root — move docs and configs`

### What stays at root (required by tools)

| Item | Why |
|------|-----|
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | pnpm requires root |
| `tsconfig.json` | TypeScript project references |
| `turbo.json` | Turborepo requires root |
| `eslint.config.mjs` | ESLint 9 flat config requires cwd |
| `vitest.config.ts` | Vitest workspace config |
| `.release-please-manifest.json`, `release-please-config.json` | release-please requires root |
| `README.md`, `LICENSE` | GitHub conventions |
| `.gitignore`, `.github/`, `.husky/`, `.envrc`, `.dockerignore` | Dotfiles (hidden by default) |
| `apps/`, `packages/`, `docs/`, `infra/`, `scripts/` | Core directories |

### What moves

| File | Destination | Notes |
|------|-------------|-------|
| `.commitlintrc.json` | **Deleted** — inline into `package.json` `"commitlint"` key | commitlint supports package.json config |
| `.prettierrc` | **Deleted** — inline into `package.json` `"prettier"` key | Prettier supports package.json config |
| `.lighthouserc.js` | `config/.lighthouserc.js` | CI already uses `--config` flag |
| `CONTRIBUTING.md` | `docs/CONTRIBUTING.md` | Update README link |
| `CODE_OF_CONDUCT.md` | `docs/CODE_OF_CONDUCT.md` | Update README link |
| `CODEOWNERS` | `.github/CODEOWNERS` | GitHub's preferred location |
| `CHANGELOG.md` | `docs/CHANGELOG.md` | Update release-please-config `changelog-path` |
| `seed.yaml` | `docs/seed.yaml` | Update 16 doc references |
| `secrets.env.op.sh` | `scripts/secrets.env.op.sh` | Update `.envrc` path |

### Post-move root (visible, non-dotfile)

```
README.md  LICENSE  package.json  pnpm-lock.yaml  pnpm-workspace.yaml
tsconfig.json  turbo.json  eslint.config.mjs  vitest.config.ts
release-please-config.json
apps/  packages/  docs/  infra/  scripts/  config/
```

**16 visible items** (down from 35). The release-please files must stay, and the 4 tool configs (`tsconfig`, `turbo`, `eslint`, `vitest`) cannot move. This is the realistic minimum without breaking toolchain contracts.

### Files modified

- `package.json` — add `"commitlint"` and `"prettier"` keys
- `.envrc` — update secrets path
- `release-please-config.json` — update `changelog-path`
- `README.md` — update links to moved files
- `CLAUDE.md` — update references
- `.github/workflows/test.yml` — update lighthouserc path if referenced
- ~16 doc files referencing `seed.yaml` — update path to `docs/seed.yaml`

---

## Commit 2: Reorient README around the Inverted Interview

**Message**: `docs: reframe project around inverted interview paradigm`

### README restructure

Replace current opening with Inverted Interview-first framing:

```markdown
## The Vision: The Inverted Interview

In a traditional hiring process, the employer asks all the questions. This project
inverts that dynamic: **the employer becomes the interviewee**.

A recruiter or hiring manager visits the candidate's link, answers questions about
their role, team, and culture — and the system assembles a CV view curated specifically
for what they're seeking. The candidate's complete identity is a structured ledger;
what the employer sees is a dynamically filtered, role-specific snapshot.

This is not deception. It is **strategic curation** — the same person, presented
through the lens most relevant to the opportunity.
```

Nest existing Problem/Approach/Outcome under "## How It Works", subordinate to the vision.

### Other docs

- `docs/INVERTED-INTERVIEW.md` — add "Implementation Status" section (what's built vs. planned)
- `docs/seed.yaml` — ensure north-star features inverted interview prominently
- `CLAUDE.md` — add Inverted Interview to Repository Overview

### Files modified
- `README.md`, `docs/INVERTED-INTERVIEW.md`, `docs/seed.yaml`, `CLAUDE.md`

---

## Commit 3: Role-family mapping for curated mask selection

**Message**: `feat(content-model): role-family mapping for curated mask selection`

### Problem

`analyzeMaskResonance()` in `packages/content-model/src/compatibility.ts:438-487` scores all 16 archetypal masks against job title keywords. "Senior Frontend Engineer", "UI Developer", and "React Lead" activate different masks despite being the same role. No concept of role equivalence exists.

### Solution: Role-Family Taxonomy

**New file**: `packages/content-model/src/role-families.ts`

```typescript
export interface RoleFamily {
  id: string;
  name: string;                    // "Frontend Engineering"
  aliases: string[];               // ["frontend engineer", "ui developer", "react developer", ...]
  maskBlend: Array<{              // Ordered mask preferences
    maskId: string;
    weight: number;                // 0-1, relative importance
  }>;
  emphasisTags: string[];         // Profile sections to highlight
  deEmphasisTags: string[];       // Sections to downplay
}
```

**10 role families** covering the most common tech roles:
1. Frontend Engineering — architect (0.35), artisan (0.30), integrator (0.20), analyst (0.15)
2. Backend Engineering — architect (0.35), analyst (0.25), steward (0.20), executor (0.20)
3. Full-Stack Engineering — integrator (0.30), architect (0.25), executor (0.25), analyst (0.20)
4. Engineering Management — steward (0.30), strategist (0.25), mediator (0.25), narrator (0.20)
5. DevOps / SRE — custodian (0.30), architect (0.25), executor (0.25), calibrator (0.20)
6. Data Engineering — analyst (0.35), architect (0.25), synthesist (0.20), observer (0.20)
7. Product Design — artisan (0.35), observer (0.25), narrator (0.20), mediator (0.20)
8. Product Management — strategist (0.30), synthesist (0.25), narrator (0.25), mediator (0.20)
9. Security Engineering — custodian (0.30), analyst (0.30), observer (0.20), calibrator (0.20)
10. Technical Consulting — interpreter (0.30), mediator (0.25), narrator (0.25), strategist (0.20)

**Matching function**: `matchRoleFamily(jobTitle: string): RoleFamily | undefined`
- First pass: substring match against aliases
- Second pass: fuzzy word-overlap (≥50% overlap ratio)
- Returns `undefined` if no match → falls back to existing keyword scoring

### Integration into `analyzeMaskResonance()`

```typescript
// At top of analyzeMaskResonance():
const roleFamily = matchRoleFamily(interviewer.jobTitle);

if (roleFamily) {
  // Role-curated path: use family's mask blend directly
  return roleFamily.maskBlend.map((blend) => {
    const mask = MASK_TAXONOMY.find((m) => m.id === blend.maskId);
    return {
      maskName: mask?.name ?? blend.maskId,
      fitScore: Math.round(blend.weight * 100),
      reasoning: `${mask?.name} curated for ${roleFamily.name} role family`,
    };
  });
}
// else: fall through to existing keyword-based scoring (unchanged)
```

### Files

| Action | File |
|--------|------|
| **New** | `packages/content-model/src/role-families.ts` |
| **New** | `packages/content-model/src/__tests__/role-families.test.ts` |
| Edit | `packages/content-model/src/compatibility.ts` — import + use role families |
| Edit | `packages/content-model/src/index.ts` — re-export |

### Tests

- `matchRoleFamily("Senior Frontend Engineer")` → frontend-engineering
- `matchRoleFamily("React Developer")` → frontend-engineering
- `matchRoleFamily("UI Developer")` → frontend-engineering (same family!)
- `matchRoleFamily("DevOps Engineer")` → devops-sre
- `matchRoleFamily("Chief Happiness Officer")` → undefined (falls back)
- `analyzeMaskResonance` with role-family match returns blended masks
- `analyzeMaskResonance` without match returns keyword-scored masks (backward compat)

---

## Verification

```bash
# After Commit 1
ls -1 | wc -l                                          # ~16 visible items
pnpm lint && pnpm build && pnpm test                   # all pass

# After Commit 2
grep -c "Inverted Interview" README.md                 # ≥1

# After Commit 3
pnpm --filter @in-midst-my-life/content-model test     # role-family tests pass
pnpm typecheck && pnpm build                           # clean
```

## Risk Assessment

| Item | Risk | Mitigation |
|------|------|-----------|
| Moving root files | Medium | Only move files with confirmed tool support for non-root locations |
| seed.yaml references (16 files) | Medium | Grep + batch update; these are doc-only references (no runtime imports) |
| Role-family matching | Low | Fallback to existing keyword scoring if no match; additive, not replacing |
| release-please changelog-path | Low | Documented config option, tested by CI |
