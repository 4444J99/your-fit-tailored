# Quickstart: Pilot MVP Launch

**Feature**: Pilot MVP
**Purpose**: Launch checklist and validation procedures for pilot start

---

## Pre-Launch Checklist

### Week -2: System Verification

#### State Authority (must be complete)
- [ ] All entity tables created (Users, Garments, Boxes, Cycles, Events)
- [ ] All transition automations functional
- [ ] All Retool apps working (GarmentScanner, BoxPacker, InspectionStation)
- [ ] Run State Authority quickstart scenarios 1-10: all pass

#### Weekly Cycle Flow (must be complete)
- [ ] All orchestration tables created (Configuration, SchedulingJobs, etc.)
- [ ] All scheduled automations functional
- [ ] All Retool pages working (FulfillmentQueue, ShipmentDashboard, etc.)
- [ ] Run Weekly Cycle Flow quickstart scenarios 1-10: all pass

### Week -1: Pilot Infrastructure

#### Pilot-Specific Tables
- [ ] FitProfiles table created
- [ ] CommunicationEvents table created
- [ ] PilotFeedback table created

#### Pilot-Specific Retool Pages
- [ ] UserOnboarding page functional
- [ ] GarmentOnboarding page functional
- [ ] AllocationWorkbench page functional
- [ ] PilotDashboard page functional

#### Physical Infrastructure
- [ ] Inventory procured (100+ garments across sizes)
- [ ] Barcodes printed and affixed to all garments
- [ ] Boxes procured (10+ reusable containers)
- [ ] Barcodes printed and affixed to all boxes
- [ ] Facility setup: packing station, receiving station, inspection station
- [ ] Barcode scanners working with Retool Mobile

#### Operations Ready
- [ ] Carrier account created and verified
- [ ] Return label generation process tested
- [ ] Email templates created for all trigger points
- [ ] SOPs documented for all manual processes
- [ ] Operators trained on all workflows

### Day -3: User & Inventory Onboarding

#### User Onboarding
- [ ] All 25 pilot users agreements signed
- [ ] All 25 users entered in system (Active state)
- [ ] Fit profiles captured for all 25 users
- [ ] Weekly anchors set for all users
- [ ] Addresses and payment verified for all users

#### Inventory Onboarding
- [ ] All garments registered in system (Available state)
- [ ] Size distribution verified against user needs
- [ ] Condition grades set (should all be A for new inventory)
- [ ] Lifecycle limits configured

### Day -1: Final Verification

#### Test Cycle
- [ ] Create test cycle for internal user
- [ ] Execute full flow: schedule → commit → pack → ship → deliver → return → closeout
- [ ] Verify all automations fire correctly
- [ ] Verify all UI workflows work
- [ ] Verify data logged correctly

#### System Check
- [ ] Scheduling automation enabled for pilot start
- [ ] Configuration table has correct pilot timing
- [ ] PilotDashboard shows correct counts
- [ ] All operators have access to needed Retool apps

---

## Launch Day Procedures

### Day 0: Scheduling

1. **Verify Scheduling Runs**
   - Check: AutoScheduleCycles automation ran
   - Check: SchedulingJob record created with 25 users, 25 cycles
   - Check: All cycles in Scheduled state

2. **Verify Allocations Ready**
   - Check: Each cycle has box assigned
   - Check: Each box has planned_contents
   - Check: Planned garments match user fit profiles

3. **Operator Briefing**
   - Review: Week 1 cycle count and timing
   - Review: Exception procedures
   - Assign: Operator responsibilities

### Day 1: Commitment

1. **Verify Commitment Runs**
   - Check: AutoCommitCycles automation ran
   - Check: CommitmentBatch record created
   - Check: cycles_committed = 25 (or reason for any blocked)

2. **Handle Blocks**
   - For any blocked cycles: investigate, resolve, manually commit
   - Document: Exception reasons in PilotFeedback

3. **Start Fulfillment**
   - Begin packing boxes in priority order
   - Use FulfillmentQueue to track progress

### Day 2: Packing & Shipping

1. **Complete Packing**
   - All boxes packed and verified
   - Any variance documented and resolved

2. **Ship All Boxes**
   - Enter tracking numbers
   - Create ShipmentBatch
   - Transition all to Shipped

