# Tasks: Weekly Cycle Flow

**Input**: Design documents from `/specs/features/weekly-cycle-flow/`
**Prerequisites**: State Authority complete (all tasks), plan.md (complete), data-model.md (complete)

**Platform**: Airtable + Retool
**Tests**: Manual validation via quickstart.md scenarios

## Phase 1: Setup (Additional Tables)

**Purpose**: Create orchestration tables in existing Airtable base

- [ ] T101 Create `Configuration` table with fields from data-model.md
- [ ] T102 Populate Configuration with default values (scheduling_day, timing thresholds, etc.)
- [ ] T103 [P] Create `SchedulingJobs` table with fields from data-model.md
- [ ] T104 [P] Create `CommitmentBatches` table with fields from data-model.md
- [ ] T105 [P] Create `ShipmentBatches` table with fields from data-model.md
- [ ] T106 [P] Create `ReturnReminders` table with fields from data-model.md
- [ ] T107 Add computed fields to Cycles table (ship_date, wear_window_ends, days_overdue, etc.)
- [ ] T108 Create new Cycles views (Ready to Commit, Ready to Ship, Awaiting Return, Overdue)

**Checkpoint**: All orchestration tables created, Cycles table enhanced

---

## Phase 2: Foundational (Scheduled Automations)

**Purpose**: Implement time-based automations that drive the weekly cadence

**⚠️ CRITICAL**: These automations are the backbone of weekly cadence

- [ ] T109 Create Airtable Automation: `AutoScheduleCycles`
  - Trigger: Scheduled (Sunday 18:00)
  - Script: Query Active users, create Scheduled cycles
  - Action: Create SchedulingJob record
- [ ] T110 Create Airtable Automation: `AutoCommitCycles`
  - Trigger: Scheduled (Daily 06:00)
  - Script: Query cycles at commitment deadline, validate, commit
  - Action: Create CommitmentBatch record
- [ ] T111 Create Airtable Automation: `AutoProgressWearWindow`
  - Trigger: Scheduled (Hourly)
  - Script: Transition Delivered→WearWindowOpen→ReturnWindowOpen
  - Action: Create ReturnReminder if entering return window
- [ ] T112 Create Airtable Automation: `CheckOverdueReturns`
  - Trigger: Scheduled (Daily 09:00)
  - Script: Check overdue cycles, escalate reminders, apply holds
- [ ] T113 Create Airtable Automation: `SendReturnReminders`
  - Trigger: Scheduled (Daily 10:00)
  - Script: Mark due reminders as Sent or Skipped
- [ ] T114 Test scheduled automations with manual triggers
  - Verify each automation runs correctly when triggered manually
  - Check logs and created records

**Checkpoint**: All scheduled automations functional

---

## Phase 3: User Story 1 - Weekly Scheduling (Priority: P1)

**Goal**: Verify auto-scheduling creates cycles for all active users

**Independent Test**: Run quickstart.md Scenario 1

### Retool: Scheduling Monitor

- [ ] T115 [US1] Create SchedulingMonitor page in `YFT-AdminConsole`
- [ ] T116 [US1] Add SchedulingJobs list view
  - Show: run_time, target_week, users_eligible, cycles_created, status
  - Sort by: run_time DESC
- [ ] T117 [US1] Add SchedulingJob detail view
  - Show counts and any errors
  - Link to created cycles
- [ ] T118 [US1] Add "Run Scheduling Now" button (manual trigger for testing)

**Checkpoint**: Can monitor and manually trigger scheduling

---

## Phase 4: User Story 2 - Commitment & Inventory Lock (Priority: P1)

**Goal**: Commitment locks inventory when conditions met

**Independent Test**: Run quickstart.md Scenarios 2, 3

### Retool: Commitment Monitor

- [ ] T119 [US2] Create CommitmentMonitor page in `YFT-AdminConsole`
- [ ] T120 [US2] Add CommitmentBatches list view
  - Show: commitment_time, cycles_committed, cycles_blocked, status
- [ ] T121 [US2] Add CommitmentBatch detail view
  - Show blocked cycles with reasons
  - Show substitutions made
- [ ] T122 [US2] Add "Run Commitment Now" button (manual trigger)
- [ ] T123 [US2] Enhance CycleManager to show commitment-ready cycles
  - Filter: Ready to Commit view
  - Manual commit option for individual cycles

**Checkpoint**: Can monitor commitment, understand blocks

