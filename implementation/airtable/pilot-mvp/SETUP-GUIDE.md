# Airtable Setup Guide: Pilot MVP

## Prerequisites

- Airtable base `YFT-StateAuthority` with State Authority and Weekly Cycle Flow tables
- All automations from previous phases enabled
- Airtable Pro account

## Overview

This guide adds tables to support the 25-user pilot:
- **FitProfiles**: Manual fit data for allocation decisions
- **CommunicationEvents**: Track emails/messages sent to users
- **PilotFeedback**: User feedback and fit observations

---

## Phase 1: Create Pilot-Specific Tables (T201-T210)

### T201: Create FitProfiles Table

Stores user fit preferences and sizing information.

1. Create new table: `FitProfiles`
2. Rename primary field to `profile_id` (Auto number)
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| profile_id | Auto number | Primary field |
| user_id | Link to another record | Link to Users (single) |
| top_size | Single select | XS, S, M, L, XL, XXL |
| bottom_size | Single select | 28, 30, 32, 34, 36, 38, 40 |
| dress_size | Single select | 0, 2, 4, 6, 8, 10, 12, 14 |
| height_inches | Number | Optional |
| weight_lbs | Number | Optional |
| body_type | Single select | Slim, Athletic, Average, Curvy, Plus |
| style_preference | Multiple select | Casual, Professional, Minimal, Bold, Classic |
| color_preference | Multiple select | Neutrals, Darks, Brights, Pastels |
| avoid_colors | Multiple select | Black, White, Red, Yellow, Blue, Green, etc. |
| fit_notes | Long text | Free-form notes from user or operator |
| source | Single select | Onboarding, Feedback, Operator |
| created_at | Created time | |
| updated_at | Last modified time | |

4. Update Users table: Add link field `fit_profile` → FitProfiles

### T202: Create CommunicationEvents Table

Tracks all communications sent to users during the pilot.

1. Create new table: `CommunicationEvents`
2. Rename primary field to `comm_id` (Auto number)
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| comm_id | Auto number | Primary field |
| user_id | Link to another record | Link to Users |
| cycle_id | Link to another record | Link to Cycles (optional) |
| comm_type | Single select | BoxShipping, DeliveryConfirmed, ReturnReminder1, ReturnReminder2, OverdueWarning, HoldNotice, General |
| channel | Single select | Email, SMS, Phone |
| subject | Single line text | Email subject or message summary |
| sent_at | Date & time | When sent |
| sent_by | Single line text | Operator name |
| status | Single select | Sent, Failed, Bounced |
| notes | Long text | Any special circumstances |

**comm_type Options**:
- `BoxShipping` - Your box is on the way
- `DeliveryConfirmed` - Your box has arrived
- `ReturnReminder1` - Time to return your box (day 1)
- `ReturnReminder2` - Reminder: return your box (day 3)
- `OverdueWarning` - Your return is overdue
- `HoldNotice` - Action required on your account
- `General` - Other communications

### T203: Create PilotFeedback Table

Captures user feedback and operator observations.

1. Create new table: `PilotFeedback`
2. Rename primary field to `feedback_id` (Auto number)
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| feedback_id | Auto number | Primary field |
| user_id | Link to another record | Link to Users |
| cycle_id | Link to another record | Link to Cycles |
| garment_id | Link to another record | Link to Garments (optional) |
| feedback_type | Single select | FitIssue, QualityIssue, StyleFeedback, PositiveFeedback, Suggestion, Complaint |
| severity | Single select | Low, Medium, High, Critical |
| description | Long text | Detailed feedback |
| fit_rating | Rating | 1-5 stars |
| would_wear_again | Checkbox | |
| operator_notes | Long text | Internal notes |
| action_taken | Long text | Resolution or follow-up |
| reported_at | Date & time | When feedback received |
| reported_by | Single select | User, Operator |
| resolved_at | Date & time | |
| resolved | Checkbox | |

**feedback_type Options**:
- `FitIssue` - Size or fit problems
- `QualityIssue` - Damage, defects, wear
- `StyleFeedback` - Style preference comments
- `PositiveFeedback` - Things they liked
- `Suggestion` - Ideas for improvement
- `Complaint` - Service issues

---

## Phase 2: Create Views (T211-T220)

### FitProfiles Table Views

**T211: All Profiles**
- Sort: user_id ascending

**T212: By Top Size**
- Group: top_size
- Use for inventory planning

**T213: By Bottom Size**
- Group: bottom_size

### CommunicationEvents Table Views

**T214: Recent Communications**
- Sort: sent_at descending
- Limit: 50

**T215: By User**
- Group: user_id
- Sort: sent_at descending

**T216: Pending to Send**
- Filter: status = 'Pending' (if you add that status)
- Or use ReturnReminders.status = 'Pending' as source of truth

### PilotFeedback Table Views

**T217: Unresolved Feedback**
- Filter: resolved = FALSE
- Sort: severity DESC, reported_at ASC

**T218: Fit Issues**
- Filter: feedback_type = 'FitIssue'
- Group: garment_id

