# Launch Checklist: Pilot MVP

## Overview

This checklist verifies all systems are ready before onboarding pilot users. Complete all items before the first user is activated.

---

## Phase 1: Infrastructure Verification

### Airtable Base

- [ ] **A1.1** Base `YFT-StateAuthority` exists and is accessible
- [ ] **A1.2** All 17 tables created:
  - [ ] Users
  - [ ] Garments
  - [ ] Boxes
  - [ ] Cycles
  - [ ] Events
  - [ ] States
  - [ ] ErrorCodes
  - [ ] TransitionRules
  - [ ] Configuration
  - [ ] SchedulingJobs
  - [ ] CommitmentBatches
  - [ ] ShipmentBatches
  - [ ] ReturnReminders
  - [ ] FitProfiles
  - [ ] CommunicationEvents
  - [ ] PilotFeedback
- [ ] **A1.3** All linked record relationships configured
- [ ] **A1.4** All formula fields calculating correctly
- [ ] **A1.5** All views created and filtered correctly

### Airtable Automations

- [ ] **A2.1** Log Garment Transition automation enabled
- [ ] **A2.2** Enforce Lifecycle Bounds automation enabled
- [ ] **A2.3** Auto-Schedule Cycles automation enabled
- [ ] **A2.4** Auto-Commit Cycles automation enabled
- [ ] **A2.5** Auto-Progress Wear Window automation enabled
- [ ] **A2.6** Check Overdue Returns automation enabled
- [ ] **A2.7** All automations tested with sample data

### Retool Apps

- [ ] **R1.1** YFT-WarehouseOps app accessible
- [ ] **R1.2** YFT-AdminConsole app accessible
- [ ] **R1.3** Airtable resource `YFT-Airtable` connected and tested
- [ ] **R1.4** All queries return data without errors

### Retool Pages Functional

**YFT-AdminConsole:**
- [ ] **R2.1** Dashboard shows correct counts
- [ ] **R2.2** PilotDashboard shows KPIs
- [ ] **R2.3** UserManager can view/edit users
- [ ] **R2.4** UserOnboarding can create users
- [ ] **R2.5** CycleManager can view/create cycles
- [ ] **R2.6** AllocationWorkbench filters and allocates
- [ ] **R2.7** SchedulingMonitor shows job history
- [ ] **R2.8** CommitmentMonitor shows batch results
- [ ] **R2.9** ExceptionWorkflow shows overdue returns
- [ ] **R2.10** CommunicationLog can log communications
- [ ] **R2.11** FeedbackCapture can log feedback
- [ ] **R2.12** EventViewer shows event history
- [ ] **R2.13** DataExport generates files

**YFT-WarehouseOps:**
- [ ] **R3.1** GarmentScanner scans and transitions garments
- [ ] **R3.2** GarmentOnboarding registers new garments
- [ ] **R3.3** BoxPacker completes packing workflow
- [ ] **R3.4** FulfillmentQueue shows committed cycles
- [ ] **R3.5** ShipmentDashboard ships boxes
- [ ] **R3.6** ReceivingStation receives returns
- [ ] **R3.7** InspectionStation completes closeout

---

## Phase 2: Seed Data Verification

### Lookup Tables

- [ ] **S1.1** States table has all 44 states loaded
- [ ] **S1.2** ErrorCodes table has all error codes loaded
- [ ] **S1.3** TransitionRules table has all rules loaded
- [ ] **S1.4** Configuration table has all parameters set

### Configuration Parameters

Verify these values in Configuration table:

| Key | Expected Value | Actual | ✓ |
|-----|---------------|--------|---|
| scheduling_day | Sunday | | |
| scheduling_time | 18:00 | | |
| commitment_lead_hours | 48 | | |
| wear_window_days | 5 | | |
| return_window_days | 2 | | |
| reminder_day_1 | 1 | | |
| reminder_day_2 | 3 | | |
| hold_threshold_days | 7 | | |
| loss_threshold_days | 14 | | |
| ship_day_offset | 2 | | |

---

## Phase 3: Inventory Preparation

### Minimum Inventory Requirements

For 25 users with 3 items each = 75 garments minimum (recommend 100+ for substitution buffer)

- [ ] **I1.1** At least 100 garments registered in system
- [ ] **I1.2** Size distribution matches expected user distribution
- [ ] **I1.3** All garments have barcodes assigned
- [ ] **I1.4** All garments in `Available` state
- [ ] **I1.5** All garments have condition grade `A` or `B`

### Inventory by Size (Example Target)

| Size | Tops | Bottoms | Dresses | Total | ✓ |
|------|------|---------|---------|-------|---|
| XS | 5 | 3 | 2 | 10 | |
| S | 10 | 6 | 4 | 20 | |
| M | 15 | 10 | 6 | 31 | |
| L | 12 | 8 | 5 | 25 | |
| XL | 8 | 5 | 3 | 16 | |
| **Total** | 50 | 32 | 20 | **102** | |

