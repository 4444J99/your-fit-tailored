# Box State Transitions

**Entity**: BoxEntity
**States**: Created, Planned, Picking, PackedVerified, Shipped, Delivered, ReturnInitiated, Returning, Received, Reconciled, Closed

## State Diagram

```
┌─────────────┐
│   Created   │ ◄── box container registered
└──────┬──────┘
       │ assign_to_cycle
       ▼
┌─────────────┐
│   Planned   │ ◄── contents committed logically
└──────┬──────┘
       │ start_picking
       ▼
┌─────────────┐
│   Picking   │ ◄── warehouse scanning garments
└──────┬──────┘
       │ verify (all scanned, variance resolved)
       ▼
┌──────────────┐
│PackedVerified│ ◄── contents confirmed
└──────┬───────┘
       │ ship
       ▼
┌─────────────┐
│   Shipped   │ ◄── outbound in transit
└──────┬──────┘
       │ deliver
       ▼
┌─────────────┐
│  Delivered  │ ◄── at user location
└──────┬──────┘
       │ initiate_return (automatic)
       ▼
┌───────────────┐
│ReturnInitiated│ ◄── expecting return
└──────┬────────┘
       │ return_pickup
       ▼
┌─────────────┐
│  Returning  │ ◄── inbound in transit
└──────┬──────┘
       │ receive
       ▼
┌─────────────┐
│  Received   │ ◄── at facility
└──────┬──────┘
       │ reconcile
       ▼
┌─────────────┐
│ Reconciled  │ ◄── contents verified
└──────┬──────┘
       │ close
       ▼
┌─────────────┐
│   Closed    │ ◄── available for reuse
└─────────────┘
```

## Transition Contracts

### T-B001: (none) → Created

**Trigger**: New box container registered in system.

**Preconditions**:
- `box_barcode` is unique
- Box is physically available

**Actions**:
1. Create BoxEntity with `container_state = 'Created'`
2. Set `box_barcode`
3. Emit event: `BoxCreated`

**Postconditions**:
- Box exists and can be assigned to cycles

---

### T-B002: Created → Planned (or Closed → Planned for reuse)

**Trigger**: Box assigned to cycle, contents determined.

**Preconditions**:
- `box.container_state IN ('Created', 'Closed')`
- `cycle.cycle_state == 'Scheduled'` OR `cycle.cycle_state == 'Committed'`
- `planned_contents` determined (list of garment_ids)

**Actions**:
1. Set `box.container_state = 'Planned'`
2. Set `box.cycle_id = cycle.cycle_id`
3. Set `box.planned_contents = [garment_ids]`
4. Clear `box.actual_contents`
5. Emit event: `BoxPlanned`

**Postconditions**:
- Box is committed to cycle
- Planned contents recorded for variance detection

---

### T-B003: Planned → Picking

**Trigger**: Warehouse begins packing.

**Preconditions**:
- `box.container_state == 'Planned'`
- `cycle.cycle_state == 'Committed'`

**Actions**:
1. Set `box.container_state = 'Picking'`
2. Emit event: `BoxPickingStarted`

**Postconditions**:
- Box ready to receive scanned garments
- Garments can transition to `Packed`

---

### T-B004: Picking → PackedVerified

**Trigger**: All planned garments scanned, no variance OR variance resolved.

**Preconditions**:
- `box.container_state == 'Picking'`
- `box.actual_contents` contains garments
- `box.has_variance == false` OR `variance_resolution` provided

**Actions**:
1. If variance existed:
   - Record `PackingVariance` event with planned vs actual
   - If `variance_resolution == 'commit_observed'`: Record `CompensatingAllocation` event
   - If `variance_resolution == 'corrected'`: Verify planned == actual
2. Set `box.container_state = 'PackedVerified'`
3. Emit event: `BoxPackedVerified`

**Postconditions**:
- Box contents are final
- Ready for shipment

**Error Codes**:
- `E006` - Box variance unresolved

---

### T-B005: PackedVerified → Shipped

**Trigger**: Box handed to carrier.

**Preconditions**:
- `box.container_state == 'PackedVerified'`
- `box.tracking_outbound != null`

**Actions**:
1. Set `box.container_state = 'Shipped'`
2. Emit event: `BoxShipped`

