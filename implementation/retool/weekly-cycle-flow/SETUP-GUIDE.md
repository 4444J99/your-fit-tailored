# Retool Setup Guide: Weekly Cycle Flow

## Prerequisites

- Retool apps from State Authority setup (YFT-WarehouseOps, YFT-AdminConsole)
- Airtable base with Weekly Cycle Flow tables created
- Airtable resource `YFT-Airtable` connected

## Overview

This guide adds 9 new pages to support the weekly cycle workflow:
- **SchedulingMonitor** - View scheduling job results
- **CommitmentMonitor** - View commitment batch results
- **FulfillmentQueue** - Manage boxes ready for packing
- **ShipmentDashboard** - Track and ship packed boxes
- **ReceivingStation** - Enhanced receiving workflow
- **InspectionStation** - Enhanced with closeout triggers
- **ExceptionWorkflow** - Handle exceptions and escalations

---

## Page 1: SchedulingMonitor (YFT-AdminConsole)

### Purpose
Monitor automated cycle scheduling results and troubleshoot issues.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Scheduling Monitor                      [Trigger Manual Run]│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Recent Scheduling Jobs                                 ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Time              Week      Created  Skipped  Status   ││
│  │  2024-01-14 18:00  2024-W03  23       2        Success  ││
│  │  2024-01-07 18:00  2024-W02  24       1        Success  ││
│  │  2024-01-01 18:00  2024-W01  25       0        Success  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Selected Job Details                                   ││
│  │  ──────────────────────────────────────────────────────│││
│  │  Job ID: 123                                            │ │
│  │  Run Time: 2024-01-14 18:00:05                         │ │
│  │  Target Week: 2024-W03                                 │ │
│  │  Duration: 12 seconds                                  │ │
│  │                                                        │ │
│  │  Results:                                               │ │
│  │  ● Users Eligible: 25                                  │ │
│  │  ● Cycles Created: 23                                  │ │
│  │  ● Cycles Skipped: 2 (already scheduled)               │ │
│  │                                                        │ │
│  │  Errors: (none)                                        │ │
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Skipped Users (this job)                               ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  User          Reason                                   ││
│  │  Alice Test    Already has cycle for 2024-W03          ││
│  │  Bob Test      Already has cycle for 2024-W03          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getSchedulingJobs**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: SchedulingJobs
// Sort: run_time DESC
// Limit: 20
```

**getJobDetails**
```javascript
// Resource: YFT-Airtable
// Action: Get Record
// Table: SchedulingJobs
// Record ID: {{schedulingJobsTable.selectedRow.data.id}}
```

**getScheduledCyclesForWeek**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: {week_id} = '{{selectedJob.target_week_id}}'
```

### Components

1. **schedulingJobsTable** (Table)
   - Data: `getSchedulingJobs.data`
   - Columns: run_time, target_week_id, cycles_created, cycles_skipped, status
   - Row selection: single

2. **jobDetailsContainer** (Container)
   - Show when: `schedulingJobsTable.selectedRow`
   - Display job metrics and error details

3. **errorsDisplay** (JSON Viewer)
   - Value: `JSON.parse(selectedJob.errors || '[]')`
   - Collapsible

4. **triggerManualButton** (Button)
   - Label: "Trigger Manual Run"
   - On click: Show confirmation modal, then trigger Airtable automation webhook

---

## Page 2: CommitmentMonitor (YFT-AdminConsole)

### Purpose
Monitor commitment batch results and investigate blocked cycles.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Commitment Monitor                      [Trigger Manual Run]│
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌─────────────────────────────┐ │
│  │  Commitment Stats     │  │  Recent Batches             │ │
│  │  ─────────────────    │  │  ─────────────────────────  │ │
│  │  Today's Commits: 5   │  │  Time         Committed     │ │
│  │  Pending: 3           │  │  01-15 06:00  5/5 ✓        │ │
│  │  Blocked: 2           │  │  01-14 06:00  4/5 ⚠        │ │
│  │                       │  │  01-13 06:00  5/5 ✓        │ │
│  └───────────────────────┘  └─────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Batch Details: 2024-01-14 06:00                        ││
│  │  ──────────────────────────────────────────────────────│││
│  │  Ship Date: 2024-01-16                                 │ │
│  │  Attempted: 5  |  Committed: 4  |  Blocked: 1          │ │
│  │  Substitutions: 0                                       │ │
│  │                                                         │ │
│  │  Blocked Cycles:                                        │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │  Cycle 45  |  User: Carol  |  Reason: user_hold │   │ │
│  │  │  [View User] [View Cycle]                       │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getCommitmentBatches**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: CommitmentBatches
// Sort: commitment_time DESC
// Limit: 20
```

**getBlockedCycles**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: AND(
//   {cycle_state} = 'Scheduled',
//   {week_id} = '{{selectedBatch.target_week_id}}'
// )
```

