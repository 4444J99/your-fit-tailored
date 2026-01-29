# Airtable Setup Guide: Weekly Cycle Flow

## Prerequisites

- Airtable base `YFT-StateAuthority` created (from State Authority setup)
- All State Authority tables exist and functional
- Airtable Pro account (required for automations)

## Overview

This guide adds orchestration tables and automations to support the weekly cycle workflow. These additions enable:
- Automatic cycle scheduling
- Commitment batch tracking
- Shipment management
- Return reminder tracking

---

## Phase 1: Add Orchestration Tables (T101-T110)

### T101: Create Configuration Table

Stores timing parameters that control the orchestration layer.

1. Create new table: `Configuration`
2. Rename primary field to `config_key` (Single line text)
3. Add fields:

| Field Name | Type | Description |
|------------|------|-------------|
| config_key | Single line text | Primary field, unique key |
| config_value | Single line text | Parameter value |
| description | Long text | What this parameter controls |
| updated_at | Last modified time | System-managed |

4. Import seed data from `seed-data/configuration.csv`

### T102: Create SchedulingJobs Table

Tracks execution of weekly scheduling automation.

1. Create new table: `SchedulingJobs`
2. Rename primary field to `job_id` (Auto number)
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| job_id | Auto number | Primary field |
| run_time | Date & time | Required |
| target_week_id | Single line text | Format: YYYY-WNN |
| users_eligible | Number | Count of Active users |
| cycles_created | Number | New cycles created |
| cycles_skipped | Number | Users already had cycle |
| errors | Long text | JSON array of errors |
| duration_seconds | Number | Job execution time |
| status | Single select | Success, Failed, Partial |

**status Options**: `Success`, `Failed`, `Partial`

### T103: Create CommitmentBatches Table

Groups cycles committed together at commitment deadline.

1. Create new table: `CommitmentBatches`
2. Rename primary field to `batch_id` (Auto number)
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| batch_id | Auto number | Primary field |
| commitment_time | Date & time | When batch ran |
| target_ship_date | Date | When cycles should ship |
| cycles_attempted | Number | Total attempted |
| cycles_committed | Number | Successfully committed |
| cycles_blocked | Number | Blocked by holds |
| substitutions_made | Number | Garment substitutions |
| cycles | Link to another record | Link to Cycles (multiple) |
| errors | Long text | JSON array of errors |
| status | Single select | Success, Failed, Partial |

### T104: Create ShipmentBatches Table

Groups boxes shipped together.

1. Create new table: `ShipmentBatches`
2. Rename primary field to `batch_id` (Auto number)
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| batch_id | Auto number | Primary field |
| ship_date | Date | Actual ship date |
| carrier | Single line text | Carrier used |
| boxes_shipped | Number | Count of boxes |
| boxes | Link to another record | Link to Boxes (multiple) |
| manifest_notes | Long text | Manifest/tracking summary |
| created_by | Single line text | Operator who created |
| created_at | Created time | System-managed |

### T105: Create ReturnReminders Table

Tracks scheduled and sent return reminders.

1. Create new table: `ReturnReminders`
2. Rename primary field to `reminder_id` (Auto number)
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| reminder_id | Auto number | Primary field |
| cycle_id | Link to another record | Link to Cycles |
| user_id | Link to another record | Link to Users |
| escalation_level | Number | 1, 2, or 3 |
| scheduled_for | Date & time | When to send |
| sent_at | Date & time | When actually sent |
| status | Single select | Pending, Sent, Skipped |
| skip_reason | Single line text | Why skipped (if applicable) |

**escalation_level Values**:
- 1 = First reminder (day 1 of return window)
- 2 = Second reminder (day 3 overdue)
- 3 = Final warning (day 6 overdue, before hold)

**status Options**: `Pending`, `Sent`, `Skipped`

---

## Phase 2: Add Computed Fields to Cycles (T106-T110)

Add these fields to the existing Cycles table:

### T106: Ship Date Calculation

Add formula field `ship_date`:
```
IF(
  {committed_at},
  DATEADD({committed_at}, 2, 'days'),
  BLANK()
)
```

### T107: Expected Delivery Date

Add formula field `expected_delivery_date`:
```
IF(
  {ship_date},
  DATEADD({ship_date}, 3, 'days'),
  BLANK()
)
```

### T108: Wear Window End Date

Add formula field `wear_window_ends`:
```
IF(
  {delivered_at},
  DATEADD({delivered_at}, 5, 'days'),
  BLANK()
)
```

### T109: Return Window End Date

Add formula field `return_window_ends`:
```
IF(
  {wear_window_ends},
  DATEADD({wear_window_ends}, 2, 'days'),
  BLANK()
)
```

### T110: Days Overdue Calculation

Add formula field `days_overdue`:
```
IF(
  AND(
    {return_window_ends},
    {cycle_state} = 'ReturnWindowOpen'
  ),
  MAX(0, DATETIME_DIFF(NOW(), {return_window_ends}, 'days')),
  0
)
```

Add checkbox field `is_overdue`:
```
{days_overdue} > 0
```

---

