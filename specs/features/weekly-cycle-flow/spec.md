# Feature Specification: Weekly Cycle Flow

**Feature Branch**: `002-weekly-cycle-flow`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "End-to-end weekly cycle from scheduling through commitment, fulfillment, return, and closeout. Integrates State Authority + Logistics Orchestration subsystems."

## Overview

The Weekly Cycle Flow operationalizes the temporal contract between the platform and users. Each week, active users receive a box of garments, wear them, and return them—all with minimal cognitive load. This feature integrates State Authority (entity state management) with Logistics Orchestration (physical movement coordination) to deliver the weekly cadence invariant.

This specification focuses on the **operational workflow**—how operators and automated systems coordinate to execute cycles reliably. It depends on State Authority for state management and produces the orchestration layer that makes weekly cadence work.

## User Scenarios & Testing

### User Story 1 - Weekly Scheduling (Priority: P1)

The system automatically schedules the next cycle for each active user based on their weekly anchor, ensuring continuous service without user intervention.

**Why this priority**: Scheduling is the entry point for every cycle. Without reliable auto-scheduling, users must manually request boxes, violating Constitution §6 (Cognitive Load Minimization).

**Independent Test**: Advance calendar to next Monday, verify all active users have cycles scheduled for their anchor day.

**Acceptance Scenarios**:

1. **Given** user U1 is `Active` with `weekly_anchor = Tuesday`, **When** scheduling job runs on Sunday, **Then** a cycle is created for U1 for the upcoming Tuesday week.

2. **Given** user U1 already has a cycle for week W1, **When** scheduling job runs, **Then** no duplicate cycle is created (enforced by State Authority).

3. **Given** user U1 is in `HoldPayment` state, **When** scheduling job runs, **Then** no cycle is scheduled (user must be Active).

4. **Given** user U1 is `Paused`, **When** scheduling job runs, **Then** no cycle is scheduled until user resumes.

5. **Given** scheduling job completes, **When** operator views scheduled cycles, **Then** all cycles appear with status `Scheduled` and correct week_id.

---

### User Story 2 - Commitment & Inventory Lock (Priority: P1)

At the commitment deadline, the system locks inventory to committed cycles, converting scheduled plans into binding obligations.

**Why this priority**: Commitment is the point of no return—after this, inventory is reserved and logistics must execute. Per Constitution §1, this maintains weekly cadence by making commitments binding.

**Independent Test**: Trigger commitment for a scheduled cycle, verify garments transition to Reserved, cycle transitions to Committed.

**Acceptance Scenarios**:

1. **Given** cycle C1 in `Scheduled` state with box B1 containing garments [G1, G2, G3], **When** commitment deadline reached, **Then** C1 transitions to `Committed`, garments transition to `Reserved`.

2. **Given** cycle C1 in `Scheduled` state but user U1 is in `HoldPayment`, **When** commitment deadline reached, **Then** C1 is NOT committed, remains `Scheduled` with flag indicating hold blocked.

3. **Given** cycle C1 in `Scheduled` state but garment G1 is no longer `Available`, **When** commitment deadline reached, **Then** system attempts substitution; if no substitute found, C1 transitions to `Cancelled` with reason.

4. **Given** successful commitment, **When** operator views cycle, **Then** `committed_at` timestamp is recorded, garments show `current_cycle_id = C1`.

---

### User Story 3 - Fulfillment Workflow (Priority: P1)

Warehouse operators pack committed boxes using scan-based workflows that enforce correct contents and detect variance.

**Why this priority**: Fulfillment accuracy directly impacts user experience and inventory integrity. Per Constitution §2, garments must be tracked accurately.

**Independent Test**: Pack a committed box using scanner workflow, verify contents match plan or variance is documented.

**Acceptance Scenarios**:

1. **Given** cycle C1 `Committed` with box B1 planned for [G1, G2, G3], **When** operator starts fulfillment, **Then** B1 transitions to `Picking`, C1 transitions to `FulfillmentInProgress`.

2. **Given** B1 in `Picking` state, **When** operator scans G1, **Then** G1 transitions to `Packed`, B1.actual_contents includes G1.

3. **Given** operator has scanned [G1, G2, G3] matching plan, **When** operator clicks "Verify Pack", **Then** B1 transitions to `PackedVerified`.

4. **Given** operator scans G4 (not in plan), **When** operator attempts to verify, **Then** system shows variance, blocks verification until resolved.

5. **Given** variance detected, **When** operator selects "Commit to Observed", **Then** `CompensatingAllocation` event logged, B1 proceeds to `PackedVerified` with actual contents.

---

### User Story 4 - Shipment & Delivery (Priority: P1)

Boxes ship on schedule with tracking, and delivery confirmation triggers next cycle phase.