3. **Send Communications**
   - "Your box is on its way" to all users
   - Log in CommunicationEvents

### Days 3-5: Delivery & Wear Window

1. **Monitor Deliveries**
   - Enter delivery confirmations as received
   - Track any delivery exceptions

2. **Send Delivery Confirmations**
   - "Your box has arrived" to delivered users
   - Log in CommunicationEvents

3. **Monitor Dashboard**
   - All cycles should progress through Delivered → WearWindowOpen

### Days 6-7: Return Window

1. **Send Return Reminders**
   - Check ReturnReminders table
   - Send "time to return" messages
   - Log in CommunicationEvents

2. **Track Return Initiations**
   - Enter return tracking as available
   - Monitor for late returns

### Week 2+: Returns & Closeout

1. **Receive Returns**
   - Scan incoming boxes at receiving
   - Queue garments for inspection

2. **Inspect Garments**
   - Complete condition grading
   - Route appropriately (Refurbish, Repair, etc.)

3. **Settle & Close Cycles**
   - Trigger settlement for inspected cycles
   - Close cycles
   - Verify garments back in Available pool

4. **Repeat**
   - Next scheduling runs automatically
   - Continue weekly cycle

---

## Validation Scenarios

### Scenario P1: Full Pilot Cycle

Execute one complete week for all 25 users.

| Step | Expected Outcome | Actual | Pass/Fail |
|------|------------------|--------|-----------|
| Scheduling runs | 25 cycles created | | |
| Commitment runs | 25 cycles committed | | |
| All boxes packed | 25 boxes PackedVerified | | |
| All boxes shipped | 25 boxes Shipped | | |
| All deliveries confirmed | 25 cycles Delivered | | |
| Return window opens | 25 cycles ReturnWindowOpen | | |
| All returns received | 25 boxes Received | | |
| All garments inspected | All ReceivedReturn → Refurbish/etc | | |
| All cycles closed | 25 cycles Closed | | |
| Garments available | All garments back in Available | | |

### Scenario P2: Exception Handling

Simulate each exception type during pilot.

| Exception | Resolution | Verified | Notes |
|-----------|------------|----------|-------|
| User hold blocks commitment | Resolve hold, re-commit | | |
| Packing variance | Commit to observed | | |
| Delivery delay | Proxy delivery when user confirms | | |
| Late return (day 3) | Escalation reminder sent | | |
| Late return (day 7) | HoldLogistics applied | | |
| Missing garment | Loss charged, garment to Lost | | |
| Damaged garment | Quarantine or Retired | | |

### Scenario P3: Data Collection

Verify all pilot data is captured for analysis.

| Data Point | Location | Captured | Notes |
|------------|----------|----------|-------|
| Cycle timing (all timestamps) | Cycles table | | |
| Garment utilization (wear_count) | Garments table | | |
| Fit feedback | PilotFeedback table | | |
| Exception count by type | Events table | | |
| Communication events | CommunicationEvents table | | |

---

## Pilot Metrics Dashboard

### Daily Monitoring

| Metric | Target | Week 1 | Week 2 | Week 3 | Week 4 |
|--------|--------|--------|--------|--------|--------|
| Active users | 25 | | | | |
| Cycles scheduled | 25/week | | | | |
| Cycles committed | 25/week | | | | |
| On-time shipments | >95% | | | | |
| On-time deliveries | >90% | | | | |
| On-time returns | >90% | | | | |
| Exception rate | <10% | | | | |

### Weekly Analysis

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Cycle completion rate | >95% | | |
| Average cycle time (days) | <12 | | |
| Fit satisfaction (survey) | >80% | | |
| Inventory shrinkage | <5% | | |
| NPS | >50 | | |

---

## Post-Pilot Deliverables

1. **Data Export**
   - All tables exported to CSV
   - Events log for analysis
   - Feedback compiled

2. **Analysis Report**
   - Cycle performance metrics
   - Exception analysis
   - Fit satisfaction analysis
   - Unit economics assessment

3. **Process Improvements**
   - Document what worked
   - Document what needs automation
   - Prioritize production features

4. **Go/No-Go Decision**
   - Based on metrics vs targets
   - Based on user feedback
   - Based on unit economics