**getPendingCommitments**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: {cycle_state} = 'Scheduled'
```

### Components

1. **statsCards** (Container with Statistics)
   - Today's commits count
   - Pending cycles count
   - Blocked cycles count

2. **batchesTable** (Table)
   - Data: `getCommitmentBatches.data`
   - Columns: commitment_time, cycles_committed, cycles_blocked, status
   - Row selection: single

3. **blockedCyclesList** (List)
   - Data: Parse errors JSON to show blocked reasons
   - Actions: Navigate to user, navigate to cycle

---

## Page 3: FulfillmentQueue (YFT-WarehouseOps)

### Purpose
Show committed cycles ready for fulfillment, ordered by ship date priority.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Fulfillment Queue                          Filter: [All ▼] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Ready for Fulfillment (12 boxes)                       ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Ship Date   Box       User         Items  Status       ││
│  │  ● Today     BOX-001   Alice Test   3      Ready        ││
│  │  ● Today     BOX-002   Bob Test     3      Ready        ││
│  │  ○ Tomorrow  BOX-003   Carol Test   3      Picking ⚡   ││
│  │  ○ Tomorrow  BOX-004   Dan Test     4      Ready        ││
│  │  ○ Jan 17    BOX-005   Eve Test     3      Ready        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Selected: BOX-001 for Alice Test                       ││
│  │  ──────────────────────────────────────────────────────│││
│  │  Ship Date: Today (Jan 15)                              │ │
│  │  Cycle: C-123  |  Week: 2024-W03                       │ │
│  │                                                         │ │
│  │  Planned Contents:                                      │ │
│  │  ☐ G001 - TOP-CREW-BLK (M) - Available                 │ │
│  │  ☐ G015 - BTM-JEAN-BLU (32) - Available                │ │
│  │  ☐ G021 - DRS-MIDI-BLK (M) - Available                 │ │
│  │                                                         │ │
│  │  [Start Packing] → Opens BoxPacker                     │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getFulfillmentQueue**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: AND(
//   OR({cycle_state} = 'Committed', {cycle_state} = 'FulfillmentInProgress'),
//   {box_id} != ''
// )
// Sort: ship_date ASC
```

**getBoxDetails**
```javascript
// Resource: YFT-Airtable
// Action: Get Record
// Table: Boxes
// Record ID: {{selectedCycle.box_id[0].id}}
```

**getPlannedGarments**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Garments
// Filter: SEARCH(RECORD_ID(), '{{selectedBox.planned_contents.map(g => g.id).join(",")}}')
```

### Components

1. **queueTable** (Table)
   - Data: `getFulfillmentQueue.data`
   - Columns: ship_date (with priority indicator), box_id, user_name, item_count, status
   - Color coding: Red for today, yellow for tomorrow, default for later
   - Row selection: single

2. **selectedBoxContainer** (Container)
   - Show when: `queueTable.selectedRow`
   - Display box and cycle details

3. **plannedContentsList** (List)
   - Data: `getPlannedGarments.data`
   - Columns: barcode, sku, size, asset_state
   - Status indicator for each garment

4. **startPackingButton** (Button)
   - Label: "Start Packing"
   - On click:
     1. Transition box to 'Picking'
     2. Transition cycle to 'FulfillmentInProgress'
     3. Navigate to BoxPacker page with box_id parameter

---

## Page 4: ShipmentDashboard (YFT-WarehouseOps)

### Purpose
Manage shipping: enter tracking numbers, create shipment batches, mark boxes shipped.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Shipment Dashboard                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Ready to Ship (8 boxes)                [Ship Selected] ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  ☐ BOX-001  Alice Test   3 items   Tracking: _______   ││
│  │  ☐ BOX-002  Bob Test     3 items   Tracking: _______   ││
│  │  ☑ BOX-003  Carol Test   3 items   Tracking: 1Z999...  ││
│  │  ☑ BOX-004  Dan Test     4 items   Tracking: 1Z999...  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Quick Tracking Entry                                   ││
│  │  ──────────────────────────────────────────────────────│││
│  │  Carrier: [UPS ▼]  Manifest: [____________]            │ │
│  │                                                         │ │
│  │  Box Barcode: [________]  Tracking: [______________]   │ │
│  │  [Add Tracking] → Auto-selects box for shipment        │ │
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Recent Shipments                                       ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Date       Carrier  Boxes  Status                      ││
│  │  Jan 15     UPS      4      Shipped                     ││
│  │  Jan 14     UPS      5      Delivered (3/5)             ││
│  │  Jan 13     USPS     3      Delivered (3/3) ✓          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getReadyToShip**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Boxes
// Filter: {container_state} = 'PackedVerified'
```

