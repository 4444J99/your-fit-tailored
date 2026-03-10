# Plan: Begin Spec-Driven Development with Speckit

## Summary

Begin implementing the Your-Fit-Tailored platform using speckit workflows. The repository is initialized with theoretical specifications; now we translate those into executable feature specs, implementation plans, and task lists.

## Context

**Repository Status:** Initialized and pushed to GitHub (public)
- `memory/constitution.md` — 6 architectural invariants defined
- `specs/core-system/spec.md` — Full system architecture with 7 subsystems
- `specs/pilot-ops/playbook.md` — Pilot operational procedures

**Available Workflows:**
1. `/speckit.specify <feature>` → Creates `spec.md` + requirements checklist
2. `/speckit.plan [tech-context]` → Creates implementation plan + data model + API contracts
3. `/speckit.tasks` → Generates dependency-ordered executable task list

## Subsystem Priority (from Architecture Analysis)

**Tier 1 — Survival (pilot fails without these):**
1. **State Authority Subsystem** — Canonical entity state, transition contracts
2. **Logistics Orchestration Subsystem** — Weekly cycle fulfillment
3. **User Contract Enforcement Subsystem** — Holds, skips, payment handling

**Tier 2 — Stability:**
4. **Inventory Lifecycle Subsystem** — Condition grading, refurbishment routing
5. **Observability/Audit Subsystem** — Exception triage, reconciliation

**Tier 3 — Learning:**
6. **Fit Intelligence Subsystem** — Probabilistic fit modeling
7. **Experience Minimization Subsystem** — Cognitive load reduction

## Implementation Sequence

Three specs in dependency order:

### Phase 1: State Authority Subsystem (Foundation) ✅ COMPLETE
- Entity state machines for User, Garment, Box, Cycle
- Transition contracts with preconditions/postconditions
- Event sourcing for auditability
- *Blocks:* Everything else depends on correct state

### Phase 2: Weekly Cycle Flow (End-to-End) ✅ COMPLETE
- Complete cycle: scheduling → commitment → fulfillment → return → closeout
- Integrates State Authority + Logistics Orchestration
- *Depends on:* Phase 1 entity definitions

### Phase 3: Pilot MVP (Operational) ✅ COMPLETE
- 25-user pilot operational minimum
- Manual processes + scan discipline + exception handling
- *Depends on:* Phases 1 & 2 for state model and cycle flow

## Tech Stack Decision

**Decision:** No-code/Low-code (Airtable/Retool) for pilot validation → TypeScript + PostgreSQL + Node.js for production migration.

## Generated Artifacts

### Phase 1: State Authority Subsystem
- `specs/features/state-authority/spec.md` - Feature specification
- `specs/features/state-authority/plan.md` - Implementation plan
- `specs/features/state-authority/data-model.md` - Airtable schema
- `specs/features/state-authority/research.md` - Platform decisions
- `specs/features/state-authority/quickstart.md` - Validation scenarios
- `specs/features/state-authority/tasks.md` - 63 tasks
- `specs/features/state-authority/contracts/` - Transition definitions
- `specs/features/state-authority/checklists/requirements.md` - Quality checklist

### Phase 2: Weekly Cycle Flow
- `specs/features/weekly-cycle-flow/spec.md` - Feature specification
- `specs/features/weekly-cycle-flow/plan.md` - Implementation plan
- `specs/features/weekly-cycle-flow/data-model.md` - Additional tables
- `specs/features/weekly-cycle-flow/quickstart.md` - Validation scenarios
- `specs/features/weekly-cycle-flow/tasks.md` - 65 tasks
- `specs/features/weekly-cycle-flow/checklists/requirements.md` - Quality checklist

### Phase 3: Pilot MVP
- `specs/features/pilot-mvp/spec.md` - Feature specification
- `specs/features/pilot-mvp/plan.md` - Implementation plan
- `specs/features/pilot-mvp/quickstart.md` - Launch checklist
- `specs/features/pilot-mvp/tasks.md` - 55 tasks
- `specs/features/pilot-mvp/checklists/requirements.md` - Quality checklist

## Task Summary

| Phase | Feature | Tasks | Status |
|-------|---------|-------|--------|
| 1 | State Authority | T001-T063 | Ready |
| 2 | Weekly Cycle Flow | T101-T165 | Ready |
| 3 | Pilot MVP | T201-T255 | Ready |
| **Total** | | **183 tasks** | |

## Verification

- [x] All three specs align with constitution invariants
- [x] Plans pass constitution gates
- [x] Tasks are dependency-ordered
- [x] Quickstart scenarios defined for each phase

## Next Steps

1. Execute Phase 1 tasks (State Authority)
2. Validate with quickstart scenarios
3. Execute Phase 2 tasks (Weekly Cycle Flow)
4. Validate with quickstart scenarios
5. Execute Phase 3 tasks (Pilot MVP)
6. Complete launch checklist
7. Begin pilot with 25 users
