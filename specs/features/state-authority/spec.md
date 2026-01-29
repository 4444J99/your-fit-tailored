# Feature Specification: State Authority Subsystem

**Feature Branch**: `001-state-authority`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "State Authority Subsystem - canonical entity state, transition contracts, event sourcing for auditability. Foundation that all other subsystems depend on."

## Overview

The State Authority Subsystem is the canonical source of truth for all entity state and transitions within the Your-Fit-Tailored platform. It owns the state machines for User, Garment, Box, and Cycle entities, enforces transition contracts with preconditions and postconditions, and maintains complete audit trails via event sourcing.

This subsystem is **foundational**—no other subsystem may mutate entity state directly. All state changes flow through State Authority, which validates transitions, enforces invariants, and emits events that downstream systems consume.

## User Scenarios & Testing

### User Story 1 - Garment State Tracking (Priority: P1)

An operator scans a garment at various checkpoints (receiving, packing, shipping, return), and the system maintains accurate real-time state. At any moment, an operator can query "where is garment X?" and receive a definitive answer.

**Why this priority**: Without accurate garment state, the entire circular inventory model fails. Double-allocation, phantom inventory, and garments returning to circulation without inspection are existential threats per Constitution §2.

**Independent Test**: Scan a garment through the full lifecycle (Available → Reserved → Packed → InTransitOutbound → Delivered → InTransitReturn → ReceivedReturn → Refurbish → Available) and verify state at each checkpoint.

**Acceptance Scenarios**:

1. **Given** a garment in `Available` state, **When** the operator scans it for reservation to a box, **Then** the garment transitions to `Reserved` with cycle_id recorded, and cannot be reserved for another box.

2. **Given** a garment in `Reserved` state for cycle C1, **When** operator attempts to reserve it for cycle C2, **Then** the system rejects the transition with error "Garment already reserved for cycle C1".

3. **Given** a garment in `InTransitReturn` state, **When** the operator scans it at receiving, **Then** the garment transitions to `ReceivedReturn` and is queued for inspection.

4. **Given** a garment in `ReceivedReturn` state, **When** inspection determines condition is acceptable, **Then** the garment transitions to `Refurbish`, and upon refurbishment completion, to `Available`.

5. **Given** a garment whose lifecycle counter exceeds bounds, **When** any transition to `Available` is attempted, **Then** the system rejects and transitions to `Retired` instead.

---

### User Story 2 - Cycle State Progression (Priority: P1)

The system tracks each weekly cycle through its deterministic state progression, ensuring exactly one open cycle per user per week and preventing cadence violations.

**Why this priority**: Weekly cadence is invariant per Constitution §1. Without authoritative cycle state, the system cannot enforce the core temporal contract.

**Independent Test**: Create a cycle for user U1 for week W1, progress it through all states to Closed, and verify a second cycle cannot be opened for the same user/week combination.

**Acceptance Scenarios**:

1. **Given** user U1 is in `Active` state with no cycle for week W1, **When** the scheduler creates a cycle, **Then** a CycleEntity in `Scheduled` state is created with $WEEK_ID = W1.

2. **Given** user U1 already has a cycle for week W1, **When** the scheduler attempts to create another cycle for W1, **Then** the system rejects with error "Cycle already exists for user/week".

3. **Given** a cycle in `Scheduled` state, **When** all feasibility checks pass (inventory, logistics, payment), **Then** the cycle transitions to `Committed` and inventory is reserved.

4. **Given** a cycle in `Delivered` state, **When** the wear window elapses, **Then** the cycle automatically transitions to `WearWindowOpen` → `ReturnWindowOpen` per the defined timeline.

5. **Given** a cycle in `CloseoutInspection` state, **When** all garments are inspected and settlement computed, **Then** the cycle transitions to `Settled` → `Closed` and becomes immutable.

---

### User Story 3 - User Contract State (Priority: P1)

