# Garment State Transitions

**Entity**: GarmentEntity
**States**: Available, Reserved, Packed, InTransitOutbound, Delivered, InUse, InTransitReturn, ReceivedReturn, Quarantine, Refurbish, Repair, Lost, Retired, Disposed

## State Diagram

```
                                    ┌─────────────┐
                                    │   Created   │
                                    └──────┬──────┘
                                           │ intake
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────┐    reserve     ┌─────────────┐    pack      ┌───────────┐  │
│  │  Available  │───────────────▶│  Reserved   │─────────────▶│  Packed   │  │
│  └─────────────┘                └─────────────┘              └─────┬─────┘  │
│         ▲                              │                           │        │
│         │                              │ unassign                  │ ship   │
│         │                              ▼                           ▼        │
│         │                       (back to Available)         ┌─────────────┐ │
│         │                                                   │InTransit    │ │
│         │                                                   │Outbound     │ │
│         │                                                   └──────┬──────┘ │
│         │                                                          │        │
│         │                                                          │deliver │
│         │                                                          ▼        │
│         │                                                   ┌─────────────┐ │
│         │                                                   │  Delivered  │ │
│         │                                                   └──────┬──────┘ │
│         │                                                          │        │
│         │                                                          │wear    │
│         │                                                          ▼        │
│         │                                                   ┌─────────────┐ │
│         │                                                   │    InUse    │ │
│         │                                                   └──────┬──────┘ │
│         │                                                          │        │
│         │                                                          │return  │
│         │                                                          ▼        │
│         │                                                   ┌─────────────┐ │
│         │                                                   │InTransit    │ │
│         │                                                   │Return       │ │
│         │                                                   └──────┬──────┘ │
│         │                                                          │        │
│         │                                                          │receive │
│         │                                                          ▼        │
│         │                                                   ┌─────────────┐ │
│         │                         ┌─────────────────────────│Received     │ │
│         │                         │                         │Return       │ │
│         │                         │                         └──────┬──────┘ │
│         │                         │                                │        │
│         │                         │ quarantine                     │inspect │
│         │                         ▼                                ▼        │
│         │                  ┌─────────────┐              ┌─────────────────┐ │
│         │                  │ Quarantine  │              │   Refurbish     │ │
│         │                  └──────┬──────┘              └────────┬────────┘ │
│         │                         │                              │          │
│         │                         │ resolve                      │ complete │
│         │                         ▼                              │          │
│         │                  ┌─────────────┐                       │          │
│         │                  │   Repair    │───────────────────────┘          │
│         │                  └─────────────┘                       │          │
│         │                                                        │          │
│         └────────────────────────────────────────────────────────┘          │
│                        (if lifecycle OK)                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Exit States (terminal):
┌───────────┐     ┌───────────┐     ┌───────────┐
│   Lost    │     │  Retired  │     │ Disposed  │
└───────────┘     └───────────┘     └───────────┘
```

## Transition Contracts

### T-G001: Available → Reserved

**Trigger**: Cycle allocation selects garment for upcoming box.

**Preconditions**:
- `garment.asset_state == 'Available'`
- `garment.current_cycle_id == null`
- `garment.over_limit == false`
- `garment.condition_grade != 'F'`
- `target_cycle.cycle_state == 'Scheduled'`

**Actions**:
1. Set `garment.asset_state = 'Reserved'`
2. Set `garment.current_cycle_id = target_cycle.cycle_id`
3. Emit event: `GarmentReserved`

**Postconditions**:
- Garment is locked to this cycle
- Garment cannot be reserved for another cycle

**Error Codes**:
- `E001` - Garment already reserved for another cycle
- `E005` - Lifecycle exceeded
- `E007` - Condition grade too low

---

### T-G002: Reserved → Available (Unassign)

**Trigger**: Cycle cancelled or garment swapped before packing.

**Preconditions**:
- `garment.asset_state == 'Reserved'`
- `garment.current_box_id == null` (not yet packed)

**Actions**:
1. Set `garment.asset_state = 'Available'`
2. Clear `garment.current_cycle_id`
3. Emit event: `GarmentUnassigned` (compensating)

**Postconditions**:
- Garment is available for other cycles

**Error Codes**:
- `E008` - Cannot unassign after packing

---

### T-G003: Reserved → Packed

**Trigger**: Operator scans garment into box during packing.

**Preconditions**:
- `garment.asset_state == 'Reserved'`
- `garment.current_cycle_id != null`
- `target_box.container_state == 'Picking'`
- `target_box.cycle_id == garment.current_cycle_id`

**Actions**:
1. Set `garment.asset_state = 'Packed'`
2. Set `garment.current_box_id = target_box.box_id`
3. Add garment to `target_box.actual_contents`
4. Emit event: `GarmentPacked`

**Postconditions**:
- Garment is physically in box
- Box actual_contents includes this garment

**Error Codes**:
- `E009` - Box not in Picking state
- `E010` - Garment/box cycle mismatch

---

### T-G004: Packed → InTransitOutbound

**Trigger**: Box ships.

**Preconditions**:
- `garment.asset_state == 'Packed'`
- `garment.current_box_id != null`
- `box.container_state == 'Shipped'`

**Actions**:
1. Set `garment.asset_state = 'InTransitOutbound'`
2. Emit event: `GarmentShipped`

**Postconditions**:
- Garment custody is external (carrier)

**Error Codes**:
- `E011` - Box not yet shipped