**getShipmentBatches**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: ShipmentBatches
// Sort: ship_date DESC
// Limit: 10
```

**updateBoxTracking**
```javascript
// Resource: YFT-Airtable
// Action: Update Record
// Table: Boxes
// Record ID: {{selectedBox.id}}
// Fields: {
//   "tracking_outbound": "{{trackingInput.value}}"
// }
```

**shipSelectedBoxes**
```javascript
// For each selected box:
// 1. Update Boxes: container_state = 'Shipped'
// 2. Update Cycles: cycle_state = 'OutboundInTransit', shipped_at = NOW()
// 3. Create ShipmentBatch record
```

### Components

1. **readyToShipTable** (Table)
   - Data: `getReadyToShip.data`
   - Columns: box_barcode (checkbox), user_name, garment_count, tracking_outbound (editable)
   - Multi-select enabled

2. **trackingInputContainer** (Container)
   - Quick entry form for barcode scanner workflow
   - Box barcode input → auto-lookup
   - Tracking number input
   - Add button

3. **shipSelectedButton** (Button)
   - Label: "Ship Selected"
   - Disabled if: No rows selected OR any selected row missing tracking
   - On click: Run `shipSelectedBoxes` transformer

4. **recentShipmentsTable** (Table)
   - Data: `getShipmentBatches.data`
   - Columns: ship_date, carrier, boxes_shipped, delivery_status (computed)

---

## Page 5: ReceivingStation (YFT-WarehouseOps)

### Purpose
Enhanced receiving workflow with return tracking integration.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Receiving Station                                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Scan Return Box                                        ││
│  │  ──────────────────────────────────────────────────────│││
│  │  Box Barcode: [________________] [Receive]             │ │
│  │                                                         │ │
│  │  ✓ BOX-001 received at 10:32 AM                        │ │
│  │  ✓ BOX-004 received at 10:15 AM                        │ │
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌───────────────────────┐  ┌─────────────────────────────┐ │
│  │  Expected Returns     │  │  Received Today             │ │
│  │  ─────────────────    │  │  ─────────────────────────  │ │
│  │  BOX-003 Carol Test   │  │  BOX-001  Alice  3 items    │ │
│  │  BOX-005 Eve Test     │  │  BOX-004  Dan    4 items    │ │
│  │  BOX-007 Frank Test   │  │                             │ │
│  │  (3 expected today)   │  │  (7 total items received)   │ │
│  └───────────────────────┘  └─────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Just Received: BOX-001                                 ││
│  │  ──────────────────────────────────────────────────────│││
│  │  User: Alice Test     Cycle: C-120                     │ │
│  │  Days Since Delivery: 8                                │ │
│  │  Expected Contents:                                     │ │
│  │  - G001 TOP-CREW-BLK                                   │ │
│  │  - G015 BTM-JEAN-BLU                                   │ │
│  │  - G021 DRS-MIDI-BLK                                   │ │
│  │                                                         │ │
│  │  [Begin Inspection] → Opens InspectionStation          │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getExpectedReturns**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: {cycle_state} = 'ReturnInTransit'
// Sort: return_initiated_at ASC
```

