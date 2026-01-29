# Implementation Plan: Weekly Cycle Flow

**Branch**: `002-weekly-cycle-flow` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/features/weekly-cycle-flow/spec.md`

## Summary

Implement the end-to-end weekly cycle orchestration using Airtable Automations for scheduling and timed transitions, plus Retool workflows for operator-driven actions (fulfillment, inspection, settlement). This layer sits on top of State Authority and coordinates the temporal aspects of the service.

## Technical Context

**Platform**: Airtable (automations, scheduled jobs) + Retool (operator workflows)
**Language/Version**: Airtable formulas + Retool JavaScript (ES6+)
**Primary Dependencies**: State Authority base, Airtable Pro (scheduled automations)
**Storage**: Additional tables in YFT-StateAuthority base
**Testing**: Manual validation scenarios + time-simulation testing
**Target Platform**: Web (Retool) + Mobile (scanning)
**Performance Goals**: Scheduling job completes in <5 min for 25 users; state transitions <2s
**Constraints**: Airtable automation limits (25 actions per automation, 50 automations per base)
**Scale/Scope**: 25 users, ~100 cycles/month, ~400 garments in circulation

## Constitution Check

### §1 Weekly Cadence Invariant
- **PASS**: Auto-scheduling ensures every Active user has cycles
- **Implementation**: Scheduled automation runs Sunday, creates cycles for all Active users

### §2 Circular Inventory Invariant
- **PASS**: Packing workflow enforces scan-based accuracy
- **Implementation**: BoxPacker UI with variance detection from State Authority

### §3 State Truth Discipline
- **PASS**: All orchestration flows through State Authority transitions
- **Implementation**: This layer triggers transitions; State Authority validates

### §4 Explicit Failure Handling
- **PASS**: Late return escalation with explicit holds
- **Implementation**: Scheduled automation checks overdue cycles, applies holds

### §5 Probabilistic Fit
- **N/A**: This layer doesn't make fit decisions; passes data to FitIntelligenceSubsystem

### §6 Cognitive Load Minimization
- **PASS**: Auto-scheduling, auto-progression, progressive reminders
- **Implementation**: Time-based automations handle transitions without user action

## Project Structure

### Documentation (this feature)

```
specs/features/weekly-cycle-flow/
├── spec.md              # Feature specification
├── plan.md              # This file
├── data-model.md        # Additional tables for orchestration
├── quickstart.md        # Validation scenarios
├── contracts/           # Workflow definitions
│   ├── scheduling-workflow.md
│   ├── commitment-workflow.md
│   ├── fulfillment-workflow.md
│   ├── return-workflow.md
│   └── closeout-workflow.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Implementation task list
```

### Airtable Additions (to YFT-StateAuthority base)

```
Additional Tables:
├── Configuration        # Timing parameters
├── SchedulingJobs       # Auto-scheduling execution log
├── CommitmentBatches    # Commitment batch tracking
├── ShipmentBatches      # Shipment batch tracking
└── ReturnReminders      # Scheduled reminders

Additional Automations:
├── AutoScheduleCycles       # Sunday job: create next week's cycles
├── AutoCommitCycles         # Daily job: commit cycles at deadline
├── AutoProgressWearWindow   # Hourly job: check for window transitions
├── CheckOverdueReturns      # Daily job: escalate late returns
├── SendReturnReminders      # Daily job: send due reminders
└── TriggerHoldLogistics     # Daily job: apply holds for >7 day overdue
```

### Retool Additions (to existing apps)

```
YFT-WarehouseOps/
├── GarmentScanner     # (existing)
├── BoxPacker          # (existing - enhanced)
├── FulfillmentQueue   # NEW: prioritized packing queue
├── ShipmentDashboard  # NEW: bulk ship operations
├── ReceivingStation   # NEW: return receiving workflow
└── InspectionStation  # (existing - enhanced)

YFT-AdminConsole/
├── CycleManager       # (existing - enhanced)
├── SchedulingMonitor  # NEW: view scheduling job results
├── CommitmentMonitor  # NEW: view commitment results
└── ExceptionWorkflow  # NEW: handle late returns, missing items
```

**Structure Decision**: Build on existing State Authority infrastructure. Weekly Cycle Flow adds orchestration automations and enhanced operator workflows but uses same tables for core entities.

## Complexity Tracking

*No constitution violations. Orchestration is a thin layer over State Authority.*

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Scheduled automations | Airtable Pro includes scheduling | External scheduler adds complexity |
| Hourly window checks | Balance between responsiveness and automation limits | Minute-level checks exceed limits |
| Manual carrier integration | Pilot simplicity | API integration deferred to production |
