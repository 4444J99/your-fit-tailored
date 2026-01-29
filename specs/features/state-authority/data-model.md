# Data Model: State Authority Subsystem

**Platform**: Airtable
**Base**: YFT-StateAuthority

## Entity Tables

### Users Table

Represents UserEntity - contract-bearing participants.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| user_id | Auto Number | Primary key | Unique |
| display_name | Single Line Text | User-friendly identifier | Required |
| operational_state | Single Select | Current contract state | Required |
| fit_profile_ref | Link to Records | Reference to fit profile (future) | Optional |
| weekly_anchor | Single Select | Day of week for cycle start | Required |
| address_id | Link to Records | Shipping address | Optional |
| payment_method_id | Link to Records | Payment reference | Optional |
| created_at | Created Time | Auto-generated | System |
| updated_at | Last Modified | Auto-generated | System |

**operational_state Options**:
- `Active` - Cycles may be scheduled and committed
- `Paused` - Cycles not scheduled, state preserved
- `HoldPayment` - Payment issue blocks shipping
- `HoldIdentity` - Identity verification required
- `HoldLogistics` - Address/delivery issue blocks shipping
- `Closed` - Contract terminated

---

### Garments Table

Represents GarmentEntity - stateful physical assets.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| garment_id | Auto Number | Primary key | Unique |
| sku | Single Line Text | Product identifier | Required |
| barcode | Single Line Text | Physical barcode | Unique |
| asset_state | Single Select | Current lifecycle state | Required |
| condition_grade | Single Select | Quality assessment | Required |
| wear_count | Number | Lifetime wear cycles | Default: 0 |
| wash_count | Number | Lifetime wash cycles | Default: 0 |
| repair_count | Number | Lifetime repairs | Default: 0 |
| max_wear_limit | Number | Lifecycle bound | Default: 50 |
| current_cycle_id | Link to Records | Reserved/active cycle | Optional |
| current_box_id | Link to Records | Packed box | Optional |
| created_at | Created Time | Auto-generated | System |
| retired_at | Date | When retired | Optional |

**asset_state Options**:
- `Available` - Eligible for assignment
- `Reserved` - Selected for cycle, not yet packed
- `Packed` - Physically in a box
- `InTransitOutbound` - Shipped to user
- `Delivered` - At user location
- `InUse` - Wear window active
- `InTransitReturn` - Returning from user
- `ReceivedReturn` - Back at facility, pending inspection
- `Quarantine` - Withheld due to hygiene/contamination
- `Refurbish` - In cleaning/refresh processing
- `Repair` - In repair processing
- `Lost` - Declared non-recoverable
- `Retired` - Lifecycle complete, ineligible
- `Disposed` - Physically removed from system

**condition_grade Options**:
- `A` - Like new
- `B` - Good, minor wear
- `C` - Acceptable, visible wear
- `D` - Below standard, needs repair
- `F` - Failed, retire or dispose

**Computed Fields (Formulas)**:
- `lifecycle_remaining`: `max_wear_limit - wear_count`
- `over_limit`: `IF(wear_count >= max_wear_limit, TRUE(), FALSE())`

---

### Boxes Table

Represents BoxEntity - logistics containers.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| box_id | Auto Number | Primary key | Unique |
| box_barcode | Single Line Text | Physical barcode | Unique |
| container_state | Single Select | Current logistics state | Required |
| cycle_id | Link to Records | Associated cycle | Optional |
| planned_contents | Link to Records | Intended garments | Multiple |
| actual_contents | Link to Records | Scanned garments | Multiple |
| tracking_outbound | Single Line Text | Carrier tracking number | Optional |
| tracking_return | Single Line Text | Return tracking number | Optional |
| has_variance | Checkbox | Planned ≠ Actual | Computed |
| created_at | Created Time | Auto-generated | System |

**container_state Options**:
- `Created` - Container exists
- `Planned` - Contents committed logically
- `Picking` - Warehouse actions in progress
- `PackedVerified` - Contents confirmed
- `Shipped` - Outbound in transit
- `Delivered` - At user location
- `ReturnInitiated` - Return expected
- `Returning` - Inbound in transit
- `Received` - Back at facility
- `Reconciled` - Contents verified
- `Closed` - Available for reuse

**Computed Fields (Formulas)**:
- `has_variance`: Compare planned_contents vs actual_contents
- `garment_count`: `COUNTA(actual_contents)`

---

### Cycles Table

Represents CycleEntity - temporal contract instances.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| cycle_id | Auto Number | Primary key | Unique |
| user_id | Link to Records | Associated user | Required |
| week_id | Single Line Text | Derived week identifier | Required |
| cycle_state | Single Select | Current progression state | Required |
| box_id | Link to Records | Associated box | Optional |
| scheduled_at | Date | When cycle was scheduled | Optional |
| committed_at | Date | When inventory was locked | Optional |
| shipped_at | Date | When box shipped | Optional |
| delivered_at | Date | When delivered | Optional |
| return_initiated_at | Date | When return expected | Optional |
| return_received_at | Date | When box returned | Optional |
| settled_at | Date | When settlement computed | Optional |
| closed_at | Date | When cycle finalized | Optional |