---

### T-G005: InTransitOutbound → Delivered

**Trigger**: Delivery confirmation received.

**Preconditions**:
- `garment.asset_state == 'InTransitOutbound'`
- `box.container_state == 'Delivered'`

**Actions**:
1. Set `garment.asset_state = 'Delivered'`
2. Emit event: `GarmentDelivered`

**Postconditions**:
- Garment is at user location

---

### T-G006: Delivered → InUse

**Trigger**: Wear window opens (automatic or explicit).

**Preconditions**:
- `garment.asset_state == 'Delivered'`
- `cycle.cycle_state == 'WearWindowOpen'`

**Actions**:
1. Set `garment.asset_state = 'InUse'`
2. Emit event: `GarmentInUse`

**Postconditions**:
- Garment is being worn

---

### T-G007: InUse → InTransitReturn

**Trigger**: Return initiated.

**Preconditions**:
- `garment.asset_state == 'InUse'`
- `box.container_state IN ('ReturnInitiated', 'Returning')`

**Actions**:
1. Set `garment.asset_state = 'InTransitReturn'`
2. Emit event: `GarmentReturning`

**Postconditions**:
- Garment is in transit back to facility

---

### T-G008: InTransitReturn → ReceivedReturn

**Trigger**: Box received at facility, garment scanned.

**Preconditions**:
- `garment.asset_state == 'InTransitReturn'`
- `box.container_state == 'Received'`

**Actions**:
1. Set `garment.asset_state = 'ReceivedReturn'`
2. Emit event: `GarmentReceived`

**Postconditions**:
- Garment is at facility pending inspection

---

### T-G009: ReceivedReturn → Refurbish

**Trigger**: Inspection passes, normal refurbishment needed.

**Preconditions**:
- `garment.asset_state == 'ReceivedReturn'`
- `garment.condition_grade IN ('A', 'B', 'C')`
- `garment.over_limit == false`

**Actions**:
1. Set `garment.asset_state = 'Refurbish'`
2. Increment `garment.wear_count`
3. Emit event: `GarmentToRefurbish`

**Postconditions**:
- Garment is in cleaning/refresh queue

---

### T-G010: ReceivedReturn → Quarantine

**Trigger**: Inspection finds contamination or safety issue.

**Preconditions**:
- `garment.asset_state == 'ReceivedReturn'`
- `inspection.safety_flag == true`

**Actions**:
1. Set `garment.asset_state = 'Quarantine'`
2. Emit event: `GarmentQuarantined` with `reason`

**Postconditions**:
- Garment is isolated from circulation

---

### T-G011: ReceivedReturn → Retired

**Trigger**: Lifecycle bounds exceeded or condition failed.

**Preconditions**:
- `garment.asset_state == 'ReceivedReturn'`
- `garment.over_limit == true OR garment.condition_grade == 'F'`

**Actions**:
1. Set `garment.asset_state = 'Retired'`
2. Set `garment.retired_at = NOW()`
3. Clear `garment.current_cycle_id`
4. Clear `garment.current_box_id`
5. Emit event: `GarmentRetired` with `reason`

**Postconditions**:
- Garment permanently ineligible for circulation

---

### T-G012: Refurbish → Available

**Trigger**: Refurbishment complete.

**Preconditions**:
- `garment.asset_state == 'Refurbish'`
- `garment.over_limit == false`
- `refurbishment.complete == true`

**Actions**:
1. Set `garment.asset_state = 'Available'`
2. Increment `garment.wash_count`
3. Clear `garment.current_cycle_id`
4. Clear `garment.current_box_id`
5. Update `garment.condition_grade` based on inspection
6. Emit event: `GarmentAvailable`

**Postconditions**:
- Garment is ready for next cycle

---

### T-G013: Quarantine → Repair

**Trigger**: Quarantine resolved, repair needed.

**Preconditions**:
- `garment.asset_state == 'Quarantine'`
- `quarantine.resolution == 'repair'`

**Actions**:
1. Set `garment.asset_state = 'Repair'`
2. Emit event: `GarmentToRepair`

**Postconditions**:
- Garment is in repair queue

---

### T-G014: Repair → Refurbish

**Trigger**: Repair complete, needs refurbishment before return to circulation.

**Preconditions**:
- `garment.asset_state == 'Repair'`
- `repair.complete == true`

**Actions**:
1. Set `garment.asset_state = 'Refurbish'`
2. Increment `garment.repair_count`
3. Emit event: `GarmentRepaired`

**Postconditions**:
- Garment proceeds to standard refurbishment

---

### T-G015: Any → Lost

**Trigger**: Garment declared non-recoverable.

**Preconditions**:
- `garment.asset_state IN ('InTransitOutbound', 'Delivered', 'InUse', 'InTransitReturn')`
- `declaration.reason != null`

**Actions**:
1. Set `garment.asset_state = 'Lost'`
2. Emit event: `GarmentLost` with `reason`
3. Trigger settlement in UserContractEnforcementSubsystem

**Postconditions**:
- Garment removed from active tracking
- Financial settlement required

---

### T-G016: Retired → Disposed

**Trigger**: Physical removal from system.

**Preconditions**:
- `garment.asset_state == 'Retired'`

**Actions**:
1. Set `garment.asset_state = 'Disposed'`
2. Emit event: `GarmentDisposed` with `method` (resale/donation/recycle)

**Postconditions**:
- Garment lifecycle complete
