# Feature Specification: Pilot MVP

**Feature Branch**: `003-pilot-mvp`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "25-user pilot operational minimum with manual processes, scan discipline, and exception handling. Integration of State Authority + Weekly Cycle Flow for pilot launch."

## Overview

The Pilot MVP integrates State Authority and Weekly Cycle Flow into a deployable pilot system for 25 users. This specification defines the operational procedures, manual workarounds, integration points, and launch checklist required to run the first live cycles.

The pilot validates:
1. **Business model**: Do users value continuous apparel with zero cognitive load?
2. **Unit economics**: Does the cost structure support scaling?
3. **Operational feasibility**: Can we execute weekly cycles reliably?
4. **Fit accuracy**: Does our allocation approach produce acceptable fit?

This is explicitly a **minimum viable pilot**—some processes remain manual, and the goal is learning, not perfection.

## User Scenarios & Testing

### User Story 1 - Pilot User Onboarding (Priority: P1)

New pilot users are enrolled, their fit profile is captured, and they're activated for their first cycle.

**Why this priority**: Without users, there's no pilot. Onboarding sets up the foundation for all subsequent cycles.

**Independent Test**: Onboard one user, verify they appear in Active users with fit profile reference.

**Acceptance Scenarios**:

1. **Given** a new pilot participant, **When** operator enters user details (name, address, payment), **Then** UserEntity is created in `Active` state.

2. **Given** user created, **When** operator enters initial fit information (sizes, preferences), **Then** fit_profile_ref is populated (manual entry for pilot).

3. **Given** user activated before scheduling cutoff, **When** scheduling runs, **Then** user receives their first cycle for next week.

4. **Given** 25 pilot slots allocated, **When** 25th user onboarded, **Then** system shows capacity reached.

---

### User Story 2 - Inventory Onboarding (Priority: P1)

Physical garments are registered in the system with barcodes, initial condition, and fit attributes.

**Why this priority**: Without inventory, cycles can't be fulfilled. Accurate inventory is the foundation of the circular model.

**Independent Test**: Register 10 garments, verify they appear as Available with correct attributes.

**Acceptance Scenarios**:

1. **Given** physical garment with barcode, **When** operator scans and enters details (SKU, size, initial condition), **Then** GarmentEntity created in `Available` state.

2. **Given** 50 garments needed for pilot, **When** all onboarded, **Then** Available Inventory view shows 50 garments with sizes matching pilot user distribution.

3. **Given** garment onboarded, **When** operator views garment, **Then** lifecycle counters show 0 (wear_count, wash_count, repair_count).

4. **Given** box containers ready, **When** operator registers each box, **Then** BoxEntity created in `Created` state with unique barcode.

---

### User Story 3 - First Cycle Execution (Priority: P1)

The pilot team executes a complete first week cycle manually, verifying all processes work.

**Why this priority**: The first cycle proves the system works end-to-end before scaling to all 25 users.

**Independent Test**: Execute one complete cycle from scheduling through closeout for a single user.

**Acceptance Scenarios**:

1. **Given** pilot launched with users and inventory, **When** scheduling runs, **Then** each Active user has a Scheduled cycle.

2. **Given** cycle scheduled, **When** commitment deadline reached, **Then** cycles commit if users Active and inventory available.

3. **Given** cycle committed, **When** operator packs box, **Then** scan-based packing records actual contents.

4. **Given** box packed, **When** operator ships, **Then** tracking entered and cycle progresses.

5. **Given** user receives box, **When** delivery confirmed, **Then** wear window opens automatically.

6. **Given** wear window ends, **When** return window opens, **Then** user receives return reminder.

7. **Given** return received, **When** operator inspects garments, **Then** garments route correctly (Refurbish, etc.).

8. **Given** cycle settled, **When** closeout complete, **Then** cycle Closed, garments back in circulation.

---

### User Story 4 - Allocation & Fit (Priority: P1)

Garments are allocated to cycles based on user fit profiles (manual for pilot, preparing for FitIntelligenceSubsystem).

**Why this priority**: Allocation accuracy determines user satisfaction. Even manual allocation should follow fit principles.

**Independent Test**: Allocate garments to 5 users with different sizes, verify allocations match profiles.

**Acceptance Scenarios**:

1. **Given** user U1 with fit profile [size M, casual preference], **When** operator allocates for U1, **Then** available M-size casual garments suggested.

2. **Given** manual allocation, **When** operator selects garments [G1, G2, G3] for cycle C1, **Then** garments reserved to cycle.

3. **Given** post-cycle feedback (user reports fit issue), **When** operator records feedback, **Then** fit profile updated for next allocation.

4. **Given** 25 users with varying sizes, **When** inventory checked, **Then** sufficient inventory in each size band (or exceptions flagged).

---

### User Story 5 - Operational Monitoring (Priority: P1)

Pilot operators have dashboards showing system health, cycle progress, and exceptions.

**Why this priority**: Operators need visibility to intervene quickly during pilot. This is the "control room" for the pilot.

**Independent Test**: View dashboard with 5 cycles in various states, verify all states visible.

**Acceptance Scenarios**:

1. **Given** pilot running, **When** operator opens dashboard, **Then** sees: Active cycles by state, Available inventory count, Users by state.

2. **Given** cycle overdue, **When** dashboard refreshes, **Then** overdue cycles highlighted with days_overdue.

3. **Given** scheduling job runs, **When** operator views SchedulingMonitor, **Then** job results visible with counts.

4. **Given** exception occurs (late return, missing item), **When** operator views ExceptionWorkflow, **Then** exception visible with resolution options.

---

