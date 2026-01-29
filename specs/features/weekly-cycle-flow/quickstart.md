# Quickstart Validation Scenarios

**Feature**: Weekly Cycle Flow
**Purpose**: Verify orchestration layer works correctly

## Setup Requirements

- State Authority subsystem fully functional (all tasks complete)
- Additional tables created (Configuration, SchedulingJobs, etc.)
- Orchestration automations enabled
- Test data: 5 active users with different weekly_anchors

---

## Scenario 1: Auto-Scheduling

**Goal**: Verify scheduling automation creates cycles for all active users.

### Steps

1. **Setup**
   - Ensure 5 users in `Active` state
   - Set weekly_anchors: U1=Monday, U2=Tuesday, U3=Wednesday, U4=Thursday, U5=Friday
   - No cycles exist for next week

2. **Trigger scheduling**
   - Manually run AutoScheduleCycles automation (or wait for Sunday 18:00)

3. **Verify**
   - SchedulingJob record created with users_eligible=5, cycles_created=5
   - Each user has one Cycle in `Scheduled` state
   - Cycle.week_id matches expected week
   - No duplicate cycles

4. **Re-run scheduling**
   - Trigger automation again
   - Verify: cycles_skipped=5, cycles_created=0 (no duplicates)

### Expected Outcome
- All active users scheduled
- Scheduling is idempotent

---

## Scenario 2: Commitment Success

**Goal**: Verify commitment locks inventory when conditions met.

### Steps

1. **Setup**
   - User U1 in `Active` state
   - Cycle C1 in `Scheduled` state with ship_date approaching
   - Box B1 planned with garments [G1, G2, G3] all `Available`

2. **Trigger commitment**
   - Advance time to commitment deadline
   - Run AutoCommitCycles automation

3. **Verify**
   - C1 transitions to `Committed`
   - G1, G2, G3 transition to `Reserved` with current_cycle_id = C1
   - CommitmentBatch record created with cycles_committed=1

### Expected Outcome
- Cycle committed, inventory locked

---

## Scenario 3: Commitment Blocked by Hold

**Goal**: Verify commitment blocked when user has hold.

### Steps

1. **Setup**
   - User U1 in `HoldPayment` state
   - Cycle C1 in `Scheduled` state

2. **Trigger commitment**
   - Run AutoCommitCycles automation

3. **Verify**
   - C1 remains in `Scheduled` state
   - CommitmentBatch shows cycles_blocked=1
   - Block reason logged

4. **Resolve hold**
   - Transition U1 to `Active`
   - Re-run commitment

5. **Verify**
   - C1 now commits successfully

### Expected Outcome
- Holds properly block commitment

---

## Scenario 4: Fulfillment to Shipment

**Goal**: Verify packing and shipping workflow.

### Steps

1. **Setup**
   - Cycle C1 in `Committed` state

2. **Start fulfillment**
   - In FulfillmentQueue, click "Start Packing" for C1
   - Verify: B1 transitions to `Picking`, C1 to `FulfillmentInProgress`

3. **Pack box**
   - In BoxPacker, scan garments into B1
   - Verify pack
   - Verify: B1 transitions to `PackedVerified`

4. **Ship**
   - In ShipmentDashboard, enter tracking number
   - Click "Ship"
   - Verify: B1 to `Shipped`, C1 to `OutboundInTransit`, garments to `InTransitOutbound`
   - ShipmentBatch record created

### Expected Outcome
- Smooth flow from fulfillment to shipment

---

## Scenario 5: Delivery to Wear Window

**Goal**: Verify automatic window progression.

### Steps

1. **Setup**
   - Cycle C1 in `OutboundInTransit` state

2. **Confirm delivery**
   - In CycleManager, enter delivery confirmation
   - Verify: C1 transitions to `Delivered`

3. **Wait for auto-progression**
   - Run AutoProgressWearWindow automation
   - Verify: C1 transitions to `WearWindowOpen`

4. **Simulate wear window end**
   - Manually set delivered_at to 6 days ago (past wear window)
   - Run AutoProgressWearWindow

5. **Verify**
   - C1 transitions to `ReturnWindowOpen`
   - ReturnReminder created for user

### Expected Outcome
- Automatic progression without user action

---

## Scenario 6: Return Flow

**Goal**: Verify return receiving and closeout.