The system enforces user eligibility through operational holds (HoldPayment, HoldLogistics, HoldIdentity) that gate cycle commitment without corrupting historical state.

**Why this priority**: User contract enforcement protects inventory exposure per Constitution §4. Uncontrolled shipping into unbounded exposure creates financial and operational risk.

**Independent Test**: Set a user to HoldPayment, verify cycle commitment fails, resolve hold, verify commitment succeeds.

**Acceptance Scenarios**:

1. **Given** a user in `Active` state, **When** payment authorization fails, **Then** user transitions to `HoldPayment` and no new cycles can commit.

2. **Given** a user in `HoldPayment` state with a cycle in `Scheduled` state, **When** commitment is attempted, **Then** the system blocks commitment and records reason.

3. **Given** a user in `HoldPayment` state, **When** payment is restored, **Then** user transitions back to `Active` and normal operations resume.

4. **Given** a user with a late return exceeding threshold, **When** the next cycle attempts commitment, **Then** user transitions to `HoldLogistics` until return is resolved.

5. **Given** a user transitioning to `Closed` state, **When** any garments are still in their custody, **Then** the system blocks closure until settlement (return or loss declaration).

---

### User Story 4 - Box Contents Integrity (Priority: P2)

The system tracks box contents through packing variance detection, ensuring what ships matches what was planned or records explicit compensating events.

**Why this priority**: Packing variance leads to inventory drift and fit-learning corruption per Constitution §3. This is a stability concern after survival invariants.

**Independent Test**: Plan box with garments [G1, G2, G3], pack with [G1, G2, G4], verify system detects variance and records compensating event.

**Acceptance Scenarios**:

1. **Given** a box in `Planned` state with intended contents [G1, G2, G3], **When** operator packs and scans [G1, G2, G3], **Then** box transitions to `PackedVerified` with no variance.

2. **Given** a box in `Picking` state, **When** operator scans garment G4 not in the plan, **Then** system records `PackingVariance` event with planned vs actual.

3. **Given** a box with unresolved `PackingVariance`, **When** operator attempts to ship, **Then** system requires explicit resolution: correct the pack OR commit to observed set with compensating allocation.

4. **Given** a box that shipped with compensating allocation, **When** cycle closes, **Then** fit intelligence receives accurate observed contents, not planned contents.

---

### User Story 5 - Audit Trail Completeness (Priority: P2)

Every state transition is recorded as an immutable event with timestamp, actor, preconditions, and outcome, enabling full reconstruction of entity history.

**Why this priority**: Auditability is mandated by Constitution §3 (State Truth Discipline). Without audit trails, reconciliation and debugging become impossible at scale.

**Independent Test**: Perform 10 state transitions on a garment, query event history, verify all 10 are recorded with correct sequence and metadata.

**Acceptance Scenarios**:

1. **Given** any entity state transition, **When** the transition completes, **Then** an event is emitted containing: entity_type, entity_id, from_state, to_state, timestamp, actor_id, cycle_id (if applicable).

2. **Given** a failed transition attempt, **When** preconditions are not met, **Then** a rejection event is recorded with the reason and attempted transition.

3. **Given** a need to reconstruct entity state at time T, **When** querying the event log, **Then** replaying events up to T produces identical state.

4. **Given** an event, **When** any system attempts modification, **Then** the system rejects the modification (events are append-only immutable).

---

### Edge Cases

- What happens when external signal (carrier) contradicts internal state (garment shows Delivered but carrier says InTransit)?
  - System maintains internal state as authoritative, records `CustodyConflict` event, enters bounded uncertainty state pending resolution.

- What happens when a transition is requested with stale entity version?
  - System rejects with optimistic concurrency error, requiring client to re-fetch and retry.

- What happens during system failure mid-transition?
  - Transitions are atomic. Either event is recorded and state changes, or neither happens. Partial states are impossible.

- What happens when lifecycle bounds are exceeded during a cycle?
  - Garment completes current cycle normally, then transitions to Retired instead of Available at closeout.

