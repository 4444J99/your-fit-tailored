# Cycle State Transitions

**Entity**: CycleEntity
**States**: Scheduled, Committed, FulfillmentInProgress, OutboundInTransit, Delivered, WearWindowOpen, ReturnWindowOpen, ReturnInTransit, CloseoutInspection, Settled, Closed

## State Diagram

```
┌───────────────┐
│   Scheduled   │ ◄── create_cycle (one per user/week)
└───────┬───────┘
        │ commit (all checks pass)
        ▼
┌───────────────┐
│   Committed   │ ◄── inventory locked
└───────┬───────┘
        │ start_fulfillment
        ▼
┌───────────────────┐
│FulfillmentInProgress│ ◄── packing underway
└───────┬───────────┘
        │ ship
        ▼
┌───────────────────┐
│OutboundInTransit  │ ◄── en route to user
└───────┬───────────┘
        │ deliver
        ▼
┌───────────────┐
│   Delivered   │ ◄── at user location
└───────┬───────┘
        │ open_wear_window (automatic)
        ▼
┌───────────────────┐
│  WearWindowOpen   │ ◄── user wearing (default: 5 days)
└───────┬───────────┘
        │ transition (automatic at window end)
        ▼
┌───────────────────┐
│ ReturnWindowOpen  │ ◄── expecting return (default: 2 days)
└───────┬───────────┘
        │ return_in_transit
        ▼
┌───────────────────┐
│  ReturnInTransit  │ ◄── en route back
└───────┬───────────┘
        │ receive
        ▼
┌────────────────────┐
│CloseoutInspection  │ ◄── inspecting garments
└───────┬────────────┘
        │ settle
        ▼
┌───────────────┐
│    Settled    │ ◄── charges computed, fit updated
└───────┬───────┘
        │ close
        ▼
┌───────────────┐
│    Closed     │ ◄── immutable record
└───────────────┘

Exception paths:
- Scheduled → Cancelled (before commitment)
- Any active state → Holds (via user state changes)
```

## Transition Contracts

### T-C001: (none) → Scheduled

**Trigger**: System schedules next week's cycle for user.

**Preconditions**:
- `user.operational_state == 'Active'`
- No existing cycle for this `user_id + week_id` combination
- `week_id` is valid future week

**Actions**:
1. Create CycleEntity with `cycle_state = 'Scheduled'`
2. Set `user_id`, `week_id`
3. Set `scheduled_at = NOW()`
4. Emit event: `CycleScheduled`

**Postconditions**:
- Exactly one cycle exists for this user/week
- Cycle is reversible (no inventory locked)

**Error Codes**:
- `E002` - Cycle already exists for this user/week
- `E004` - User not in Active state

---

### T-C002: Scheduled → Committed

**Trigger**: All feasibility checks pass at commitment deadline.

**Preconditions**:
- `cycle.cycle_state == 'Scheduled'`
- `user.operational_state == 'Active'`
- `box.container_state == 'Planned'`
- All garments in `box.planned_contents` are in `Reserved` state
- Payment pre-authorization successful

**Actions**:
1. Set `cycle.cycle_state = 'Committed'`
2. Set `cycle.committed_at = NOW()`
3. Emit event: `CycleCommitted`
4. Lock inventory (garments cannot be unassigned without compensating event)

**Postconditions**:
- Inventory is committed
- Cycle must proceed or be explicitly cancelled with cost

**Error Codes**:
- `E004` - User not in Active state
- `E012` - Box not in Planned state
- `E013` - Garment reservation mismatch
- `E014` - Payment authorization failed

---

### T-C003: Scheduled → Cancelled

**Trigger**: Cycle cancelled before commitment (user skip, capacity shortage).

**Preconditions**:
- `cycle.cycle_state == 'Scheduled'`

**Actions**:
1. Set `cycle.cycle_state = 'Cancelled'`
2. Release all garment reservations (Reserved → Available)
3. Emit event: `CycleCancelled` with `reason`

**Postconditions**:
- No inventory locked
- User may get another cycle for different week

**Error Codes**:
- `E015` - Cannot cancel after commitment

---

### T-C004: Committed → FulfillmentInProgress

**Trigger**: Warehouse begins picking/packing.

**Preconditions**:
- `cycle.cycle_state == 'Committed'`
- `box.container_state == 'Planned'`

**Actions**:
1. Set `cycle.cycle_state = 'FulfillmentInProgress'`
2. Set `box.container_state = 'Picking'`
3. Emit event: `CycleFulfillmentStarted`

**Postconditions**:
- Box is ready for garment scanning

---

### T-C005: FulfillmentInProgress → OutboundInTransit

**Trigger**: Box ships.

**Preconditions**:
- `cycle.cycle_state == 'FulfillmentInProgress'`
- `box.container_state == 'PackedVerified'` OR `box.variance_resolved == true`
- `box.tracking_outbound != null`

**Actions**:
1. Set `cycle.cycle_state = 'OutboundInTransit'`
2. Set `cycle.shipped_at = NOW()`
3. Set `box.container_state = 'Shipped'`
4. Transition all garments in `box.actual_contents` to `InTransitOutbound`
5. Emit event: `CycleShipped`

