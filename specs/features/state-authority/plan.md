# Implementation Plan: State Authority Subsystem

**Branch**: `001-state-authority` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/features/state-authority/spec.md`

## Summary

Implement the canonical state management system for User, Garment, Box, and Cycle entities using Airtable as the state store with Retool as the operator interface. State transitions are enforced via Airtable Automations with validation logic, events are logged to an append-only Events table, and Retool provides scan-to-state workflows for warehouse operations.

## Technical Context

**Platform**: Airtable (state storage) + Retool (operator UI)
**Language/Version**: Airtable formulas + Retool JavaScript (ES6+)
**Primary Dependencies**: Airtable Pro (automations), Retool (mobile for scanning)
**Storage**: Airtable bases with linked records
**Testing**: Manual validation scenarios + Retool test workflows
**Target Platform**: Web (Retool) + Mobile (Retool Mobile for warehouse scanning)
**Performance Goals**: <2s state transition response, <5s for complex queries
**Constraints**: Airtable rate limits (5 req/sec), 50k records per base (pilot scale)
**Scale/Scope**: 25 users, ~500 garments, ~100 cycles/month (pilot)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### §1 Weekly Cadence Invariant
- **PASS**: CycleEntity state machine enforces one cycle per user/week via unique constraint on (user_id, week_id).
- **Implementation**: Airtable formula field creates composite key; automation rejects duplicates.

### §2 Circular Inventory Invariant
- **PASS**: GarmentEntity transitions enforced by automation precondition checks.
- **Implementation**: `current_cycle_id` field prevents double-allocation; state machine diagram encoded in validation.

### §3 State Truth Discipline
- **PASS**: Single Airtable base is source of truth; all changes logged to Events table.
- **Implementation**: Automations create event record before state change commits.
- **Note**: External carrier signals are recorded as inputs, not authoritative.

### §4 Explicit Failure Handling
- **PASS**: Validation errors create rejection events with specific codes.
- **Implementation**: Retool shows actionable error messages; Events table logs all rejections.

### §5 Probabilistic Fit
- **N/A**: State Authority does not handle fit logic; fit_profile_reference is a pointer.

### §6 Cognitive Load Minimization
- **PASS**: Operators use simple scan workflows; state complexity is hidden.
- **Implementation**: Retool interface shows only current state and valid next actions.

## Project Structure

### Documentation (this feature)

```
specs/features/state-authority/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Platform decision rationale
├── data-model.md        # Airtable schema definitions
├── quickstart.md        # Validation scenarios
├── contracts/           # State transition definitions
│   ├── garment-transitions.md
│   ├── cycle-transitions.md
│   ├── user-transitions.md
│   └── box-transitions.md
├── checklists/
│   └── requirements.md  # Quality validation
└── tasks.md             # Implementation task list
```

### Airtable Base Structure

```
Base: YFT-StateAuthority
├── Tables/
│   ├── Users              # UserEntity state
│   ├── Garments           # GarmentEntity state
│   ├── Boxes              # BoxEntity state
│   ├── Cycles             # CycleEntity state
│   ├── Events             # Append-only audit log
│   ├── TransitionRules    # State machine definitions
│   └── LookupTables/
│       ├── States         # Valid states per entity type
│       └── ErrorCodes     # Validation error definitions
├── Automations/
│   ├── ValidateGarmentTransition
│   ├── ValidateCycleTransition
│   ├── ValidateUserTransition
│   ├── ValidateBoxTransition
│   ├── LogTransitionEvent
│   └── EnforceLifecycleBounds
└── Interfaces/
    └── (Retool handles UI)
```

### Retool Application Structure

```
Retool Apps/
├── YFT-WarehouseOps/
│   ├── GarmentScanner      # Scan → state transition workflow
│   ├── BoxPacker           # Packing with variance detection
│   └── InspectionStation   # Return inspection workflow
├── YFT-AdminConsole/
│   ├── EntityBrowser       # Query any entity state
│   ├── EventViewer         # Audit trail browser
│   └── CycleManager        # Manual cycle operations
└── YFT-Mobile/
    └── ScanApp             # Mobile barcode scanning
```

**Structure Decision**: No-code architecture with Airtable as database/automation engine and Retool as UI layer. This enables rapid iteration during pilot without engineering overhead. State machine logic lives in Airtable Automations with validation scripts.

## Complexity Tracking

*No constitution violations. Pilot-appropriate simplicity achieved.*

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Airtable vs PostgreSQL | Pilot speed; visual debugging; non-engineer iteration | PostgreSQL requires deployment, migrations, API layer |
| Retool vs Custom UI | Built-in mobile scanning; rapid forms; no frontend build | Custom React requires engineering; delays pilot |
| Automations vs Code | Visual state machine; easy modification; audit built-in | Custom code requires deployment, testing infrastructure |
