# Quickstart Validation Scenarios

**Feature**: State Authority Subsystem
**Purpose**: Verify implementation meets spec before deployment

## Setup Requirements

- Airtable base `YFT-StateAuthority` created with all tables
- Retool apps connected to Airtable
- Test data: 5 users, 20 garments, 3 boxes
- Operator account for Retool

---

## Scenario 1: Happy Path - Full Cycle

**Goal**: Verify complete cycle flow from scheduling through closeout.

### Steps

1. **Schedule cycle**
   - In Admin Console, create cycle for User U1, Week W1
   - Verify: CycleEntity created in `Scheduled` state
   - Verify: Event `CycleScheduled` logged

2. **Commit cycle**
   - Assign Box B1 to cycle
   - Reserve Garments G1, G2, G3 to cycle
   - Trigger commitment
   - Verify: Cycle transitions to `Committed`
   - Verify: Garments G1, G2, G3 are in `Reserved` state
   - Verify: Events logged for each transition

3. **Pack box**
   - In Warehouse Ops, start picking for Box B1
   - Scan G1, G2, G3 into box
   - Verify: Each garment transitions to `Packed`
   - Verify: Box shows `actual_contents = [G1, G2, G3]`
   - Verify: No variance detected

4. **Ship box**
   - Enter tracking number, confirm ship
   - Verify: Box transitions to `Shipped`
   - Verify: Garments transition to `InTransitOutbound`
   - Verify: Cycle transitions to `OutboundInTransit`

5. **Confirm delivery**
   - Enter delivery confirmation
   - Verify: Cycle transitions through `Delivered` → `WearWindowOpen`
   - Verify: Garments transition to `InUse`

6. **Initiate return**
   - Wait for wear window (or manually advance)
   - Verify: Cycle transitions to `ReturnWindowOpen`
   - Confirm return pickup
   - Verify: Cycle transitions to `ReturnInTransit`

7. **Receive and inspect**
   - Scan Box B1 at receiving
   - Inspect each garment, mark condition as acceptable
   - Verify: Garments transition to `ReceivedReturn` → `Refurbish`

8. **Complete refurbishment**
   - Mark refurbishment complete for each garment
   - Verify: Garments transition to `Available`
   - Verify: `wear_count` incremented by 1

9. **Close cycle**
   - Trigger settlement
   - Verify: Cycle transitions to `Settled` → `Closed`
   - Verify: Box transitions to `Closed`

### Expected Outcome
- Cycle is in `Closed` state
- All garments back in `Available` state with updated counters
- Event log shows complete history

---

## Scenario 2: Packing Variance - Commit to Observed

**Goal**: Verify variance detection and compensating allocation.

### Steps

1. Create committed cycle with planned_contents = [G1, G2, G3]
2. Start picking
3. Scan G1, G2, G4 (G4 not in plan, G3 missing)
4. Verify: `has_variance = true`
5. Attempt to verify pack
6. Verify: System blocks - variance unresolved
7. Select "Commit to observed"
8. Verify: `PackingVariance` event logged
9. Verify: `CompensatingAllocation` event logged
10. Verify: `actual_contents = [G1, G2, G4]`
11. Verify: Box transitions to `PackedVerified`
12. Verify: G3 returns to `Available` (was never packed)

### Expected Outcome
- Cycle ships with G1, G2, G4
- Events clearly document variance and resolution
- G3 available for other cycles

---

## Scenario 3: Double Allocation Prevention

**Goal**: Verify garment cannot be reserved for multiple cycles.

### Steps

1. Create Cycle C1 for User U1, Week W1
2. Reserve Garment G1 to Cycle C1
3. Create Cycle C2 for User U2, Week W1
4. Attempt to reserve Garment G1 to Cycle C2
5. Verify: System rejects with error `E001 - Garment already reserved`
6. Verify: Rejection event logged

### Expected Outcome
- G1 remains reserved to C1 only
- Clear error message shown
- Audit trail of rejection

---

## Scenario 4: Duplicate Cycle Prevention

**Goal**: Verify single cycle per user per week constraint.

### Steps

1. Create Cycle C1 for User U1, Week W1
2. Attempt to create Cycle C2 for User U1, Week W1
3. Verify: System rejects with error `E002 - Cycle already exists`
4. Verify: Rejection event logged

