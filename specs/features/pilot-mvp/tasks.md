# Tasks: Pilot MVP

**Input**: Design documents from `/specs/features/pilot-mvp/`
**Prerequisites**: State Authority complete, Weekly Cycle Flow complete, plan.md (complete)

**Platform**: Airtable + Retool
**Tests**: End-to-end pilot validation via quickstart.md

## Phase 1: Setup (Pilot-Specific Tables)

**Purpose**: Add tables for pilot-specific tracking

- [ ] T201 Create `FitProfiles` table
  - user_id (link to Users)
  - top_size, bottom_size, dress_size
  - style_preferences (multi-select)
  - notes
- [ ] T202 Create `CommunicationEvents` table
  - cycle_id (link to Cycles)
  - user_id (link to Users)
  - event_type (scheduled, shipped, delivered, return_reminder, etc.)
  - sent_at
  - channel (email/sms)
  - template_used
  - notes
- [ ] T203 Create `PilotFeedback` table
  - cycle_id (link to Cycles)
  - user_id (link to Users)
  - garment_id (link to Garments, optional)
  - feedback_type (fit, quality, experience)
  - rating (1-5)
  - comments
  - logged_at
  - logged_by
- [ ] T204 Create Airtable views for pilot monitoring
  - Users: Pilot Capacity (count Active users)
  - Garments: By Size (grouped)
  - Cycles: This Week, Last Week

**Checkpoint**: Pilot tables ready

---

## Phase 2: User Story 1 - User Onboarding (Priority: P1)

**Goal**: Operators can onboard pilot users

**Independent Test**: Onboard 3 test users, verify in Active state with fit profiles

### Retool: User Onboarding

- [ ] T205 [US1] Create UserOnboarding page in `YFT-AdminConsole`
- [ ] T206 [US1] Add user creation form
  - Name, email, phone
  - Shipping address
  - Payment method reference (pilot: just a note field)
  - Weekly anchor selection
- [ ] T207 [US1] Add fit profile section to onboarding
  - Top size, bottom size, dress size
  - Style preferences (checkboxes)
  - Notes
  - Creates FitProfile record linked to user
- [ ] T208 [US1] Add pilot capacity indicator
  - Show: X of 25 users onboarded
  - Block submission if at capacity
- [ ] T209 [US1] Add user list with quick status
  - Show all pilot users
  - Status badges (Active, Hold, etc.)
  - Link to full user detail

**Checkpoint**: Can onboard users with fit profiles

---

## Phase 3: User Story 2 - Inventory Onboarding (Priority: P1)

**Goal**: Operators can register physical inventory

**Independent Test**: Register 10 garments with barcodes, verify Available

### Retool: Garment Onboarding

- [ ] T210 [US2] Create GarmentOnboarding page in `YFT-AdminConsole`
- [ ] T211 [US2] Add garment registration form
  - Barcode scan input
  - SKU selection (from lookup)
  - Size selection
  - Initial condition grade
  - Notes
- [ ] T212 [US2] Add bulk registration mode
  - Scan multiple barcodes in sequence
  - Default values applied
  - Review and confirm batch
- [ ] T213 [US2] Add inventory summary dashboard
  - Count by size
  - Count by condition
  - Count by state
- [ ] T214 [US2] Add box registration section
  - Box barcode scan
  - Create BoxEntity in Created state

**Checkpoint**: Can register garments and boxes

---

## Phase 4: User Story 4 - Allocation (Priority: P1)

**Goal**: Operators can manually allocate garments to cycles

**Independent Test**: Allocate garments for 5 users based on fit profiles

### Retool: Allocation Workbench

- [ ] T215 [US4] Create AllocationWorkbench page in `YFT-AdminConsole`
- [ ] T216 [US4] Add cycle selection (scheduled cycles needing allocation)
- [ ] T217 [US4] Add user fit profile display
  - Show: sizes, preferences, past feedback
- [ ] T218 [US4] Add available garment browser
  - Filter by size (matching user profile)
  - Filter by style preference
  - Show: garment details, condition, lifecycle remaining