## Requirements

### Functional Requirements

- **FR-001**: System MUST maintain canonical state for UserEntity with states: Active, Paused, HoldPayment, HoldIdentity, HoldLogistics, Closed.

- **FR-002**: System MUST maintain canonical state for GarmentEntity with states: Available, Reserved, Packed, InTransitOutbound, Delivered, InUse, InTransitReturn, ReceivedReturn, Quarantine, Refurbish, Repair, Lost, Retired, Disposed.

- **FR-003**: System MUST maintain canonical state for BoxEntity with states: Created, Planned, Picking, PackedVerified, Shipped, Delivered, ReturnInitiated, Returning, Received, Reconciled, Closed.

- **FR-004**: System MUST maintain canonical state for CycleEntity with states: Scheduled, Committed, FulfillmentInProgress, OutboundInTransit, Delivered, WearWindowOpen, ReturnWindowOpen, ReturnInTransit, CloseoutInspection, Settled, Closed.

- **FR-005**: System MUST enforce transition contracts: each valid state transition has defined preconditions that must be true before transition and postconditions that are guaranteed after.

- **FR-006**: System MUST reject invalid transitions with specific error codes indicating which precondition failed.

- **FR-007**: System MUST emit immutable events for all state transitions with: entity_type, entity_id, from_state, to_state, timestamp, actor_id, tenant_id, cycle_id, metadata.

- **FR-008**: System MUST enforce single-assignment constraint: a garment cannot be Reserved for multiple cycles simultaneously.

- **FR-009**: System MUST enforce weekly uniqueness: at most one open CycleEntity per $USER_ID per $WEEK_ID.

- **FR-010**: System MUST enforce lifecycle bounds: garments exceeding configured usage limits automatically transition to Retired.

- **FR-011**: System MUST support compensating events for reversal scenarios (e.g., `DeliveryReversed`, `PackingCorrected`).

- **FR-012**: System MUST provide idempotent transition operations: replaying the same transition request with same idempotency key has no additional effect.

- **FR-013**: System MUST support bounded uncertainty states where external signals are conflicting or missing.

- **FR-014**: System MUST scope all identifiers to $TENANT_ID for multi-tenant isolation.

### Key Entities

- **UserEntity**: Contract-bearing participant. Key attributes: user_id, tenant_id, operational_state, fit_profile_reference, weekly_anchor, address_id, payment_method_id, created_at, updated_at.

- **GarmentEntity**: Stateful physical asset. Key attributes: garment_id, tenant_id, asset_state, sku, lifecycle_counters (wear_count, wash_count, repair_count), condition_grade, current_cycle_id, current_box_id, created_at, retired_at.

- **BoxEntity**: Logistics container. Key attributes: box_id, tenant_id, container_state, cycle_id, planned_contents[], actual_contents[], tracking_number, created_at.

- **CycleEntity**: Temporal contract instance. Key attributes: cycle_id, tenant_id, user_id, week_id, cycle_state, box_id, scheduled_at, committed_at, delivered_at, return_received_at, closed_at.

- **StateTransitionEvent**: Immutable audit record. Key attributes: event_id, tenant_id, entity_type, entity_id, from_state, to_state, timestamp, actor_id, cycle_id, metadata, idempotency_key.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of state transitions are recorded as events with no gaps in sequence.

- **SC-002**: Zero instances of garment double-allocation detected in production (enforced by transition contracts).

- **SC-003**: Zero instances of duplicate cycles for same user/week (enforced by uniqueness constraint).

- **SC-004**: Any entity's complete state history can be reconstructed from events within 5 seconds for up to 1000 events.

- **SC-005**: Invalid transition attempts return specific, actionable error codes in <100ms.

- **SC-006**: System maintains state consistency during simulated failures (no partial transitions).

- **SC-007**: Lifecycle bounds enforcement prevents 100% of over-limit garments from re-entering Available state.
