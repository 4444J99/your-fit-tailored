# Tasks: State Authority Subsystem

**Input**: Design documents from `/specs/features/state-authority/`
**Prerequisites**: plan.md (complete), spec.md (complete), data-model.md (complete), contracts/ (complete)

**Platform**: Airtable + Retool
**Tests**: Manual validation via quickstart.md scenarios

## Phase 1: Setup (Airtable Base Structure)

**Purpose**: Create the Airtable base and table schema

- [ ] T001 Create Airtable base `YFT-StateAuthority`
- [ ] T002 [P] Create `States` lookup table with entity states from data-model.md
- [ ] T003 [P] Create `ErrorCodes` lookup table with codes from contracts
- [ ] T004 Create `Users` table with fields from data-model.md
- [ ] T005 Create `Garments` table with fields from data-model.md
- [ ] T006 Create `Boxes` table with fields from data-model.md
- [ ] T007 Create `Cycles` table with fields from data-model.md
- [ ] T008 Create `Events` table with fields from data-model.md
- [ ] T009 Create `TransitionRules` table with fields from data-model.md
- [ ] T010 Configure linked record relationships between tables

**Checkpoint**: All tables created with correct fields and relationships

---

## Phase 2: Foundational (Transition Rules & Automations)

**Purpose**: Implement state machine logic in Airtable Automations

**⚠️ CRITICAL**: No Retool UI work can begin until automations are functional

- [ ] T011 Populate `TransitionRules` table with garment transitions from contracts/garment-transitions.md
- [ ] T012 [P] Populate `TransitionRules` table with cycle transitions from contracts/cycle-transitions.md
- [ ] T013 [P] Populate `TransitionRules` table with user transitions from contracts/user-transitions.md
- [ ] T014 [P] Populate `TransitionRules` table with box transitions from contracts/box-transitions.md
- [ ] T015 Create Airtable Automation: `ValidateGarmentTransition`
  - Trigger: When Garment record updated (asset_state field)
  - Script: Query TransitionRules, validate preconditions
  - Action: Allow or reject, log to Events
- [ ] T016 [P] Create Airtable Automation: `ValidateCycleTransition`
  - Trigger: When Cycle record updated (cycle_state field)
  - Script: Query TransitionRules, validate preconditions
  - Action: Allow or reject, log to Events
- [ ] T017 [P] Create Airtable Automation: `ValidateUserTransition`
  - Trigger: When User record updated (operational_state field)
  - Script: Query TransitionRules, validate preconditions
  - Action: Allow or reject, log to Events
- [ ] T018 [P] Create Airtable Automation: `ValidateBoxTransition`
  - Trigger: When Box record updated (container_state field)
  - Script: Query TransitionRules, validate preconditions
  - Action: Allow or reject, log to Events
- [ ] T019 Create Airtable Automation: `LogTransitionEvent`
  - Trigger: After any successful transition
  - Action: Create Events record with full metadata
- [ ] T020 Create Airtable Automation: `EnforceLifecycleBounds`
  - Trigger: When Garment transitions to ReceivedReturn
  - Script: Check wear_count vs max_wear_limit
  - Action: If exceeded, force transition to Retired
- [ ] T021 Create Airtable Automation: `EnforceWeeklyUniqueness`
  - Trigger: When Cycle created
  - Script: Check for existing cycle with same user_id + week_id
  - Action: Reject if duplicate exists

**Checkpoint**: All automations functional, manual testing confirms transitions work

---

## Phase 3: User Story 1 - Garment State Tracking (Priority: P1)

**Goal**: Operators can scan garments and track state through full lifecycle

**Independent Test**: Run quickstart.md Scenario 1 (Happy Path)

### Retool App: Garment Scanner

- [ ] T022 [US1] Create Retool app `YFT-WarehouseOps`
- [ ] T023 [US1] Create GarmentScanner page in YFT-WarehouseOps
  - Barcode input field (manual or camera)
  - Display: current garment state, cycle_id, box_id
  - Display: lifecycle counters (wear_count, condition_grade)
- [ ] T024 [US1] Add transition action buttons to GarmentScanner
  - Only show valid next states based on current state
  - Button click triggers Airtable update → automation validates