### Steps

1. **Setup**
   - Cycle C1 in `ReturnWindowOpen` state

2. **Initiate return**
   - Enter return tracking (carrier pickup)
   - Verify: C1 to `ReturnInTransit`, B1 to `Returning`

3. **Receive return**
   - In ReceivingStation, scan B1 barcode
   - Verify: B1 to `Received`, C1 to `CloseoutInspection`
   - Garments transition to `ReceivedReturn`

4. **Inspect garments**
   - In InspectionStation, grade each garment
   - G1: A → Refurbish
   - G2: B → Refurbish
   - G3: D → Repair

5. **Trigger settlement**
   - Click "Settle Cycle"
   - Verify: C1 to `Settled`

6. **Close cycle**
   - Verify: C1 to `Closed`, B1 to `Closed`

### Expected Outcome
- Complete return flow with inspection and settlement

---

## Scenario 7: Late Return Escalation

**Goal**: Verify overdue return handling.

### Steps

1. **Setup**
   - Cycle C1 in `ReturnWindowOpen` state
   - Set return_window_ends to 4 days ago (overdue)

2. **Run overdue check**
   - Execute CheckOverdueReturns automation
   - Verify: ReturnReminder (level 2) created

3. **Simulate further delay**
   - Set return_window_ends to 8 days ago
   - Run CheckOverdueReturns

4. **Verify hold applied**
   - User U1 transitions to `HoldLogistics`
   - Next cycle for U1 cannot commit

5. **Receive late return**
   - Scan return at receiving
   - Complete inspection/settlement

6. **Verify hold released**
   - U1 transitions back to `Active`
   - Next cycle can commit

### Expected Outcome
- Progressive escalation, hold applied, released on return

---

## Scenario 8: Exception - Missing Garment

**Goal**: Verify missing item handling at closeout.

### Steps

1. **Setup**
   - Cycle C1 shipped with [G1, G2, G3]
   - Return received

2. **Inspection reveals missing item**
   - Scan received: [G1, G2] (G3 missing)
   - In InspectionStation, mark G3 as "Not Returned"

3. **Verify**
   - `MissingGarment` event created for G3
   - G3 transitions to `Lost`
   - Settlement includes loss charge

4. **Close cycle**
   - Verify: Cycle closes with settlement reflecting loss

### Expected Outcome
- Missing items handled with proper accounting

---

## Scenario 9: Full Week Simulation

**Goal**: Verify complete weekly flow for multiple users.

### Steps

1. **Sunday**: Run scheduling for 5 users
2. **Monday**: Run commitment (should commit all)
3. **Tuesday**: Pack and ship all boxes
4. **Wednesday**: Enter delivery confirmations
5. **Thursday-Monday**: Wear window (automatic)
6. **Monday**: Return window opens (automatic)
7. **Tuesday**: Returns picked up
8. **Wednesday**: Returns received, inspected
9. **Wednesday**: Settlement/closeout

### Verify Throughout
- All automations run on schedule
- No manual intervention needed for normal flow
- Events logged at each step
- Final state: All cycles Closed, garments back to Available (or Retired/Repair)

### Expected Outcome
- Complete weekly cadence executed

---

## Scenario 10: Capacity Constraint

**Goal**: Verify behavior when inventory insufficient.

### Steps

1. **Setup**
   - Create more cycles than available inventory can fill
   - Some garments already Reserved to other cycles

2. **Run commitment**
   - Verify: Cycles with available inventory commit
   - Cycles without inventory: Attempt substitution
   - If no substitute: Cancel with reason

3. **Verify**
   - CommitmentBatch shows cycles_blocked with reason
   - Cancelled cycles have clear explanation
   - User notified (manual for pilot)

### Expected Outcome
- Graceful handling of capacity constraints

---

## Validation Checklist

| Scenario | Pass/Fail | Notes |
|----------|-----------|-------|
| 1. Auto-Scheduling | | |
| 2. Commitment Success | | |
| 3. Commitment Blocked | | |
| 4. Fulfillment to Shipment | | |
| 5. Delivery to Wear Window | | |
| 6. Return Flow | | |
| 7. Late Return Escalation | | |
| 8. Missing Garment | | |
| 9. Full Week Simulation | | |
| 10. Capacity Constraint | | |

**All scenarios must pass before production pilot.**