**Why this priority**: Shipment timing maintains weekly cadence. Per Constitution §1, delays must be explicit state changes, not silent.

**Independent Test**: Ship a packed box, enter delivery confirmation, verify cycle progresses through states.

**Acceptance Scenarios**:

1. **Given** B1 in `PackedVerified` state, **When** operator enters tracking number and clicks "Ship", **Then** B1 transitions to `Shipped`, C1 transitions to `OutboundInTransit`.

2. **Given** C1 in `OutboundInTransit`, **When** delivery confirmation received (carrier webhook or manual), **Then** C1 transitions to `Delivered`.

3. **Given** C1 `Delivered`, **When** configured delay elapses (default: immediate), **Then** C1 auto-transitions to `WearWindowOpen`, garments to `InUse`.

4. **Given** expected delivery date passed with no confirmation, **When** 48 hours elapse, **Then** system creates `DeliveryUncertain` event, enters bounded uncertainty state.

---

### User Story 5 - Wear Window Management (Priority: P2)

The system manages wear window timing with automatic transitions, requiring no user action for normal operation.

**Why this priority**: Automatic transitions reduce cognitive load (Constitution §6). Users shouldn't need to track windows.

**Independent Test**: Deliver box, verify automatic transition to WearWindowOpen, then to ReturnWindowOpen after 5 days.

**Acceptance Scenarios**:

1. **Given** C1 in `WearWindowOpen` state with 5-day wear window, **When** 5 days elapse, **Then** C1 auto-transitions to `ReturnWindowOpen`.

2. **Given** C1 transitions to `ReturnWindowOpen`, **When** transition occurs, **Then** return label becomes active, reminder scheduled for day 1.

3. **Given** user has never interacted with the app during wear window, **When** return window opens, **Then** user receives clear notification without needing prior action.

---

### User Story 6 - Return Flow (Priority: P1)

Returns are tracked from pickup through receipt, with automatic handling for normal cases and escalation for exceptions.

**Why this priority**: Return receipt unlocks garments for next cycle. Per Constitution §2, garments cannot return to circulation without inspection.

**Independent Test**: Initiate return, confirm pickup, receive at facility, verify garment state progression.

**Acceptance Scenarios**:

1. **Given** C1 in `ReturnWindowOpen`, **When** carrier confirms pickup, **Then** C1 transitions to `ReturnInTransit`, B1 to `Returning`.

2. **Given** user drops off at location, **When** drop-off scanned, **Then** return considered initiated, same transitions as pickup.

3. **Given** C1 in `ReturnInTransit`, **When** box barcode scanned at receiving, **Then** B1 transitions to `Received`, C1 to `CloseoutInspection`.

4. **Given** return not received by day 3 of return window, **When** deadline passed, **Then** escalation reminder sent to user.

5. **Given** return not received by day 7, **When** deadline passed, **Then** user transitions to `HoldLogistics`, next cycle commitment blocked.

---

### User Story 7 - Closeout & Settlement (Priority: P1)

Returned garments are inspected, routed appropriately, and cycles are settled with correct accounting.

**Why this priority**: Settlement closes the cycle loop, updates fit intelligence, and maintains inventory accuracy. Per Constitution §3, all entities must be auditable.

**Independent Test**: Inspect returned garments, trigger settlement, verify cycle closes with proper accounting.

**Acceptance Scenarios**:

1. **Given** C1 in `CloseoutInspection` with garments [G1, G2, G3] in `ReceivedReturn`, **When** operator inspects G1 as condition A, **Then** G1 transitions to `Refurbish`.

2. **Given** all garments inspected and routed, **When** settlement triggered, **Then** C1 transitions to `Settled`, charges/credits computed.

3. **Given** G3 inspection reveals lifecycle limit reached, **When** inspection saved, **Then** G3 transitions to `Retired` instead of `Refurbish`.

4. **Given** G2 inspection reveals contamination, **When** operator selects "Quarantine", **Then** G2 transitions to `Quarantine`, `SafetyIncident` event logged.

5. **Given** C1 `Settled`, **When** settlement complete, **Then** C1 transitions to `Closed`, B1 transitions to `Closed` (available for reuse).

---

### User Story 8 - Exception Handling (Priority: P2)

The system provides clear workflows for handling exceptions: late returns, missing items, damage reports.

**Why this priority**: Per Constitution §4, failures are normal and recovery paths must be first-class. Exceptions shouldn't corrupt state.

**Independent Test**: Simulate late return, verify hold application, resolve and verify restoration.

**Acceptance Scenarios**:

1. **Given** cycle with return 10 days overdue, **When** operator views cycle, **Then** cycle shows `Exception: Late Return`, user shows `HoldLogistics`.