---

## Phase 5: User Story 3 - Fulfillment Workflow (Priority: P1)

**Goal**: Operators pack boxes with scan-based accuracy

**Independent Test**: Run quickstart.md Scenario 4

### Retool: Fulfillment Queue

- [ ] T124 [US3] Create FulfillmentQueue page in `YFT-WarehouseOps`
- [ ] T125 [US3] Add queue list view
  - Show committed cycles ordered by ship_date
  - Columns: cycle_id, user, ship_date, box_id, garment_count, status
- [ ] T126 [US3] Add "Start Packing" action per row
  - Transitions box to Picking, cycle to FulfillmentInProgress
  - Opens BoxPacker for that box
- [ ] T127 [US3] Add queue filters (by ship_date, status)
- [ ] T128 [US3] Add queue statistics (total pending, today's shipments)

**Checkpoint**: Operators have prioritized packing queue

---

## Phase 6: User Story 4 - Shipment & Delivery (Priority: P1)

**Goal**: Bulk ship operations, delivery confirmation

**Independent Test**: Run quickstart.md Scenario 4 (continued)

### Retool: Shipment Dashboard

- [ ] T129 [US4] Create ShipmentDashboard page in `YFT-WarehouseOps`
- [ ] T130 [US4] Add "Ready to Ship" list
  - Boxes in PackedVerified state
  - Editable tracking number field per row
- [ ] T131 [US4] Add "Ship Selected" bulk action
  - Select multiple boxes
  - Enter carrier (or default)
  - Transitions all selected to Shipped
  - Creates ShipmentBatch record
- [ ] T132 [US4] Add shipment history view
  - Past ShipmentBatches
  - Drill into batch details
- [ ] T133 [US4] Add delivery confirmation workflow to CycleManager
  - For cycles in OutboundInTransit
  - Enter delivery date
  - Triggers transition to Delivered

**Checkpoint**: Can bulk ship and confirm deliveries

---

## Phase 7: User Story 5 - Wear Window Management (Priority: P2)

**Goal**: Automatic window progression

**Independent Test**: Run quickstart.md Scenario 5

- [ ] T134 [US5] Verify AutoProgressWearWindow automation handles Delivered→WearWindowOpen
- [ ] T135 [US5] Verify AutoProgressWearWindow handles WearWindowOpen→ReturnWindowOpen
- [ ] T136 [US5] Add wear window status to CycleManager
  - Show: current state, window_ends date, days remaining/overdue
- [ ] T137 [US5] Add timeline visualization for cycle states
  - Visual: scheduled → committed → shipped → delivered → wear → return → closed

**Checkpoint**: Windows progress automatically

---

## Phase 8: User Story 6 - Return Flow (Priority: P1)

**Goal**: Track returns from pickup to receipt

**Independent Test**: Run quickstart.md Scenario 6

### Retool: Receiving Station

- [ ] T138 [US6] Create ReceivingStation page in `YFT-WarehouseOps`
- [ ] T139 [US6] Add "Expected Returns" list
  - Cycles in ReturnInTransit state
  - Show: box_id, user, tracking, expected garments
- [ ] T140 [US6] Add box barcode scanner input
  - On scan: lookup box, display contents
- [ ] T141 [US6] Add "Receive" action
  - Transitions box to Received, cycle to CloseoutInspection
  - Transitions garments to ReceivedReturn
  - Opens InspectionStation for received box
- [ ] T142 [US6] Add return initiation to CycleManager
  - For cycles in ReturnWindowOpen
  - Enter return tracking
  - Transitions to ReturnInTransit

**Checkpoint**: Can receive returns and queue for inspection

---

## Phase 9: User Story 7 - Closeout & Settlement (Priority: P1)

**Goal**: Inspect, route, and settle cycles

**Independent Test**: Run quickstart.md Scenario 6 (continued)

### Retool: Enhanced Inspection Station

- [ ] T143 [US7] Enhance InspectionStation with closeout workflow
- [ ] T144 [US7] Add garment inspection form
  - Condition grade selection (A/B/C/D/F)
  - Route selection (Refurbish/Repair/Quarantine/Retired)
  - Notes field
- [ ] T145 [US7] Add "Not Returned" option for missing garments
  - Creates MissingGarment event
  - Transitions garment to Lost
- [ ] T146 [US7] Add inspection progress indicator
  - Show: X of Y garments inspected
- [ ] T147 [US7] Add "Settle Cycle" action
  - Available when all garments inspected
  - Computes settlement (placeholder for pilot)
  - Transitions cycle to Settled
- [ ] T148 [US7] Add "Close Cycle" action
  - Transitions cycle to Closed, box to Closed

**Checkpoint**: Complete closeout workflow

---

## Phase 10: User Story 8 - Exception Handling (Priority: P2)

**Goal**: Clear workflows for late returns, missing items

**Independent Test**: Run quickstart.md Scenarios 7, 8

### Retool: Exception Workflow

- [ ] T149 [US8] Create ExceptionWorkflow page in `YFT-AdminConsole`
- [ ] T150 [US8] Add "Overdue Returns" dashboard
  - Cycles past return window
  - Show: days_overdue, user, hold_status
- [ ] T151 [US8] Add late return resolution workflow
  - View cycle details
  - Manually apply/release holds
  - Record exception notes
- [ ] T152 [US8] Add "Missing Items" report
  - Garments in Lost state from inspection
  - Link to cycle, user
- [ ] T153 [US8] Add damage report form
  - Log user-reported damage
  - Flag garment for special inspection

**Checkpoint**: Exception cases have clear workflows

---

## Phase 11: Integration & Testing

**Purpose**: End-to-end validation

- [ ] T154 Run quickstart.md Scenario 1: Auto-Scheduling
- [ ] T155 [P] Run quickstart.md Scenario 2: Commitment Success
- [ ] T156 [P] Run quickstart.md Scenario 3: Commitment Blocked
- [ ] T157 Run quickstart.md Scenario 4: Fulfillment to Shipment
- [ ] T158 Run quickstart.md Scenario 5: Delivery to Wear Window
- [ ] T159 Run quickstart.md Scenario 6: Return Flow
- [ ] T160 Run quickstart.md Scenario 7: Late Return Escalation
- [ ] T161 Run quickstart.md Scenario 8: Missing Garment
- [ ] T162 Run quickstart.md Scenario 9: Full Week Simulation
- [ ] T163 [P] Run quickstart.md Scenario 10: Capacity Constraint
- [ ] T164 Document issues found, create follow-up tasks
- [ ] T165 Configure pilot timing parameters in Configuration table

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Depends on State Authority complete
- **Foundational (Phase 2)**: Depends on Phase 1
- **User Stories (Phases 3-10)**: All depend on Phase 2
  - US1-US4, US6-US7 are P1 - do first
  - US5, US8 are P2 - do after P1 complete
- **Testing (Phase 11)**: Depends on all user stories

### Task Dependencies Within Phases

- T101, T102 sequential (create then populate)
- T103-T106 can run parallel (independent tables)
- T107, T108 depend on T101 (Configuration for formulas)
- Automations (T109-T114) sequential (test each before next)

### Parallel Opportunities

**Phase 1 parallel group**:
```
T103: SchedulingJobs table
T104: CommitmentBatches table
T105: ShipmentBatches table
T106: ReturnReminders table
```

**Phase 11 parallel group**:
```
T155: Commitment Success
T156: Commitment Blocked
T163: Capacity Constraint
```

---

## Implementation Strategy

### MVP First (P1 User Stories)

1. Complete Phase 1: Setup (T101-T108)
2. Complete Phase 2: Automations (T109-T114)
3. Complete Phase 3: Scheduling Monitor (T115-T118)
4. **VALIDATE**: Run Scenario 1
5. Complete Phase 4: Commitment Monitor (T119-T123)
6. **VALIDATE**: Run Scenarios 2, 3
7. Complete Phase 5: Fulfillment Queue (T124-T128)
8. Complete Phase 6: Shipment Dashboard (T129-T133)
9. **VALIDATE**: Run Scenario 4
10. Complete Phase 8: Receiving Station (T138-T142)
11. Complete Phase 9: Closeout (T143-T148)
12. **VALIDATE**: Run Scenario 6

At this point, core weekly flow is operational.

### P2 Enhancement

13. Complete Phase 7: Wear Window (T134-T137)
14. Complete Phase 10: Exception Handling (T149-T153)
15. Complete Phase 11: Full Testing (T154-T165)

---

## Notes

- Automations run on schedule; test with manual triggers first
- Airtable automation limits: Keep scripts efficient
- Pilot timing can be compressed for testing (e.g., 1-day wear window)
- Remember: This builds on State Authority - entity transitions happen there