### User Story 6 - Pilot Communications (Priority: P2)

Users receive timely, minimal communications (manually sent during pilot).

**Why this priority**: Per Constitution §6, users need just enough information to act. Communications must be simple and action-oriented.

**Independent Test**: Send test communications for each trigger point, verify content is clear and actionable.

**Acceptance Scenarios**:

1. **Given** cycle committed, **When** operator sends "your box is on its way" communication, **Then** user receives with expected delivery date.

2. **Given** delivery confirmed, **When** operator sends "your box has arrived" communication, **Then** user knows no action required until return.

3. **Given** return window opens, **When** operator sends "time to return" reminder, **Then** user receives with clear return instructions.

4. **Given** return overdue, **When** operator sends escalation, **Then** message is firm but not punitive.

---

### User Story 7 - Pilot Data Collection (Priority: P2)

Data is collected for business model validation and system improvement.

**Why this priority**: The pilot's purpose is learning. Data collection enables post-pilot analysis.

**Independent Test**: Export pilot data after one week, verify all key metrics captured.

**Acceptance Scenarios**:

1. **Given** cycle completes, **When** operator exports data, **Then** includes: cycle timing, garment utilization, user interactions.

2. **Given** fit feedback received, **When** logged, **Then** feedback linked to specific garment and user for analysis.

3. **Given** exception occurs, **When** resolved, **Then** exception type and resolution path recorded.

4. **Given** pilot week complete, **When** running analysis, **Then** can compute: cycles completed, average cycle time, exception rate, fit satisfaction.

---

### User Story 8 - Pilot Exception Recovery (Priority: P1)

When things go wrong, operators have clear recovery paths.

**Why this priority**: Per Constitution §4, failures are normal. Pilot must have explicit recovery procedures.

**Independent Test**: Simulate each failure mode, execute recovery, verify state is correct after.

**Acceptance Scenarios**:

1. **Given** commitment fails for user (hold), **When** operator investigates, **Then** can see block reason, contact user, resolve hold, re-attempt commitment.

2. **Given** packing variance detected, **When** operator cannot correct, **Then** can commit to observed set with documented reason.

3. **Given** delivery delayed significantly, **When** carrier confirms lost, **Then** operator can reship replacement box OR credit user.

4. **Given** return never arrives, **When** 14-day threshold reached, **Then** operator can declare loss, charge user, close cycle.

5. **Given** garment returned damaged, **When** operator inspects, **Then** can route to Repair/Quarantine/Retired with notes.

---

### Edge Cases

- What if a user wants to cancel mid-pilot?
  - Operator transitions user to Closed, completes any open cycle, refunds remaining period.

- What if all inventory in a size is committed?
  - Flag before commitment deadline; operator may skip user or substitute.

- What if the same garment keeps getting negative feedback?
  - Operator reviews fit data; may retire garment or reassign to different user profile.

- What if a user loses their return label?
  - Operator generates new label, sends to user.

## Requirements

### Functional Requirements

- **FR-201**: System MUST support manual user onboarding with all required fields.
- **FR-202**: System MUST support barcode-based garment registration.
- **FR-203**: System MUST provide manual allocation interface for assigning garments to cycles.
- **FR-204**: System MUST support all State Authority transitions via Retool UI.
- **FR-205**: System MUST support all Weekly Cycle Flow automations.
- **FR-206**: System MUST provide operational dashboard with real-time cycle status.
- **FR-207**: System MUST track communication events (sent/skipped) per cycle.
- **FR-208**: System MUST support data export for pilot analysis.
- **FR-209**: System MUST provide exception workflow UI with resolution options.
- **FR-210**: System MUST prevent pilot from exceeding 25 users.

### Operational Procedures (Manual for Pilot)

| Process | Tool | Automation Level |
|---------|------|------------------|
| User onboarding | Retool form | Manual |
| Fit profile capture | Retool form + Google Form | Manual |
| Garment registration | Retool + barcode scanner | Semi-automated |
| Scheduling | Airtable automation | Automated |
| Allocation | Retool interface | Manual |
| Commitment | Airtable automation | Automated |
| Packing | Retool + scanner | Manual |
| Shipping | Retool + carrier website | Manual |
| Delivery confirmation | Retool (from carrier tracking) | Manual |
| Communications | Email (manual send) | Manual |
| Return tracking | Retool (from carrier tracking) | Manual |
| Receiving | Retool + scanner | Manual |
| Inspection | Retool form | Manual |
| Settlement | Retool (manual trigger) | Semi-automated |
| Exception handling | Retool workflow | Manual |

### Key Metrics for Pilot

| Metric | Target | Purpose |
|--------|--------|---------|
| Cycle completion rate | >95% | Operational reliability |
| On-time delivery rate | >90% | Logistics performance |
| Return compliance rate | >90% | User engagement |
| Fit satisfaction (survey) | >80% | Allocation accuracy |
| Exception rate | <10% | System stability |
| NPS | >50 | Overall user satisfaction |

## Success Criteria

### Measurable Outcomes

- **SC-201**: Successfully onboard 25 pilot users within 1 week.
- **SC-202**: Successfully register 100+ garments with correct barcoding.
- **SC-203**: Complete 25 first-week cycles with >90% success rate.
- **SC-204**: Achieve >80% user satisfaction with fit on first cycle.
- **SC-205**: Process all returns within 10 days of return window opening.
- **SC-206**: Maintain <5% inventory shrinkage (loss + damage) over pilot.
- **SC-207**: Generate complete data export for post-pilot analysis.
- **SC-208**: Document all exceptions and resolutions for process improvement.
