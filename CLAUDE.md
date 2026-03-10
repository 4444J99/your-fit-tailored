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

<!-- ORGANVM:AUTO:START -->
## System Context (auto-generated — do not edit)

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** PUBLIC_PROCESS
**Org:** `organvm-iii-ergon` | **Repo:** `your-fit-tailored`

### Edges
- **Produces** → `unspecified`: product
- **Produces** → `organvm-vi-koinonia/community-hub`: community_signal
- **Produces** → `organvm-vii-kerygma/social-automation`: distribution_signal

### Siblings in Commerce
`classroom-rpg-aetheria`, `gamified-coach-interface`, `trade-perpetual-future`, `fetch-familiar-friends`, `sovereign-ecosystem--real-estate-luxury`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter` ... and 12 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-03-08T20:11:34Z*

## Session Review Protocol

At the end of each session that produces or modifies files:
1. Run `organvm session review --latest` to get a session summary
2. Check for unimplemented plans: `organvm session plans --project .`
3. Export significant sessions: `organvm session export <id> --slug <slug>`
4. Run `organvm prompts distill --dry-run` to detect uncovered operational patterns

Transcripts are on-demand (never committed):
- `organvm session transcript <id>` — conversation summary
- `organvm session transcript <id> --unabridged` — full audit trail
- `organvm session prompts <id>` — human prompts only


## Active Directives

| Scope | Phase | Name | Description |
|-------|-------|------|-------------|
| system | any | prompting-standards | Prompting Standards |
| system | any | research-standards-bibliography | APPENDIX: Research Standards Bibliography |
| system | any | research-standards | METADOC: Architectural Typology & Research Standards |
| system | any | sop-ecosystem | METADOC: SOP Ecosystem — Taxonomy, Inventory & Coverage |
| system | any | autopoietic-systems-diagnostics | SOP: Autopoietic Systems Diagnostics (The Mirror of Eternity) |
| system | any | cicd-resilience-and-recovery | SOP: CI/CD Pipeline Resilience & Recovery |
| system | any | cross-agent-handoff | SOP: Cross-Agent Session Handoff |
| system | any | document-audit-feature-extraction | SOP: Document Audit & Feature Extraction |
| system | any | essay-publishing-and-distribution | SOP: Essay Publishing & Distribution |
| system | any | market-gap-analysis | SOP: Full-Breath Market-Gap Analysis & Defensive Parrying |
| system | any | pitch-deck-rollout | SOP: Pitch Deck Generation & Rollout |
| system | any | promotion-and-state-transitions | SOP: Promotion & State Transitions |
| system | any | repo-onboarding-and-habitat-creation | SOP: Repo Onboarding & Habitat Creation |
| system | any | research-to-implementation-pipeline | SOP: Research-to-Implementation Pipeline (The Gold Path) |
| system | any | security-and-accessibility-audit | SOP: Security & Accessibility Audit |
| system | any | session-self-critique | session-self-critique |
| system | any | source-evaluation-and-bibliography | SOP: Source Evaluation & Annotated Bibliography (The Refinery) |
| system | any | stranger-test-protocol | SOP: Stranger Test Protocol |
| system | any | strategic-foresight-and-futures | SOP: Strategic Foresight & Futures (The Telescope) |
| system | any | typological-hermeneutic-analysis | SOP: Typological & Hermeneutic Analysis (The Archaeology) |
| unknown | any | gpt-to-os | SOP_GPT_TO_OS.md |
| unknown | any | index | SOP_INDEX.md |
| unknown | any | obsidian-sync | SOP_OBSIDIAN_SYNC.md |

Linked skills: evaluation-to-growth


**Prompting (Anthropic)**: context 200K tokens, format: XML tags, thinking: extended thinking (budget_tokens)

<!-- ORGANVM:AUTO:END -->


## ⚡ Conductor OS Integration
This repository is a managed component of the ORGANVM meta-workspace.
- **Orchestration:** Use `conductor patch` for system status and work queue.
- **Lifecycle:** Follow the `FRAME -> SHAPE -> BUILD -> PROVE` workflow.
- **Governance:** Promotions are managed via `conductor wip promote`.
- **Intelligence:** Conductor MCP tools are available for routing and mission synthesis.