**Postconditions**:
- Carrier has custody
- Tracking available

**Error Codes**:
- `E006` - Box variance unresolved
- `E016` - No tracking number

---

### T-C006: OutboundInTransit → Delivered

**Trigger**: Delivery confirmation received.

**Preconditions**:
- `cycle.cycle_state == 'OutboundInTransit'`
- Delivery signal received (carrier or proxy)

**Actions**:
1. Set `cycle.cycle_state = 'Delivered'`
2. Set `cycle.delivered_at = NOW()`
3. Set `box.container_state = 'Delivered'`
4. Transition all garments to `Delivered`
5. Emit event: `CycleDelivered`

**Postconditions**:
- User has custody
- Wear window will open

---

### T-C007: Delivered → WearWindowOpen

**Trigger**: Automatic (immediate after delivery or scheduled).

**Preconditions**:
- `cycle.cycle_state == 'Delivered'`

**Actions**:
1. Set `cycle.cycle_state = 'WearWindowOpen'`
2. Transition all garments to `InUse`
3. Emit event: `WearWindowOpened`
4. Schedule `WearWindowClosed` event for +5 days (configurable)

**Postconditions**:
- User is expected to wear garments
- No action required from user

---

### T-C008: WearWindowOpen → ReturnWindowOpen

**Trigger**: Automatic at wear window end.

**Preconditions**:
- `cycle.cycle_state == 'WearWindowOpen'`
- Wear window duration elapsed

**Actions**:
1. Set `cycle.cycle_state = 'ReturnWindowOpen'`
2. Set `box.container_state = 'ReturnInitiated'`
3. Emit event: `ReturnWindowOpened`
4. Schedule return reminders

**Postconditions**:
- User should return box
- Reminders will escalate if no return signal

---

### T-C009: ReturnWindowOpen → ReturnInTransit

**Trigger**: Return pickup confirmed or user drop-off.

**Preconditions**:
- `cycle.cycle_state == 'ReturnWindowOpen'`
- Return initiated signal received

**Actions**:
1. Set `cycle.cycle_state = 'ReturnInTransit'`
2. Set `cycle.return_initiated_at = NOW()`
3. Set `box.container_state = 'Returning'`
4. Set `box.tracking_return` if available
5. Transition all garments to `InTransitReturn`
6. Emit event: `CycleReturning`

**Postconditions**:
- Carrier has return custody
- Expecting arrival at facility

---

### T-C010: ReturnInTransit → CloseoutInspection

**Trigger**: Box received at facility.

**Preconditions**:
- `cycle.cycle_state == 'ReturnInTransit'`

**Actions**:
1. Set `cycle.cycle_state = 'CloseoutInspection'`
2. Set `cycle.return_received_at = NOW()`
3. Set `box.container_state = 'Received'`
4. Transition all garments to `ReceivedReturn`
5. Emit event: `CycleReceived`

**Postconditions**:
- Garments pending inspection
- Settlement can begin after inspection

---

### T-C011: CloseoutInspection → Settled

**Trigger**: All garments inspected, settlement computed.

**Preconditions**:
- `cycle.cycle_state == 'CloseoutInspection'`
- All garments in `box.actual_contents` have completed inspection (transitioned out of `ReceivedReturn`)
- Settlement charges computed

**Actions**:
1. Set `cycle.cycle_state = 'Settled'`
2. Set `cycle.settled_at = NOW()`
3. Set `box.container_state = 'Reconciled'`
4. Apply charges/credits to user account
5. Update fit beliefs (via FitIntelligenceSubsystem)
6. Emit event: `CycleSettled`

**Postconditions**:
- Financial accounting complete
- Fit learning updated
- Garments routed (Available, Retired, etc.)

---

### T-C012: Settled → Closed

**Trigger**: Finalization.

**Preconditions**:
- `cycle.cycle_state == 'Settled'`

**Actions**:
1. Set `cycle.cycle_state = 'Closed'`
2. Set `cycle.closed_at = NOW()`
3. Set `box.container_state = 'Closed'`
4. Emit event: `CycleClosed`

**Postconditions**:
- Cycle is immutable (except audit corrections)
- Box available for reuse

---

## Exception Handling

### Late Return Escalation

When `cycle.cycle_state == 'ReturnWindowOpen'` and return window exceeded:

1. Day 1 overdue: Send reminder
2. Day 3 overdue: Send escalation
3. Day 7 overdue: Block next cycle commitment via `user.operational_state = 'HoldLogistics'`
4. Day 14 overdue: Declare garments Lost, initiate settlement

### Missing Delivery Signal

When `cycle.cycle_state == 'OutboundInTransit'` and expected delivery window exceeded:

1. Enter bounded uncertainty state
2. If user signals usage: Create `DeliveredByProxy` event, proceed
3. If carrier eventually confirms: Reconcile with actual timestamp
4. If carrier confirms failure: Trigger reship or skip with compensation

### Packing Variance at Ship Time

If `box.has_variance == true` at T-C005:

1. Block shipment until variance resolved
2. Resolution options:
   - Correct pack: Update `actual_contents`, re-verify
   - Commit to observed: Create `CompensatingAllocation` event, ship with actual
3. Fit learning receives `actual_contents`, not `planned_contents`
