# Implementation Plan: Pilot MVP

**Branch**: `003-pilot-mvp` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/features/pilot-mvp/spec.md`

## Summary

Integrate State Authority and Weekly Cycle Flow into a deployable pilot system. Add pilot-specific UI components (onboarding forms, allocation interface, dashboard) and operational procedures. The result is a complete, launchable pilot for 25 users.

## Technical Context

**Platform**: Airtable (existing bases) + Retool (enhanced apps)
**Language/Version**: Airtable formulas + Retool JavaScript (ES6+)
**Primary Dependencies**: State Authority (complete), Weekly Cycle Flow (complete)
**Storage**: Existing YFT-StateAuthority base
**Testing**: End-to-end test cycle before pilot launch
**Target Platform**: Web (Retool) + Mobile (scanning)
**Performance Goals**: Support 25 concurrent users, 100 cycles/month
**Constraints**: Airtable limits (pilot-scale), manual processes for some workflows
**Scale/Scope**: 25 users, 100+ garments, 12-week pilot duration

## Constitution Check

### §1 Weekly Cadence Invariant
- **PASS**: Inherits automation from Weekly Cycle Flow
- **Implementation**: Same scheduling and commitment automations

### §2 Circular Inventory Invariant
- **PASS**: Barcode-based registration and tracking
- **Implementation**: Garment onboarding with scan verification

### §3 State Truth Discipline
- **PASS**: All operations through State Authority
- **Implementation**: Pilot UI triggers same transitions

### §4 Explicit Failure Handling
- **PASS**: Exception workflows defined
- **Implementation**: ExceptionWorkflow page with resolution options

### §5 Probabilistic Fit
- **PASS**: Manual allocation follows fit principles; data collected for future automation
- **Implementation**: Allocation UI shows fit-compatible suggestions

### §6 Cognitive Load Minimization
- **PASS**: Communications are minimal and action-oriented
- **Implementation**: Templated messages, sent at key trigger points

## Project Structure

### Documentation (this feature)

```
specs/features/pilot-mvp/
├── spec.md              # Feature specification
├── plan.md              # This file
├── quickstart.md        # Launch checklist and test procedures
├── checklists/
│   └── requirements.md
└── tasks.md             # Implementation task list
```

### Retool Additions (to existing apps)

```
YFT-AdminConsole/
├── (existing pages)
├── UserOnboarding       # NEW: Pilot user registration
├── GarmentOnboarding    # NEW: Inventory registration
├── AllocationWorkbench  # NEW: Manual allocation interface
├── PilotDashboard       # NEW: Operational overview
└── CommunicationLog     # NEW: Track sent messages

YFT-WarehouseOps/
├── (existing pages - no changes)

YFT-Mobile/
├── (existing pages - no changes)
```

### Airtable Additions

```
Additional Tables:
├── FitProfiles          # Simple fit data for manual allocation
├── CommunicationEvents  # Log of sent communications
└── PilotFeedback        # User feedback for analysis

Additional Views:
├── Users: Pilot Capacity (count toward 25 limit)
├── Garments: By Size Band (for allocation)
└── Cycles: Pilot Week N (filter by week for analysis)
```

**Structure Decision**: Minimal additions to existing infrastructure. Pilot-specific features are UI enhancements and tracking tables, not new automations.

## Complexity Tracking

*No constitution violations. Pilot builds on existing foundation.*

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Manual allocation | Learning over automation for pilot | Automated allocation requires more fit data |
| Manual communications | Template quality > send speed for pilot | Automated sends could feel impersonal |
| 25-user hard cap | Manageable for manual processes | Soft cap risks overload |