**T219: By Garment**
- Filter: garment_id IS NOT EMPTY
- Group: garment_id
- Use to identify problem garments

**T220: By User**
- Group: user_id
- Sort: reported_at DESC

---

## Phase 3: Link Updates (T221-T225)

### T221: Link Users to FitProfiles

Update Users table:
1. Add field `fit_profile` (Link to another record → FitProfiles)
2. Set as single record link

### T222: Link Garments to Feedback

Update Garments table:
1. Add field `feedback` (Link to another record → PilotFeedback)
2. Allow multiple (a garment may have multiple feedback entries)

### T223: Create Rollup: Average Fit Rating per User

In Users table, add rollup field `avg_fit_rating`:
- Linked record field: (cycles → feedback)
- Field to aggregate: fit_rating
- Aggregation: AVERAGE

**Note**: This requires intermediate linkage through Cycles. May need formula workaround for pilot.

### T224: Create Rollup: Feedback Count per Garment

In Garments table, add rollup field `feedback_count`:
- Linked record field: feedback
- Field to aggregate: feedback_id
- Aggregation: COUNT

### T225: Create Formula: User Communication Summary

In Users table, add formula field `last_comm_date`:
```
MAX(VALUES({communications}[sent_at]))
```

**Note**: This requires the reverse link from CommunicationEvents.user_id.

---

## Phase 4: Pilot-Specific Automations (T226-T230)

### T226: Auto-Link New User to FitProfile

**Trigger**: When record created in Users
**Action**: Create linked FitProfiles record

```javascript
// Input: new user record
let userId = input.config().user_id;
let userName = input.config().display_name;

// Create empty fit profile
output.set('create_profile', true);
output.set('user_id', userId);
```

Then add action: Create record in FitProfiles with user_id link.

### T227: Auto-Flag Low Fit Ratings

**Trigger**: When record created in PilotFeedback with fit_rating < 3
**Action**: Create notification or flag

For pilot: Can be manual review via "Unresolved Feedback" view.

### T228: Track Pilot User Count

**Trigger**: When record created in Users
**Condition**: Count of Active users >= 25
**Action**: Send notification (webhook or email)

```javascript
let userCount = input.config().active_user_count;
if (userCount >= 25) {
    output.set('capacity_reached', true);
}
```

---

## Verification Checklist

After completing setup:

- [ ] FitProfiles table created with all fields
- [ ] CommunicationEvents table created
- [ ] PilotFeedback table created
- [ ] Users table linked to FitProfiles
- [ ] All views created and functional
- [ ] Test: Create user → FitProfile auto-created
- [ ] Test: Log communication → Appears in user's history
- [ ] Test: Submit feedback → Appears in unresolved queue

---

## Seed Data: Schema Reference

### FitProfiles Schema (`seed-data/fit-profiles-schema.csv`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user_id | Link | Yes | Link to Users table |
| top_size | Single select | Yes | XS through XXL |
| bottom_size | Single select | Yes | 28 through 40 |
| dress_size | Single select | No | Numeric sizes |
| height_inches | Number | No | User height |
| weight_lbs | Number | No | User weight |
| body_type | Single select | No | Body shape category |
| style_preference | Multiple select | No | Style tags |
| color_preference | Multiple select | No | Preferred colors |
| avoid_colors | Multiple select | No | Colors to exclude |
| fit_notes | Long text | No | Free-form notes |
| source | Single select | Yes | Where data came from |

### CommunicationEvents Schema (`seed-data/communication-events-schema.csv`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user_id | Link | Yes | Link to Users table |
| cycle_id | Link | No | Link to Cycles table |
| comm_type | Single select | Yes | Communication category |
| channel | Single select | Yes | Email, SMS, Phone |
| subject | Single line text | No | Message summary |
| sent_at | Date & time | Yes | Timestamp |
| sent_by | Single line text | Yes | Operator name |
| status | Single select | Yes | Delivery status |
| notes | Long text | No | Additional context |

### PilotFeedback Schema (`seed-data/pilot-feedback-schema.csv`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user_id | Link | Yes | Link to Users table |
| cycle_id | Link | No | Link to Cycles table |
| garment_id | Link | No | Link to Garments table |
| feedback_type | Single select | Yes | Category |
| severity | Single select | Yes | Priority level |
| description | Long text | Yes | Detailed feedback |
| fit_rating | Rating | No | 1-5 stars |
| would_wear_again | Checkbox | No | Re-wear preference |
| operator_notes | Long text | No | Internal notes |
| action_taken | Long text | No | Resolution |
| reported_at | Date & time | Yes | Timestamp |
| reported_by | Single select | Yes | Source of feedback |
| resolved | Checkbox | No | Completion status |

---

## Next Steps

After Airtable setup:
1. Set up Retool pages (see `../retool/pilot-mvp/SETUP-GUIDE.md`)
2. Create email templates (see `../../pilot-ops/email-templates.md`)
3. Run through launch checklist (see `../../pilot-ops/launch-checklist.md`)