- [ ] T025 [US1] Add error handling to GarmentScanner
  - Display rejection reason from ErrorCodes table
  - Clear, actionable messages
- [ ] T026 [US1] Create Retool Mobile app `YFT-Mobile`
- [ ] T027 [US1] Add GarmentScanner to mobile app with barcode camera

**Checkpoint**: Can scan garment through Available → Reserved → Packed → etc.

---

## Phase 4: User Story 2 - Cycle State Progression (Priority: P1)

**Goal**: System tracks cycles through deterministic progression

**Independent Test**: Run quickstart.md Scenarios 1, 4 (Happy Path, Duplicate Prevention)

### Retool App: Cycle Manager

- [ ] T028 [US2] Create CycleManager page in `YFT-AdminConsole` app
- [ ] T029 [US2] Add cycle creation form
  - Select user (from Active users only)
  - Select week_id (auto-suggest next available)
  - System checks uniqueness before creation
- [ ] T030 [US2] Add cycle list view with filters
  - Filter by: cycle_state, user, week
  - Sort by: created, state
- [ ] T031 [US2] Add cycle detail view
  - Show all timestamps (scheduled_at, committed_at, etc.)
  - Show associated box and garments
  - Show event history for this cycle
- [ ] T032 [US2] Add state transition actions
  - Commit button (validates user state, box state)
  - Manual state overrides with reason (admin only)

**Checkpoint**: Can create cycles, system enforces one per user/week

---

## Phase 5: User Story 3 - User Contract State (Priority: P1)

**Goal**: User eligibility gates cycle operations

**Independent Test**: Run quickstart.md Scenarios 6, 7 (Payment Hold, Late Return Hold)

### Retool App: User Manager

- [ ] T033 [US3] Create UserManager page in `YFT-AdminConsole`
- [ ] T034 [US3] Add user list view with state badges
  - Visual indicator for each hold type
  - Filter by operational_state
- [ ] T035 [US3] Add user detail view
  - Show operational_state with change history
  - Show active cycles
  - Show garments in custody
- [ ] T036 [US3] Add manual state transition controls
  - Apply/Remove holds with reason
  - State changes logged to Events

**Checkpoint**: Can apply holds, verify commitment blocked

---

## Phase 6: User Story 4 - Box Contents Integrity (Priority: P2)

**Goal**: Packing variance detection and resolution

**Independent Test**: Run quickstart.md Scenario 2 (Packing Variance)

### Retool App: Box Packer

- [ ] T037 [US4] Create BoxPacker page in `YFT-WarehouseOps`
- [ ] T038 [US4] Add box selection (filter by Picking state)
- [ ] T039 [US4] Display planned_contents vs actual_contents
  - Visual diff: missing items, extra items
  - Live update as garments scanned
- [ ] T040 [US4] Add variance detection logic
  - Compare planned_contents to actual_contents
  - Highlight discrepancies
- [ ] T041 [US4] Add variance resolution workflow
  - Option 1: "Correct" - remove/add garments to match plan
  - Option 2: "Commit Observed" - ship as-is with compensating event
- [ ] T042 [US4] Block "Verify Pack" until variance resolved
- [ ] T043 [US4] Create `CompensatingAllocation` event on commit observed

**Checkpoint**: Variance detected, resolved, documented

---

## Phase 7: User Story 5 - Audit Trail (Priority: P2)

**Goal**: Complete event history, queryable

**Independent Test**: Run quickstart.md Scenarios 8, 9 (Event Reconstruction, Idempotency)

### Retool App: Event Viewer

- [ ] T044 [US5] Create EventViewer page in `YFT-AdminConsole`
- [ ] T045 [US5] Add event search/filter
  - Filter by: entity_type, entity_id, transition_type, date range
  - Full-text search in metadata
- [ ] T046 [US5] Add event detail view
  - Show all event fields
  - Link to related entity
- [ ] T047 [US5] Add entity history reconstruction
  - Select entity, show all events in sequence
  - Visual timeline of state changes
- [ ] T048 [US5] Implement idempotency_key handling in automations
  - Check for existing event with same key
  - Skip duplicate operations

