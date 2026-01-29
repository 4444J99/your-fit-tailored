# Data Model: Weekly Cycle Flow

**Platform**: Airtable (additions to YFT-StateAuthority base)

## Additional Tables

### Configuration Table

Stores timing parameters for the orchestration layer.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| config_key | Single Line Text | Parameter name | Primary key |
| config_value | Single Line Text | Parameter value | Required |
| description | Long Text | What this parameter controls | Optional |
| updated_at | Last Modified | When last changed | System |

**Initial Configuration Records**:

| config_key | config_value | description |
|------------|--------------|-------------|
| scheduling_day | Sunday | Day of week to run auto-scheduling |
| scheduling_time | 18:00 | Time to run auto-scheduling (24h format) |
| commitment_lead_hours | 48 | Hours before ship to lock commitment |
| wear_window_days | 5 | Days in wear window |
| return_window_days | 2 | Days in return window before escalation |
| reminder_day_1 | 1 | Days after return window opens for first reminder |
| reminder_day_2 | 3 | Days overdue for second reminder |
| hold_threshold_days | 7 | Days overdue to apply HoldLogistics |
| loss_threshold_days | 14 | Days overdue to declare loss |
| ship_day_offset | 2 | Days after commitment before ship |

---

### SchedulingJobs Table

Tracks execution of the weekly scheduling automation.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| job_id | Auto Number | Primary key | Unique |
| run_time | Date + Time | When job executed | Required |
| target_week_id | Single Line Text | Week being scheduled | Required |
| users_eligible | Number | Users in Active state | Required |
| cycles_created | Number | New cycles created | Required |
| cycles_skipped | Number | Users skipped (already had cycle) | Required |
| errors | Long Text | Any errors encountered | Optional |
| duration_seconds | Number | How long job took | Optional |
| status | Single Select | Success/Failed/Partial | Required |

**status Options**: `Success`, `Failed`, `Partial`

---

### CommitmentBatches Table

Groups cycles committed together at commitment deadline.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| batch_id | Auto Number | Primary key | Unique |
| commitment_time | Date + Time | When commitment ran | Required |
| target_ship_date | Date | When these cycles should ship | Required |
| cycles_attempted | Number | Cycles attempted to commit | Required |
| cycles_committed | Number | Successfully committed | Required |
| cycles_blocked | Number | Blocked by holds/unavailability | Required |
| substitutions_made | Number | Garment substitutions | Required |
| cycles | Link to Records | Cycles in this batch | Multiple |
| errors | Long Text | Any errors encountered | Optional |
| status | Single Select | Success/Failed/Partial | Required |

---

### ShipmentBatches Table

Groups boxes shipped together.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| batch_id | Auto Number | Primary key | Unique |
| ship_date | Date | Actual ship date | Required |
| carrier | Single Line Text | Carrier used (pilot: manual) | Optional |
| boxes_shipped | Number | Count of boxes | Required |
| boxes | Link to Records | Boxes in this batch | Multiple |
| manifest_notes | Long Text | Manifest/tracking summary | Optional |
| created_by | Single Line Text | Operator who created batch | Required |

---

### ReturnReminders Table

Tracks scheduled and sent return reminders.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| reminder_id | Auto Number | Primary key | Unique |
| cycle_id | Link to Records | Associated cycle | Required |
| user_id | Link to Records | User to remind | Required |
| escalation_level | Number | 1, 2, or 3 | Required |
| scheduled_for | Date + Time | When to send | Required |
| sent_at | Date + Time | When actually sent | Optional |
| status | Single Select | Pending/Sent/Skipped | Required |
| skip_reason | Single Line Text | Why skipped (if applicable) | Optional |

**escalation_level**:
- 1 = First reminder (day 1 of return window)
- 2 = Second reminder (day 3 overdue)
- 3 = Final warning (day 6 overdue, before hold)

**status Options**: `Pending`, `Sent`, `Skipped`

---

## Enhanced Views

### Cycles Table Additional Views

Add to existing Cycles table:

- **Ready to Commit**: Filter: `cycle_state = 'Scheduled' AND ship_date - today <= commitment_lead_hours`
- **Ready to Ship**: Filter: `cycle_state = 'FulfillmentInProgress' AND box.container_state = 'PackedVerified'`
- **Awaiting Return**: Filter: `cycle_state IN ('WearWindowOpen', 'ReturnWindowOpen')`
- **Overdue Returns**: Filter: `cycle_state = 'ReturnWindowOpen' AND days_since_return_window_opened > 0`
- **Ready for Closeout**: Filter: `cycle_state = 'CloseoutInspection' AND all_garments_inspected = true`

### Computed Fields for Cycles

Add to Cycles table:

| Field | Type | Formula |
|-------|------|---------|
| ship_date | Date | `DATEADD(committed_at, {ship_day_offset}, 'days')` |
| expected_delivery_date | Date | `DATEADD(ship_date, 3, 'days')` |
| wear_window_ends | Date | `DATEADD(delivered_at, {wear_window_days}, 'days')` |
| return_window_ends | Date | `DATEADD(wear_window_ends, {return_window_days}, 'days')` |
| days_overdue | Number | `MAX(0, DATETIME_DIFF(NOW(), return_window_ends, 'days'))` |
| is_overdue | Checkbox | `days_overdue > 0` |

---

## Automation Specifications

### AutoScheduleCycles

**Trigger**: Time-based, every Sunday at 18:00

**Input**: Configuration.scheduling_day, Configuration.scheduling_time

**Logic**:
```
1. Get all Users where operational_state = 'Active'
2. Calculate target_week_id from user.weekly_anchor and next week
3. For each user:
   a. Check if Cycle exists for user_id + week_id
   b. If not exists:
      - Create Cycle in 'Scheduled' state
      - Set user_id, week_id
   c. If exists: skip (already scheduled)
4. Create SchedulingJob record with counts
```

**Output**: SchedulingJob record

---

### AutoCommitCycles

**Trigger**: Daily at 06:00 (checks for commitment deadline)

**Logic**:
```
1. Get cycles where:
   - cycle_state = 'Scheduled'
   - ship_date - now <= commitment_lead_hours
2. For each cycle:
   a. Check user.operational_state = 'Active'
   b. Check box.planned_contents all Available
   c. If checks pass:
      - Transition cycle to 'Committed'
      - Transition garments to 'Reserved'
   d. If user not Active:
      - Log blocked_reason = 'user_hold'
   e. If garments unavailable:
      - Attempt substitution
      - If no substitute: Cancel cycle with reason
3. Create CommitmentBatch record with counts
```

**Output**: CommitmentBatch record

---

### AutoProgressWearWindow

**Trigger**: Hourly

**Logic**:
```
1. Get cycles where:
   - cycle_state = 'Delivered'
   - delivered_at is not null
   → Transition to 'WearWindowOpen' (if not already)

2. Get cycles where:
   - cycle_state = 'WearWindowOpen'
   - NOW() > wear_window_ends
   → Transition to 'ReturnWindowOpen'
   → Create ReturnReminder (level 1) for next day
```

---

### CheckOverdueReturns

**Trigger**: Daily at 09:00

**Logic**:
```
1. Get cycles where:
   - cycle_state = 'ReturnWindowOpen'
   - days_overdue > 0

2. For each:
   a. If days_overdue >= loss_threshold_days:
      - Declare garments Lost
      - Transition cycle to exception state
      - Create settlement with loss charges
   b. If days_overdue >= hold_threshold_days:
      - Transition user to 'HoldLogistics' (if not already)
   c. If days_overdue >= reminder_day_2:
      - Create ReturnReminder (level 2) if not sent
```

---

### SendReturnReminders

**Trigger**: Daily at 10:00

**Logic**:
```
1. Get ReturnReminders where:
   - status = 'Pending'
   - scheduled_for <= NOW()

2. For each:
   a. Check if cycle still in ReturnWindowOpen
   b. If yes: Mark sent_at = NOW(), status = 'Sent'
   c. If no (returned): Mark status = 'Skipped'
```

**Note**: Actual notification sending is manual for pilot (email/SMS). Automation marks reminders for operator to action.

---

## Workflow Integrations

### Fulfillment Queue (Retool)

Query: Cycles ready for fulfillment, ordered by ship_date

```sql
-- Airtable filter
cycle_state = 'Committed'
AND box.container_state IN ('Planned', 'Picking')
ORDER BY ship_date ASC
```

Display: User, ship_date, box_id, garment_count, status

Actions:
- "Start Packing" → Transition box to 'Picking', cycle to 'FulfillmentInProgress'
- Click to open BoxPacker for specific box

### Shipment Dashboard (Retool)

Query: Boxes ready to ship

```sql
-- Airtable filter
container_state = 'PackedVerified'
ORDER BY cycle.ship_date ASC
```

Display: Box_id, cycle_id, user, ship_date, tracking (empty until entered)

Actions:
- Enter tracking number per box
- "Ship Selected" → Bulk transition to 'Shipped'
- Create ShipmentBatch record

### Receiving Station (Retool)

Query: Expected returns

```sql
-- Airtable filter
cycle.cycle_state = 'ReturnInTransit'
ORDER BY cycle.return_initiated_at ASC
```

Display: Box_id, user, expected_contents, tracking_return

Actions:
- Scan box barcode → Transition to 'Received', cycle to 'CloseoutInspection'
- Auto-transition garments to 'ReceivedReturn'
- Open InspectionStation for received box