- [ ] T219 [US4] Add "Add to Box" action
  - Select garment → add to cycle's planned_contents
  - Garment stays Available until commitment (just planning)
- [ ] T220 [US4] Add planned contents display
  - Show garments planned for this cycle
  - Allow remove before commitment
- [ ] T221 [US4] Add "Complete Allocation" action
  - Validates minimum garment count
  - Marks cycle ready for commitment

**Checkpoint**: Can allocate garments to cycles based on fit

---

## Phase 5: User Story 5 - Monitoring Dashboard (Priority: P1)

**Goal**: Operators have visibility into pilot status

**Independent Test**: View dashboard with cycles in multiple states

### Retool: Pilot Dashboard

- [ ] T222 [US5] Create PilotDashboard page in `YFT-AdminConsole`
- [ ] T223 [US5] Add summary cards
  - Active users (count)
  - Available inventory (count)
  - Open cycles by state (breakdown)
  - Exceptions requiring attention (count)
- [ ] T224 [US5] Add cycle timeline view
  - Visual: cycles by state over time
  - Click to drill into cycle
- [ ] T225 [US5] Add alerts panel
  - Overdue returns
  - Blocked commitments
  - Low inventory warnings
- [ ] T226 [US5] Add quick actions
  - "Run Scheduling Now" button
  - "Run Commitment Now" button
  - Link to exception workflow

**Checkpoint**: Operators have clear visibility

---

## Phase 6: User Story 6 - Communications (Priority: P2)

**Goal**: Track communications sent to users

**Independent Test**: Log communications for one cycle, view history

### Retool: Communication Log

- [ ] T227 [US6] Create CommunicationLog page in `YFT-AdminConsole`
- [ ] T228 [US6] Add communication entry form
  - Select cycle/user
  - Select event type
  - Select template used
  - Mark as sent
- [ ] T229 [US6] Add communication history view
  - Filter by user, cycle, event type
  - Show sent_at, channel, template
- [ ] T230 [US6] Add pending communications list
  - Based on cycle state transitions
  - Show: which users need which communication
- [ ] T231 [US6] Create email templates document
  - Template: Cycle committed / box shipping
  - Template: Delivery confirmed
  - Template: Return reminder (day 1)
  - Template: Return reminder (day 3)
  - Template: Return overdue warning
  - Template: Hold applied notification

**Checkpoint**: Communications tracked and templated

---

## Phase 7: User Story 7 - Data Collection (Priority: P2)

**Goal**: Capture data for pilot analysis

**Independent Test**: Export data after test cycle, verify completeness

### Retool: Feedback & Export

- [ ] T232 [US7] Add feedback entry form to InspectionStation
  - After inspection, prompt for user feedback
  - Rating + comments
  - Link to garment and cycle
- [ ] T233 [US7] Add data export page to `YFT-AdminConsole`
- [ ] T234 [US7] Add export buttons
  - Export all cycles (CSV)
  - Export all events (CSV)
  - Export all feedback (CSV)
  - Export all garments (CSV)
- [ ] T235 [US7] Add pilot metrics summary view
  - Auto-calculated from data
  - Cycle completion rate
  - Exception rate
  - Fit satisfaction (average rating)

**Checkpoint**: Data collection and export functional

---

## Phase 8: User Story 8 - Exception Recovery (Priority: P1)

**Goal**: Clear recovery paths for all exception types

**Independent Test**: Simulate each exception, execute recovery

### Retool: Enhanced Exception Workflow

- [ ] T236 [US8] Enhance ExceptionWorkflow page (from Weekly Cycle Flow)
- [ ] T237 [US8] Add resolution actions for each exception type
  - Hold resolution: Contact user button, mark resolved, re-attempt commitment
  - Variance resolution: Commit to observed with reason
  - Late return: Send escalation, apply hold, declare loss
  - Missing item: Log loss, compute charge
  - Damage: Route to Quarantine/Retired with notes