**cycle_state Options**:
- `Scheduled` - Planned but reversible
- `Committed` - Inventory locked
- `FulfillmentInProgress` - Packing underway
- `OutboundInTransit` - Shipped
- `Delivered` - At user
- `WearWindowOpen` - User wearing
- `ReturnWindowOpen` - Return expected
- `ReturnInTransit` - Coming back
- `CloseoutInspection` - Inspecting returns
- `Settled` - Charges computed
- `Closed` - Immutable record

**Computed Fields (Formulas)**:
- `user_week_key`: `CONCATENATE(user_id, "-", week_id)` (for uniqueness check)

**Uniqueness Constraint**: Automation rejects creation if `user_week_key` already exists in Active/Committed cycles.

---

### Events Table

Append-only audit log for all state transitions.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| event_id | Auto Number | Primary key | Unique |
| entity_type | Single Select | User/Garment/Box/Cycle | Required |
| entity_id | Number | Reference to entity | Required |
| from_state | Single Line Text | Previous state | Required |
| to_state | Single Line Text | New state | Required |
| transition_type | Single Select | Normal/Compensating/Rejection | Required |
| timestamp | Created Time | When transition occurred | System |
| actor_id | Single Line Text | Who initiated (operator/system) | Required |
| cycle_id | Number | Associated cycle if applicable | Optional |
| metadata | Long Text | JSON additional data | Optional |
| idempotency_key | Single Line Text | Deduplication key | Optional |
| error_code | Single Line Text | If rejection, which error | Optional |

**transition_type Options**:
- `Normal` - Standard state change
- `Compensating` - Reversal/correction event
- `Rejection` - Invalid transition attempt

---

### TransitionRules Table

Defines valid state transitions and their preconditions.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| rule_id | Auto Number | Primary key | Unique |
| entity_type | Single Select | User/Garment/Box/Cycle | Required |
| from_state | Single Line Text | Source state | Required |
| to_state | Single Line Text | Target state | Required |
| preconditions | Long Text | JavaScript condition expression | Optional |
| postconditions | Long Text | Actions to perform after | Optional |
| is_active | Checkbox | Rule is enforced | Default: true |

**Example Rules**:

| entity_type | from_state | to_state | preconditions |
|-------------|------------|----------|---------------|
| Garment | Available | Reserved | `current_cycle_id == null` |
| Garment | Reserved | Packed | `current_box_id != null && box.state == 'Picking'` |
| Garment | ReceivedReturn | Available | `wear_count < max_wear_limit && condition_grade != 'F'` |
| Garment | ReceivedReturn | Retired | `wear_count >= max_wear_limit || condition_grade == 'F'` |
| Cycle | Scheduled | Committed | `user.state == 'Active' && box.state == 'Planned'` |
| User | Active | HoldPayment | `true` (system-initiated) |
| User | HoldPayment | Active | `payment_restored == true` |

---

### ErrorCodes Table

Lookup table for validation error definitions.

| Field | Type | Description |
|-------|------|-------------|
| error_code | Single Line Text | Unique code (e.g., "E001") |
| error_name | Single Line Text | Short name |
| error_message | Long Text | User-facing message |
| resolution_hint | Long Text | How to fix |

**Example Error Codes**:

| Code | Name | Message |
|------|------|---------|
| E001 | GarmentAlreadyReserved | This garment is already reserved for another cycle |
| E002 | CycleDuplicate | A cycle already exists for this user/week |
| E003 | InvalidTransition | Cannot transition from {from} to {to} |
| E004 | UserNotActive | User must be in Active state to commit cycle |
| E005 | LifecycleExceeded | Garment has exceeded its lifecycle limit |
| E006 | BoxVarianceUnresolved | Packing variance must be resolved before shipping |

## Relationships

```
Users (1) ──────< Cycles (many)
                     │
                     └── Box (1)
                           │
                           └──< Garments (many via actual_contents)

Garments ──> current_cycle_id ──> Cycles
Garments ──> current_box_id ──> Boxes

All Entities ──> Events (many)
```

## Indexes / Views

**Users Views**:
- `Active Users` - Filter: operational_state = Active
- `Users on Hold` - Filter: operational_state IN (HoldPayment, HoldLogistics, HoldIdentity)

**Garments Views**:
- `Available Inventory` - Filter: asset_state = Available
- `In Circulation` - Filter: asset_state IN (Reserved, Packed, InTransitOutbound, Delivered, InUse, InTransitReturn)
- `Pending Inspection` - Filter: asset_state = ReceivedReturn
- `Near Lifecycle Limit` - Filter: lifecycle_remaining <= 5

**Cycles Views**:
- `Open Cycles` - Filter: cycle_state NOT IN (Settled, Closed)
- `This Week's Cycles` - Filter: week_id = CURRENT_WEEK
- `Overdue Returns` - Filter: cycle_state = ReturnWindowOpen AND return_initiated_at < TODAY() - 7

**Events Views**:
- `Recent Events` - Sort: timestamp DESC, Limit: 100
- `Rejections` - Filter: transition_type = Rejection
- `By Entity` - Group by entity_type, entity_id