**Checkpoint**: Can trace any entity's complete history

---

## Phase 8: Integration & Views

**Purpose**: Cross-cutting views and dashboards

- [ ] T049 Create Airtable Views per data-model.md
  - Users: Active, On Hold
  - Garments: Available Inventory, In Circulation, Pending Inspection, Near Lifecycle Limit
  - Cycles: Open, This Week, Overdue Returns
  - Events: Recent, Rejections
- [ ] T050 [P] Create Dashboard page in `YFT-AdminConsole`
  - Active users count
  - Garments by state
  - Cycles by state
  - Recent rejections alert
- [ ] T051 [P] Create InspectionStation page in `YFT-WarehouseOps`
  - Filter garments in ReceivedReturn state
  - Condition grading form
  - One-click transition to Refurbish/Repair/Quarantine/Retired

---

## Phase 9: Polish & Testing

**Purpose**: Validate against quickstart.md, clean up

- [ ] T052 Run quickstart.md Scenario 1: Happy Path
- [ ] T053 [P] Run quickstart.md Scenario 2: Packing Variance
- [ ] T054 [P] Run quickstart.md Scenario 3: Double Allocation Prevention
- [ ] T055 [P] Run quickstart.md Scenario 4: Duplicate Cycle Prevention
- [ ] T056 [P] Run quickstart.md Scenario 5: Lifecycle Bounds
- [ ] T057 [P] Run quickstart.md Scenario 6: Payment Hold
- [ ] T058 [P] Run quickstart.md Scenario 7: Late Return Hold
- [ ] T059 [P] Run quickstart.md Scenario 8: Event Reconstruction
- [ ] T060 [P] Run quickstart.md Scenario 9: Idempotent Transitions
- [ ] T061 Run quickstart.md Scenario 10: Bounded Uncertainty
- [ ] T062 Document any issues found, create follow-up tasks
- [ ] T063 Create seed data for pilot (5 users, 50 garments, 5 boxes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start here
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all UI work
- **User Stories (Phases 3-7)**: All depend on Phase 2
  - US1, US2, US3 are P1 - do first
  - US4, US5 are P2 - do after P1 complete
- **Integration (Phase 8)**: Depends on all user stories
- **Testing (Phase 9)**: Depends on Integration

### Task Dependencies Within Phases

- T002, T003 can run parallel
- T004-T010 sequential (table creation order matters for links)
- T011-T014 can run parallel (populating different rule sets)
- T015-T018 can run parallel (different automations)
- Within each user story, tasks are sequential

### Parallel Opportunities

**Phase 1 parallel group**:
```
T002: Create States lookup
T003: Create ErrorCodes lookup
```

**Phase 2 parallel group (after T011)**:
```
T012: Cycle transition rules
T013: User transition rules
T014: Box transition rules
```

**Phase 2 parallel group (after T015)**:
```
T016: ValidateCycleTransition automation
T017: ValidateUserTransition automation
T018: ValidateBoxTransition automation
```

**Phase 9 parallel group**:
```
T052-T061: All quickstart scenarios (different test paths)
```

---

## Implementation Strategy

### MVP First (P1 User Stories)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T021)
3. Complete Phase 3: Garment Tracking (T022-T027)
4. **VALIDATE**: Run Scenarios 1, 3, 5 from quickstart.md
5. Complete Phase 4: Cycle Progression (T028-T032)
6. **VALIDATE**: Run Scenarios 1, 4 from quickstart.md
7. Complete Phase 5: User Contract State (T033-T036)
8. **VALIDATE**: Run Scenarios 6, 7 from quickstart.md

At this point, core state authority is functional for pilot.

### P2 Enhancement

9. Complete Phase 6: Box Contents (T037-T043)
10. Complete Phase 7: Audit Trail (T044-T048)
11. Complete Phase 8: Integration (T049-T051)
12. Complete Phase 9: Full Testing (T052-T063)

---

## Notes

- Airtable has 5 req/sec rate limit - batch operations where possible
- Retool query caching helps with rate limits
- Test automations individually before combining
- Keep automation scripts under Airtable's execution time limits
- Use formula fields for computed values instead of automations where possible