### Expected Outcome
- Only one cycle exists for U1/W1
- Clear error message
- Audit trail

---

## Scenario 5: Lifecycle Bounds Enforcement

**Goal**: Verify garments exceeding limits transition to Retired.

### Steps

1. Set Garment G1 `wear_count = 49`, `max_wear_limit = 50`
2. Run G1 through a cycle (Reserved → Packed → ... → ReceivedReturn)
3. Complete inspection, mark condition acceptable
4. Verify: System increments `wear_count` to 50
5. Verify: G1 transitions to `Retired`, not `Available`
6. Verify: Event `GarmentRetired` with reason "lifecycle_exceeded"
7. Attempt to reserve G1 for new cycle
8. Verify: System rejects - garment not Available

### Expected Outcome
- G1 is permanently removed from circulation
- Clear reason recorded
- Cannot be allocated again

---

## Scenario 6: User Hold - Payment Failure

**Goal**: Verify payment hold blocks cycle commitment.

### Steps

1. Create User U1 in `Active` state
2. Create Cycle C1 for U1 in `Scheduled` state
3. Trigger payment failure for U1
4. Verify: U1 transitions to `HoldPayment`
5. Verify: Event `UserPaymentHold` logged
6. Attempt to commit Cycle C1
7. Verify: System rejects with error `E004 - User not Active`
8. Verify: C1 remains in `Scheduled` state
9. Resolve payment for U1
10. Verify: U1 transitions to `Active`
11. Commit Cycle C1
12. Verify: C1 successfully transitions to `Committed`

### Expected Outcome
- Commitment blocked while on hold
- Automatic resume after hold resolved
- Clear audit trail of hold/restore

---

## Scenario 7: Late Return Hold

**Goal**: Verify logistics hold after overdue return.

### Steps

1. Create cycle, deliver to user, open return window
2. Wait beyond return threshold (or manually set overdue)
3. Verify: User transitions to `HoldLogistics`
4. Attempt to commit next week's cycle
5. Verify: System blocks commitment
6. Receive the overdue return
7. Verify: User transitions to `Active`
8. Verify: Next cycle can commit

### Expected Outcome
- No new shipments while returns overdue
- Automatic restoration after return

---

## Scenario 8: Event Reconstruction

**Goal**: Verify audit trail completeness.

### Steps

1. Perform 10 state transitions on Garment G1
2. Query Events table for G1
3. Verify: All 10 events present
4. Verify: Correct sequence (timestamps monotonic)
5. Verify: Each event has: entity_type, entity_id, from_state, to_state, actor_id
6. Attempt to modify an existing event
7. Verify: System rejects (append-only)

### Expected Outcome
- Complete history available
- Events are immutable

---

## Scenario 9: Idempotent Transitions

**Goal**: Verify duplicate requests don't create duplicate state changes.

### Steps

1. Reserve G1 to C1 with idempotency_key "reserve-g1-c1"
2. Repeat same request with same idempotency_key
3. Verify: Only one event created
4. Verify: G1 still in `Reserved` state (no double-reserve)

### Expected Outcome
- Idempotent operations are safe to retry
- No duplicate events or state corruption

---

## Scenario 10: Bounded Uncertainty - Missing Delivery

**Goal**: Verify system handles missing delivery signal gracefully.

### Steps

1. Ship box, enter tracking
2. Wait beyond expected delivery window without confirmation
3. Verify: Cycle enters bounded uncertainty (logged)
4. User reports usage
5. Trigger `DeliveredByProxy` event
6. Verify: Cycle proceeds to `WearWindowOpen`
7. Verify: Events clearly document proxy delivery

### Expected Outcome
- System doesn't deadlock on missing signal
- Proxy events preserve auditability

---

## Validation Checklist

| Scenario | Pass/Fail | Notes |
|----------|-----------|-------|
| 1. Happy Path | | |
| 2. Packing Variance | | |
| 3. Double Allocation Prevention | | |
| 4. Duplicate Cycle Prevention | | |
| 5. Lifecycle Bounds | | |
| 6. Payment Hold | | |
| 7. Late Return Hold | | |
| 8. Event Reconstruction | | |
| 9. Idempotent Transitions | | |
| 10. Bounded Uncertainty | | |

**All scenarios must pass before production deployment.**