**Postconditions**:
- Custody transferred to carrier
- Tracking available

**Error Codes**:
- `E016` - No tracking number

---

### T-B006: Shipped → Delivered

**Trigger**: Delivery confirmation received.

**Preconditions**:
- `box.container_state == 'Shipped'`
- Delivery signal received (carrier or proxy)

**Actions**:
1. Set `box.container_state = 'Delivered'`
2. Emit event: `BoxDelivered`

**Postconditions**:
- User has custody
- Box is with user

---

### T-B007: Delivered → ReturnInitiated

**Trigger**: Automatic at wear window end.

**Preconditions**:
- `box.container_state == 'Delivered'`
- `cycle.cycle_state` transitions to `ReturnWindowOpen`

**Actions**:
1. Set `box.container_state = 'ReturnInitiated'`
2. Emit event: `BoxReturnInitiated`

**Postconditions**:
- System expects return
- Reminders scheduled

---

### T-B008: ReturnInitiated → Returning

**Trigger**: Return pickup/dropoff confirmed.

**Preconditions**:
- `box.container_state == 'ReturnInitiated'`
- Return signal received (carrier pickup, drop-off scan)

**Actions**:
1. Set `box.container_state = 'Returning'`
2. Set `box.tracking_return` if available
3. Emit event: `BoxReturning`

**Postconditions**:
- Box is in transit back
- Carrier has custody

---

### T-B009: Returning → Received

**Trigger**: Box scanned at facility.

**Preconditions**:
- `box.container_state == 'Returning'`
- Box barcode scanned at receiving

**Actions**:
1. Set `box.container_state = 'Received'`
2. Emit event: `BoxReceived`

**Postconditions**:
- Box is at facility
- Contents pending verification

---

### T-B010: Received → Reconciled

**Trigger**: Contents verified against expected.

**Preconditions**:
- `box.container_state == 'Received'`
- All garments in `actual_contents` have been inspected

**Actions**:
1. Set `box.container_state = 'Reconciled'`
2. Compare returned contents to `actual_contents` (what was shipped)
3. If discrepancy: Record `ReturnVariance` event
4. Emit event: `BoxReconciled`

**Postconditions**:
- Contents accounted for
- Variances recorded for settlement

---

### T-B011: Reconciled → Closed

**Trigger**: Cycle settlement complete.

**Preconditions**:
- `box.container_state == 'Reconciled'`
- `cycle.cycle_state` is `Settled` or `Closed`

**Actions**:
1. Set `box.container_state = 'Closed'`
2. Clear `box.cycle_id`
3. Clear `box.planned_contents`
4. Clear `box.actual_contents`
5. Clear tracking numbers
6. Emit event: `BoxClosed`

**Postconditions**:
- Box available for reuse
- History preserved in events

---

## Variance Handling

### Packing Variance Detection

During `Picking` state:
- Operator scans garment
- System checks if garment is in `planned_contents`
- If not: `has_variance = true`, records unplanned garment
- At pack completion: If `actual_contents != planned_contents`, block transition to `PackedVerified`

### Variance Resolution Options

1. **Correct the pack**:
   - Remove unplanned garments (transition back to Available)
   - Add missing planned garments (scan them)
   - Re-verify until `actual_contents == planned_contents`

2. **Commit to observed**:
   - Create `CompensatingAllocation` event
   - Record that cycle will ship observed set
   - Update fit intelligence to expect observed, not planned
   - Proceed to `PackedVerified`

### Return Variance Detection

During `Received` → `Reconciled`:
- Scan returned contents
- Compare to `actual_contents` (what shipped)
- If garment missing: Record `MissingGarment` event
- If extra garment: Record `ExtraGarment` event (wrong box returned?)
- All variances trigger investigation workflow

### Variance Events

| Event | Trigger | Data |
|-------|---------|------|
| `PackingVariance` | Planned ≠ Actual at pack | planned[], actual[], diff[] |
| `CompensatingAllocation` | Shipping with variance | reason, observed_contents[] |
| `ReturnVariance` | Returned ≠ Shipped | expected[], returned[], missing[], extra[] |
| `MissingGarment` | Garment not in return | garment_id, last_known_state |
| `ExtraGarment` | Unexpected garment in return | garment_id, expected_box_id |