2. **Given** returned box missing G2, **When** reconciliation runs, **Then** `MissingGarment` event logged, settlement includes loss charge.

3. **Given** user reports damage during wear, **When** operator logs damage report, **Then** garment flagged for special inspection, fit intelligence notified.

4. **Given** carrier reports lost package, **When** operator processes carrier claim, **Then** garments transition to `Lost`, user receives replacement cycle (if inventory allows).

---

### Edge Cases

- What if commitment deadline falls on a holiday?
  - Use next business day, cycle.scheduled_at remains original, commitment proceeds with delay documented.

- What if user changes address after commitment?
  - If before ship: update shipping address, log event.
  - If after ship: contact user for redelivery or hold at location.

- What if all inventory is committed and new cycle can't be filled?
  - Create cycle in `Scheduled` state with `capacity_constrained` flag.
  - At commitment, either substitute or cancel with credit.

- What if garment fails during refurbishment?
  - Transition to `Repair` or `Retired` based on failure type.
  - Inventory lifecycle subsystem handles routing.

## Requirements

### Functional Requirements

- **FR-101**: System MUST auto-schedule cycles for all Active users based on weekly_anchor.
- **FR-102**: System MUST run scheduling at a configurable time (default: Sunday 6 PM for the following week).
- **FR-103**: System MUST support configurable commitment deadline (default: 48 hours before ship date).
- **FR-104**: System MUST attempt garment substitution if planned garment becomes unavailable before commitment.
- **FR-105**: System MUST provide fulfillment queue showing boxes ready for packing in priority order.
- **FR-106**: System MUST enforce scan-based packing with variance detection.
- **FR-107**: System MUST support bulk shipment operations (mark multiple boxes shipped).
- **FR-108**: System MUST auto-progress cycles through wear/return windows based on time.
- **FR-109**: System MUST send configurable reminders during return window (day 1, day 3, etc.).
- **FR-110**: System MUST support multiple return methods (carrier pickup, location drop-off).
- **FR-111**: System MUST apply HoldLogistics after configurable late return threshold (default: 7 days).
- **FR-112**: System MUST provide inspection workflow for returned garments with condition grading.
- **FR-113**: System MUST auto-route garments based on inspection (Refurbish, Repair, Quarantine, Retired).
- **FR-114**: System MUST compute settlement with itemized charges/credits.
- **FR-115**: System MUST support exception workflows for late returns, missing items, damage.

### Timing Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| scheduling_day | Sunday | Day to create next week's cycles |
| scheduling_time | 18:00 | Time of scheduling job |
| commitment_lead_time | 48 hours | Time before ship to lock commitment |
| wear_window_duration | 5 days | Default wear window |
| return_window_duration | 2 days | Default return window before escalation |
| late_threshold_reminder | 3 days | Days overdue before escalation reminder |
| late_threshold_hold | 7 days | Days overdue before HoldLogistics |
| late_threshold_loss | 14 days | Days overdue before loss declaration |

### Key Entities (References State Authority)

This feature uses entities defined in State Authority:
- **CycleEntity**: Temporal contract, states: Scheduled → Committed → ... → Closed
- **BoxEntity**: Logistics container, states: Planned → ... → Closed
- **GarmentEntity**: Physical asset, states: Available → Reserved → ... → Available
- **UserEntity**: Contract holder, states: Active, Paused, HoldPayment, HoldLogistics, etc.

### New Entities for Logistics Orchestration

- **SchedulingJob**: Tracks auto-scheduling execution. Attributes: job_id, run_time, users_processed, cycles_created, errors.

- **CommitmentBatch**: Groups cycles committed together. Attributes: batch_id, commitment_time, cycles_committed, cycles_blocked, substitutions_made.

- **ShipmentBatch**: Groups boxes shipped together. Attributes: batch_id, ship_date, boxes_shipped, carrier, manifest.

- **ReturnReminder**: Scheduled user communication. Attributes: reminder_id, cycle_id, scheduled_time, sent_at, escalation_level.

## Success Criteria

### Measurable Outcomes

- **SC-101**: 100% of active users have a cycle scheduled each week (auto-scheduling reliability).
- **SC-102**: >95% of scheduled cycles successfully commit (capacity planning success).
- **SC-103**: <5% packing variance rate (operational accuracy).
- **SC-104**: >98% of cycles complete full flow without manual intervention (automation success).
- **SC-105**: Mean time from delivery to return receipt <10 days (cycle velocity).
- **SC-106**: <2% late return rate (user compliance).
- **SC-107**: 100% of garments inspected before returning to Available (inspection compliance).
- **SC-108**: Zero instances of garments returning to circulation without inspection (Constitution §2 compliance).