### Box Containers

- [ ] **I2.1** At least 30 box containers registered
- [ ] **I2.2** All boxes have barcodes assigned
- [ ] **I2.3** All boxes in `Created` state

---

## Phase 4: Logistics Preparation

### Shipping Setup

- [ ] **L1.1** Return labels printed or printable
- [ ] **L1.2** Carrier account set up (UPS/USPS/FedEx)
- [ ] **L1.3** Shipping materials available (boxes, packing)
- [ ] **L1.4** Tracking number workflow documented

### Receiving Setup

- [ ] **L2.1** Receiving area designated
- [ ] **L2.2** Barcode scanner available and tested
- [ ] **L2.3** Inspection station set up
- [ ] **L2.4** Quarantine area designated

---

## Phase 5: Process Verification

### End-to-End Test Cycle

Complete one full cycle with a test user:

- [ ] **P1.1** Create test user via UserOnboarding
- [ ] **P1.2** Create fit profile for test user
- [ ] **P1.3** Manually trigger scheduling job
- [ ] **P1.4** Verify cycle created in `Scheduled` state
- [ ] **P1.5** Allocate garments via AllocationWorkbench
- [ ] **P1.6** Verify box created with garments
- [ ] **P1.7** Manually trigger commitment job
- [ ] **P1.8** Verify cycle in `Committed` state
- [ ] **P1.9** Verify garments in `Reserved` state
- [ ] **P1.10** Pack box via BoxPacker
- [ ] **P1.11** Ship box via ShipmentDashboard
- [ ] **P1.12** Confirm delivery (manual)
- [ ] **P1.13** Verify cycle progresses to `WearWindowOpen`
- [ ] **P1.14** Manually advance to `ReturnWindowOpen`
- [ ] **P1.15** Receive return via ReceivingStation
- [ ] **P1.16** Inspect garments via InspectionStation
- [ ] **P1.17** Complete closeout
- [ ] **P1.18** Verify cycle in `Closed` state
- [ ] **P1.19** Verify garments back to `Available` or routed

### Communication Test

- [ ] **P2.1** Send test BoxShipping email
- [ ] **P2.2** Send test DeliveryConfirmed email
- [ ] **P2.3** Send test ReturnReminder email
- [ ] **P2.4** Log all test communications

### Exception Test

- [ ] **P3.1** Test overdue return workflow
- [ ] **P3.2** Test hold application
- [ ] **P3.3** Test hold removal

---

## Phase 6: Operator Readiness

### Documentation

- [ ] **O1.1** Email templates accessible to operators
- [ ] **O1.2** SOPs accessible to operators
- [ ] **O1.3** This launch checklist completed

### Training

- [ ] **O2.1** Operators trained on UserOnboarding
- [ ] **O2.2** Operators trained on GarmentOnboarding
- [ ] **O2.3** Operators trained on AllocationWorkbench
- [ ] **O2.4** Operators trained on fulfillment workflow
- [ ] **O2.5** Operators trained on receiving workflow
- [ ] **O2.6** Operators trained on inspection workflow
- [ ] **O2.7** Operators trained on exception handling
- [ ] **O2.8** Operators trained on communication logging

### Access

- [ ] **O3.1** All operators have Retool access
- [ ] **O3.2** All operators have Airtable access (read-only recommended)
- [ ] **O3.3** All operators have email access for communications

---

## Phase 7: Final Verification

### System Health

- [ ] **F1.1** No orphaned records in any table
- [ ] **F1.2** All automations running on schedule
- [ ] **F1.3** No error events in last 24 hours
- [ ] **F1.4** Dashboard shows accurate counts

### Pilot Parameters

| Parameter | Value | Confirmed |
|-----------|-------|-----------|
| Pilot user capacity | 25 | |
| Items per box | 3 | |
| Wear window | 5 days | |
| Return window | 2 days | |
| First scheduling date | [Date] | |
| First ship date | [Date] | |

---

## Launch Approval

### Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Operations Lead | | | |
| Technical Lead | | | |

### Go/No-Go Decision

- [ ] **All checklist items completed**
- [ ] **All sign-offs obtained**
- [ ] **Launch date confirmed: _______________**

---

## Post-Launch Monitoring (Week 1)

### Daily Checks

- [ ] Review PilotDashboard for anomalies
- [ ] Check SchedulingMonitor for job success
- [ ] Check CommitmentMonitor for blocked cycles
- [ ] Review ExceptionWorkflow for new exceptions
- [ ] Send any due communications

### Weekly Review

- [ ] Export pilot data for analysis
- [ ] Calculate KPIs against targets
- [ ] Document lessons learned
- [ ] Adjust processes as needed