## Phase 3: Create Views (T111-T120)

### Cycles Table Views

**T111: Ready to Commit**
- Filter: `cycle_state = 'Scheduled'`
- Sort: `week_id` ascending

**T112: Ready to Ship**
- Filter: `cycle_state = 'Committed' OR cycle_state = 'FulfillmentInProgress'`
- Sort: `ship_date` ascending

**T113: Awaiting Return**
- Filter: `cycle_state = 'WearWindowOpen' OR cycle_state = 'ReturnWindowOpen'`
- Sort: `wear_window_ends` ascending

**T114: Overdue Returns**
- Filter: `is_overdue = TRUE`
- Sort: `days_overdue` descending

**T115: Ready for Closeout**
- Filter: `cycle_state = 'CloseoutInspection'`
- Sort: `return_received_at` ascending

### SchedulingJobs Table Views

**T116: Recent Jobs**
- Filter: (none)
- Sort: `run_time` descending
- Limit: 10 recent

### CommitmentBatches Table Views

**T117: Recent Batches**
- Filter: (none)
- Sort: `commitment_time` descending

### ReturnReminders Table Views

**T118: Pending Reminders**
- Filter: `status = 'Pending'`
- Sort: `scheduled_for` ascending

**T119: Sent Today**
- Filter: `sent_at = TODAY()`
- Sort: `sent_at` descending

---

## Phase 4: Create Automations (T121-T130)

### T121: Auto-Schedule Cycles

**Trigger**: Time-based, every Sunday at 18:00

**Script**: Use `automations/auto-schedule-cycles.js`

**Setup**:
1. Go to Automations tab
2. Create new automation: `Auto-Schedule Cycles`
3. Trigger: "At a scheduled time" → Every week, Sunday, 6:00 PM
4. Action: Run a script
5. Paste script from `automations/auto-schedule-cycles.js`
6. Configure input variables:
   - (none required, script queries tables directly)

**Second Action**: Create record in SchedulingJobs
- Map outputs from script to fields

### T122: Auto-Commit Cycles

**Trigger**: Time-based, daily at 06:00

**Script**: Use `automations/auto-commit-cycles.js`

**Setup**:
1. Create automation: `Auto-Commit Cycles`
2. Trigger: "At a scheduled time" → Daily at 6:00 AM
3. Action: Run a script
4. Paste script from `automations/auto-commit-cycles.js`

**Second Action**: Create record in CommitmentBatches

### T123: Auto-Progress Wear Window

**Trigger**: Time-based, hourly

**Script**: Use `automations/auto-progress-wear-window.js`

**Setup**:
1. Create automation: `Auto-Progress Wear Window`
2. Trigger: "At a scheduled time" → Every hour
3. Action: Run a script
4. Paste script

**Note**: Airtable free tier limits automations. For pilot, can run manually or reduce frequency.

### T124: Check Overdue Returns

**Trigger**: Time-based, daily at 09:00

**Script**: Use `automations/check-overdue-returns.js`

**Setup**:
1. Create automation: `Check Overdue Returns`
2. Trigger: "At a scheduled time" → Daily at 9:00 AM
3. Action: Run a script
4. Paste script

---

## Verification Checklist

After completing setup:

- [ ] Configuration table created with 10 seed records
- [ ] SchedulingJobs table created
- [ ] CommitmentBatches table created
- [ ] ShipmentBatches table created
- [ ] ReturnReminders table created
- [ ] Cycles table has 6 new computed fields
- [ ] All views created and showing correct records
- [ ] Auto-Schedule Cycles automation enabled
- [ ] Auto-Commit Cycles automation enabled
- [ ] Auto-Progress Wear Window automation enabled
- [ ] Check Overdue Returns automation enabled

---

## Testing

### Test Auto-Scheduling

1. Create a test user in `Active` state with `weekly_anchor = Monday`
2. Manually trigger the Auto-Schedule Cycles automation
3. Verify: New cycle created for test user in `Scheduled` state
4. Verify: SchedulingJob record created with `cycles_created = 1`

### Test Commitment

1. Create a scheduled cycle with a ship_date within 48 hours
2. Ensure cycle has a box with planned garments (all `Available`)
3. Manually trigger Auto-Commit Cycles
4. Verify: Cycle transitions to `Committed`
5. Verify: Garments transition to `Reserved`
6. Verify: CommitmentBatch record created

### Test Wear Window Progression

1. Create a cycle in `Delivered` state with `delivered_at` set to 5+ days ago
2. Manually trigger Auto-Progress Wear Window
3. Verify: Cycle transitions to `ReturnWindowOpen`
4. Verify: ReturnReminder created with `escalation_level = 1`

---

## Troubleshooting

### Automation Not Running
- Check Airtable automation limits (Pro plan has limits)
- Verify trigger conditions are met
- Check automation run history for errors

### Script Errors
- Verify all field names match exactly (case-sensitive)
- Check that linked records are properly configured
- Review Airtable scripting documentation for API limits

### Wrong Records Updated
- Review filter conditions in views
- Check date calculations in formulas
- Verify timezone settings in Airtable base
