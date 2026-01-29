# Your-Fit-Tailored

Specification-driven development seed for a circular weekly apparel subscription platform.

## Project Purpose

This repository contains theoretical specifications for a **temporal service** that delivers continuous, low-friction apparel experiences. The system is **not** a retail marketplace—it optimizes for continuity, correctness of state, and stable weekly fulfillment under uncertain fit and logistics.

Users never shop, never decide, and never accumulate garments. The operator maintains a closed-loop inventory that compounds in utilization efficiency over time.

## Domain Model

### Core Entities

All entities are **stateful and non-static**—they evolve with each cycle:

| Entity | Definition | Key Characteristic |
|--------|------------|-------------------|
| **User** | Contract-bearing participant with evolving fit profile | Probabilistic fit-state vector, not demographics |
| **Garment** | Reusable physical asset with lifecycle bounds | Stateful degradation, hygiene history, fit-performance metadata |
| **Box** | Transient container binding outbound/inbound states | Logistics commitment for a cycle |
| **Cycle** | Atomic unit of value creation | One outbound wear period + one inbound recovery period |

### Identifier Conventions

Specs use environment-variable placeholders for tenant/time-scoped identifiers:

- `$TENANT_ID` — Multi-tenant isolation
- `$USER_ID` — User identity
- `$GARMENT_ID` — Physical asset tracking
- `$BOX_ID` — Container tracking
- `$CYCLE_ID` — Temporal contract instance
- `$WEEK_ID` — Derived from user's anchor and platform calendar

## Architectural Invariants

See `memory/constitution.md` for the six non-negotiable invariants that govern all system design:

1. Weekly Cadence Invariant
2. Circular Inventory Invariant
3. State Truth Discipline
4. Explicit Failure Handling
5. Probabilistic Fit
6. Cognitive Load Minimization

## Repository Structure

```
your--fit-tailored/
├── CLAUDE.md              # This file
├── memory/
│   └── constitution.md    # Architectural invariants
├── specs/
│   ├── core-system/       # System architecture specifications
│   ├── economics/         # Business model and unit economics
│   └── pilot-ops/         # Pilot operational playbook
├── research/              # AI research prompts
├── origin/                # Project origin materials
└── assets/                # Spreadsheets, PDFs, supporting files
```

## Development Workflow

This is a **specification-first** repository. Code implementation follows spec approval:

1. **Specify** — Define what must be true (`/speckit.specify`)
2. **Plan** — Design implementation approach (`/speckit.plan`)
3. **Tasks** — Create executable work items (`/speckit.tasks`)
4. **Build** — Implement against specs
5. **Verify** — Validate implementation matches spec

## Key Design Principles

- **Temporal service, not marketplace** — Evaluate on throughput, latency, error recovery, lifecycle yield
- **Fit is probabilistic** — Rolling posterior probability, not deterministic match
- **Weekly cadence is invariant** — Exceptions are explicit state changes, not silent delays
- **Failure is normal** — Design recovery paths, not exception handling
- **Cognitive load → zero** — System defaults for all routine decisions