**getReceivedToday**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: AND(
//   {cycle_state} = 'CloseoutInspection',
//   IS_SAME({return_received_at}, TODAY(), 'day')
// )
```

**receiveBox**
```javascript
// Resource: YFT-Airtable
// Transformer that:
// 1. Find box by barcode
// 2. Update box: container_state = 'Received'
// 3. Update cycle: cycle_state = 'CloseoutInspection', return_received_at = NOW()
// 4. Update garments: asset_state = 'ReceivedReturn'
// 5. Log events
```

### Components

1. **boxBarcodeInput** (Text Input)
   - Placeholder: "Scan box barcode"
   - On submit: Run `receiveBox`

2. **recentReceiptsLog** (List)
   - Show last 5 received boxes with timestamps
   - Auto-updates on successful receipt

3. **expectedReturnsList** (List)
   - Data: `getExpectedReturns.data`
   - Columns: box_barcode, user_name, days_in_transit

4. **receivedTodayList** (List)
   - Data: `getReceivedToday.data`
   - Columns: box_barcode, user_name, item_count

5. **justReceivedContainer** (Container)
   - Show when: Box just received
   - Display box contents and user info
   - "Begin Inspection" button → Navigate to InspectionStation

---

## Page 6: InspectionStation (YFT-WarehouseOps)

### Purpose
Enhanced inspection workflow with closeout triggers.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Inspection Station                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Current Inspection: BOX-001 (Cycle C-120)              ││
│  │  User: Alice Test    Delivered: Jan 10    Returned: Jan 18│
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Garments to Inspect (3)                                ││
│  │  ─────────────────────────────────────────────────────  ││
│  │                                                         ││
│  │  ┌─────────────────────────────────────────────────┐   ││
│  │  │ G001 - TOP-CREW-BLK (M)                   [A ▼] │   ││
│  │  │ Wear Count: 12/50  |  Prior Grade: A            │   ││
│  │  │ Route to: [Refurbish ▼]  Notes: [_________]     │   ││
│  │  │ [Save Inspection]                               │   ││
│  │  └─────────────────────────────────────────────────┘   ││
│  │                                                         ││
│  │  ┌─────────────────────────────────────────────────┐   ││
│  │  │ G015 - BTM-JEAN-BLU (32)           ✓ Inspected  │   ││
│  │  │ Grade: A → Refurbish                            │   ││
│  │  └─────────────────────────────────────────────────┘   ││
│  │                                                         ││
│  │  ┌─────────────────────────────────────────────────┐   ││
│  │  │ G021 - DRS-MIDI-BLK (M)            ✓ Inspected  │   ││
│  │  │ Grade: B → Refurbish                            │   ││
│  │  └─────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Inspection Progress: 2/3 complete                      ││
│  │  ████████████████░░░░░░░░                               ││
│  │                                                         ││
│  │  [Complete Closeout] (enabled when all inspected)       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getCyclesForCloseout**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: {cycle_state} = 'CloseoutInspection'
```

**getGarmentsForInspection**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Garments
// Filter: AND(
//   {current_cycle_id} = '{{selectedCycle.id}}',
//   {asset_state} = 'ReceivedReturn'
// )
```

**saveGarmentInspection**
```javascript
// Resource: YFT-Airtable
// Action: Update Record
// Table: Garments
// Fields: {
//   "condition_grade": "{{gradeSelect.value}}",
//   "asset_state": "{{routeSelect.value}}",
//   "wear_count": {{currentWearCount + 1}},
//   "notes": "{{notesInput.value}}"
// }
```

**completeCloseout**
```javascript
// Transformer:
// 1. Verify all garments inspected (not in ReceivedReturn)
// 2. Update cycle: cycle_state = 'Settled', settled_at = NOW()
// 3. Update box: container_state = 'Reconciled'
// 4. Log settlement event
```

### Components

1. **cycleSelector** (Select or auto-populated)
   - Options: Cycles in CloseoutInspection
   - Auto-select from navigation param

2. **cycleHeaderContainer** (Container)
   - Display cycle/user/timing summary

3. **garmentInspectionCards** (Repeater)
   - For each garment in `getGarmentsForInspection.data`:
     - Garment details (SKU, size, lifecycle)
     - Grade selector: A, B, C, D, F
     - Route selector: Refurbish, Repair, Quarantine, Retired
     - Notes input
     - Save button

4. **inspectionProgress** (Progress Bar)
   - Value: Inspected count / total count
   - Color: Yellow until complete, green when done

5. **completeCloseoutButton** (Button)
   - Label: "Complete Closeout"
   - Disabled if: Any garments still in ReceivedReturn
   - On click: Run `completeCloseout` then navigate to next cycle

---

## Page 7: ExceptionWorkflow (YFT-AdminConsole)

### Purpose
Central hub for managing exceptions: overdue returns, missing items, holds.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Exception Workflow                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┬────────────────┬────────────────────┐│
│  │  Overdue Returns  │  User Holds    │  Pending Reminders ││
│  │  ────────────     │  ────────      │  ──────────────    ││
│  │  ⚠ 3 active       │  2 active      │  5 to send         ││
│  └───────────────────┴────────────────┴────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Overdue Returns (sorted by severity)                   ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Days  User         Cycle    Status         Actions     ││
│  │  🔴 12  Carol Test  C-115   HoldApplied    [Resolve]   ││
│  │  🟡 5   Dan Test    C-118   Reminder Sent  [Contact]   ││
│  │  🟡 3   Eve Test    C-119   Reminder Due   [Send]      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Selected: Carol Test - Cycle C-115 (12 days overdue)   ││
│  │  ──────────────────────────────────────────────────────│││
│  │  User State: HoldLogistics                              │ │
│  │  Garments: G001, G015, G021 (all InUse)                │ │
│  │                                                         │ │
│  │  Timeline:                                              │ │
│  │  Jan 05  Delivered                                     │ │
│  │  Jan 10  Return window opened                          │ │
│  │  Jan 12  Return window closed                          │ │
│  │  Jan 13  Reminder 1 sent                               │ │
│  │  Jan 15  Reminder 2 sent                               │ │
│  │  Jan 19  Hold applied                                  │ │
│  │                                                         │ │
│  │  Resolution Options:                                    │ │
│  │  [Mark Returned]  [Extend Deadline]  [Declare Loss]    │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getOverdueReturns**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: AND(
//   {cycle_state} = 'ReturnWindowOpen',
//   {is_overdue} = TRUE
// )
// Sort: days_overdue DESC
```

**getUsersOnHold**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Users
// Filter: OR(
//   {operational_state} = 'HoldLogistics',
//   {operational_state} = 'HoldPayment',
//   {operational_state} = 'HoldIdentity'
// )
```

**getPendingReminders**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: ReturnReminders
// Filter: {status} = 'Pending'
// Sort: scheduled_for ASC
```

**markReminderSent**
```javascript
// Resource: YFT-Airtable
// Action: Update Record
// Table: ReturnReminders
// Fields: {
//   "status": "Sent",
//   "sent_at": NOW()
// }
```

**resolveHold**
```javascript
// Transformer:
// 1. Update user: operational_state = 'Active'
// 2. Log event with resolution reason
```

**declareLoss**
```javascript
// Transformer:
// 1. Update garments: asset_state = 'Lost'
// 2. Update cycle: add settlement with loss charges
// 3. Log LossDeclaration event
```

### Components

1. **summaryCards** (Container with Stats)
   - Overdue count, Hold count, Pending reminders count
   - Click to filter main list

2. **overdueTable** (Table)
   - Data: `getOverdueReturns.data`
   - Columns: severity indicator, days_overdue, user_name, cycle_id, status
   - Row selection: single

3. **exceptionDetailContainer** (Container)
   - Show when: Row selected
   - Display full timeline and user/cycle info

4. **resolutionButtons** (Button Group)
   - "Mark Returned" → Opens ReceivingStation
   - "Extend Deadline" → Modal to update return_window_ends
   - "Declare Loss" → Confirmation then run `declareLoss`

5. **pendingRemindersList** (List)
   - Data: `getPendingReminders.data`
   - Action: "Mark Sent" to update status

---

## Verification Checklist

After completing setup:

- [ ] SchedulingMonitor page shows job history
- [ ] CommitmentMonitor page shows batch results
- [ ] FulfillmentQueue page lists committed cycles
- [ ] ShipmentDashboard supports bulk shipping
- [ ] ReceivingStation scans and receives returns
- [ ] InspectionStation completes closeout workflow
- [ ] ExceptionWorkflow shows overdue returns and holds

---

## Integration Points

### Navigation Flow

```
FulfillmentQueue → BoxPacker → ShipmentDashboard
                                     ↓
ReceivingStation → InspectionStation → (back to FulfillmentQueue)
                                     ↓
ExceptionWorkflow (from any page showing exception badge)
```

### Shared Components

Consider creating reusable components:
- **CycleSummaryCard**: Shows cycle details with user and timing
- **GarmentListItem**: Shows garment with state indicator
- **ExceptionBadge**: Shows exception count in nav

### API Error Handling

All queries should include error states:
```javascript
if (query.error) {
  showNotification({
    type: 'error',
    title: 'Query Failed',
    message: query.error.message
  });
}
```