- [ ] T238 [US8] Add exception documentation form
  - Capture: what happened, how resolved, lessons learned
  - Feeds into PilotFeedback for analysis
- [ ] T239 [US8] Add exception history view
  - All exceptions with resolutions
  - Filter by type, cycle, user

**Checkpoint**: All exception paths have clear resolution UI

---

## Phase 9: Integration & Launch Prep

**Purpose**: Prepare for pilot launch

### Pilot Readiness

- [ ] T240 Verify all State Authority quickstart scenarios pass
- [ ] T241 Verify all Weekly Cycle Flow quickstart scenarios pass
- [ ] T242 Run end-to-end test cycle (internal user)
  - Schedule → Commit → Pack → Ship → Deliver → Return → Closeout
- [ ] T243 Configure pilot timing in Configuration table
  - Set appropriate thresholds for pilot
  - Review with operations team
- [ ] T244 Create operator training materials
  - SOPs for each workflow
  - Quick reference cards
- [ ] T245 Conduct operator training session

### Data Seeding

- [ ] T246 Onboard all 25 pilot users
- [ ] T247 Capture fit profiles for all users
- [ ] T248 Register all pilot inventory (100+ garments)
- [ ] T249 Register all boxes (10+)
- [ ] T250 Verify size distribution matches user needs

### Final Verification

- [ ] T251 Run scheduling for Week 1
- [ ] T252 Complete allocation for all cycles
- [ ] T253 Verify PilotDashboard shows correct counts
- [ ] T254 Verify all automations enabled
- [ ] T255 Final walkthrough with operations team

**Checkpoint**: Ready for pilot launch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Depends on State Authority + Weekly Cycle Flow complete
- **User Stories (Phases 2-8)**: All depend on Phase 1
  - US1, US2, US4, US5, US8 are P1 - do first
  - US6, US7 are P2 - do after P1 complete
- **Integration (Phase 9)**: Depends on all phases, plus physical prep

### Task Dependencies

- T205-T209 sequential (build onboarding flow)
- T210-T214 can mostly parallel with T205-T209 (different pages)
- T222-T226 can parallel with allocation tasks
- T232-T235 depend on inspection station existing
- T240-T255 sequential (launch prep checklist)

### Parallel Opportunities

**Phase 1 parallel**:
```
T201: FitProfiles
T202: CommunicationEvents
T203: PilotFeedback
```

**Phase 2-4 parallel teams**:
```
Team A: T205-T209 (User Onboarding)
Team B: T210-T214 (Garment Onboarding)
Team C: T215-T221 (Allocation)
```

---

## Implementation Strategy

### MVP First (P1 User Stories)

1. Complete Phase 1: Setup (T201-T204)
2. Complete Phase 2: User Onboarding (T205-T209)
3. **VALIDATE**: Onboard test users
4. Complete Phase 3: Inventory Onboarding (T210-T214)
5. **VALIDATE**: Register test inventory
6. Complete Phase 4: Allocation (T215-T221)
7. **VALIDATE**: Allocate for test users
8. Complete Phase 5: Dashboard (T222-T226)
9. Complete Phase 8: Exception Recovery (T236-T239)
10. **VALIDATE**: Run end-to-end test cycle

At this point, MVP is ready for pilot.

### P2 Enhancement

11. Complete Phase 6: Communications (T227-T231)
12. Complete Phase 7: Data Collection (T232-T235)
13. Complete Phase 9: Integration & Launch (T240-T255)

### Launch Timeline

| Week | Milestone |
|------|-----------|
| -4 | State Authority complete |
| -3 | Weekly Cycle Flow complete |
| -2 | Pilot MVP P1 complete, physical prep |
| -1 | User/inventory onboarding, training |
| 0 | Pilot launch |

---

## Notes

- Physical infrastructure (inventory, boxes, facility) is parallel workstream
- Communications are manual for pilot—focus on getting content right
- Data collection enables learning; don't over-engineer analysis
- Exception handling is critical—operators need confidence
- Training is essential—schedule dedicated time
