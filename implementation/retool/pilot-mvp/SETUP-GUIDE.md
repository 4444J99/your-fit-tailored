# Retool Setup Guide: Pilot MVP

## Prerequisites

- Retool apps from State Authority and Weekly Cycle Flow setup
- Airtable base with Pilot MVP tables created
- Email capability (manual for pilot, templates provided)

## Overview

This guide adds 8 pages to support the 25-user pilot:
- **UserOnboarding** - Register new pilot users
- **GarmentOnboarding** - Register new garments with barcodes
- **AllocationWorkbench** - Manual garment allocation for cycles
- **PilotDashboard** - Overview of pilot status and metrics
- **CommunicationLog** - Track all user communications
- **FeedbackCapture** - Log user feedback
- **DataExport** - Export pilot data for analysis
- **Enhanced ExceptionWorkflow** - Pilot-specific exception handling

---

## Page 1: UserOnboarding (YFT-AdminConsole)

### Purpose
Register new pilot users with all required information.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  User Onboarding                       Pilot: 23/25 users   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  New User Registration                                  ││
│  │  ─────────────────────────────────────────────────────  ││
│  │                                                         ││
│  │  Basic Information                                      ││
│  │  Name: [____________________]                          ││
│  │  Email: [____________________]                         ││
│  │  Phone: [____________________]                         ││
│  │                                                         ││
│  │  Shipping Address                                       ││
│  │  Address 1: [____________________]                     ││
│  │  Address 2: [____________________]                     ││
│  │  City: [__________]  State: [__]  ZIP: [_____]        ││
│  │                                                         ││
│  │  Subscription                                           ││
│  │  Weekly Anchor: [Monday ▼]  (delivery day preference)  ││
│  │  Payment Method: [____________] (reference only)       ││
│  │                                                         ││
│  │  ─────────────────────────────────────────────────────  ││
│  │                                                         ││
│  │  Fit Profile (Initial)                                  ││
│  │  Top Size: [M ▼]    Bottom Size: [32 ▼]               ││
│  │  Body Type: [Athletic ▼]                               ││
│  │  Style: [☑ Casual] [☐ Professional] [☑ Minimal]       ││
│  │  Colors: [☑ Neutrals] [☑ Darks] [☐ Brights]           ││
│  │  Notes: [________________________________]             ││
│  │                                                         ││
│  │  [Create User & Fit Profile]                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Recently Onboarded                                     ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Name           Joined      Anchor    First Cycle      ││
│  │  Alice Test     Jan 10      Monday    2024-W03 ✓      ││
│  │  Bob Test       Jan 11      Tuesday   2024-W03 ✓      ││
│  │  Carol Test     Jan 12      Wednesday Pending          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getPilotUserCount**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Users
// Filter: {operational_state} != 'Closed'
// Return: COUNT
```

**createUser**
```javascript
// Resource: YFT-Airtable
// Action: Create Record
// Table: Users
// Fields: Form values
```

**createFitProfile**
```javascript
// Resource: YFT-Airtable
// Action: Create Record
// Table: FitProfiles
// Fields: Fit form values + user_id link
// Run after createUser completes
```

**getRecentUsers**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Users
// Sort: created_at DESC
// Limit: 10
```

### Components

1. **pilotCapacityIndicator** (Text/Progress)
   - Value: `${getPilotUserCount.data.length} / 25 users`
   - Color: Green if < 25, red if >= 25

2. **userForm** (Form Container)
   - All user fields as inputs
   - Validation: Required fields, email format, ZIP format

3. **fitProfileSection** (Collapsible Container)
   - Size selectors
   - Style multi-select checkboxes
   - Color preference checkboxes
   - Notes textarea

4. **createButton** (Button)
   - Label: "Create User & Fit Profile"
   - Disabled if: Pilot at capacity (25 users)
   - On click:
     1. Run `createUser`
     2. On success, run `createFitProfile` with new user_id
     3. Show success notification
     4. Reset form

5. **recentUsersTable** (Table)
   - Data: `getRecentUsers.data`
   - Columns: display_name, created_at, weekly_anchor, first_cycle_status

---

## Page 2: GarmentOnboarding (YFT-WarehouseOps)

### Purpose
Register new garments with barcode scanning.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Garment Onboarding                    Inventory: 87 items  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Register New Garment                                   ││
│  │  ─────────────────────────────────────────────────────  ││
│  │                                                         ││
│  │  Barcode: [________________] [Generate]                ││
│  │                                                         ││
│  │  Product Info                                           ││
│  │  SKU: [____________]  (e.g., TOP-CREW-BLK)            ││
│  │  Category: [Top ▼]                                     ││
│  │  Size: [M ▼]      Color: [Black ▼]                    ││
│  │                                                         ││
│  │  Initial Condition                                      ││
│  │  Condition Grade: [A ▼]                                ││
│  │  Max Wear Limit: [50]                                  ││
│  │                                                         ││
│  │  [Register Garment]                                    ││
│  │                                                         ││
│  │  ✓ G001 registered  ✓ G002 registered                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Quick Entry Mode (Batch)                               ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  SKU Template: [TOP-CREW-BLK]  Size: [M]  Color: [BLK]││
│  │                                                         ││
│  │  Scan barcodes continuously:                           ││
│  │  [________________]  → Auto-registers with template    ││
│  │                                                         ││
│  │  Batch Progress: 12 registered this session           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Inventory Summary by Size                              ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Size  Tops  Bottoms  Dresses  Total  Available        ││
│  │  XS    5     3        2        10     8                ││
│  │  S     8     5        4        17     15               ││
│  │  M     12    8        6        26     22               ││
│  │  L     10    7        5        22     20               ││
│  │  XL    6     4        3        13     12               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**createGarment**
```javascript
// Resource: YFT-Airtable
// Action: Create Record
// Table: Garments
// Fields: {
//   "barcode": "{{barcodeInput.value}}",
//   "sku": "{{skuInput.value}}",
//   "category": "{{categorySelect.value}}",
//   "size": "{{sizeSelect.value}}",
//   "color": "{{colorSelect.value}}",
//   "condition_grade": "{{conditionSelect.value}}",
//   "max_wear_limit": {{maxWearInput.value}},
//   "asset_state": "Available",
//   "wear_count": 0,
//   "wash_count": 0,
//   "repair_count": 0
// }
```

**generateBarcode**
```javascript
// Transformer: Generate unique barcode
const prefix = 'YFT';
const timestamp = Date.now().toString(36).toUpperCase();
const random = Math.random().toString(36).substring(2, 6).toUpperCase();
return `${prefix}-${timestamp}-${random}`;
```

**getInventorySummary**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Garments
// Group by: size, category
// Aggregate: count total, count where asset_state = 'Available'
```

### Components

1. **barcodeInput** (Text Input)
   - Placeholder: "Scan or enter barcode"
   - On blur: Check for duplicates

2. **generateBarcodeButton** (Button)
   - On click: Set barcodeInput.value = generateBarcode transformer

3. **garmentForm** (Form Container)
   - SKU, Category, Size, Color selects
   - Condition grade selector
   - Max wear limit input (default: 50)

4. **registerButton** (Button)
   - On click: Run `createGarment`, show success, clear form

5. **quickEntryContainer** (Container)
   - Template fields for batch entry
   - Continuous scan mode
   - Session counter

6. **inventorySummaryTable** (Table)
   - Data: `getInventorySummary.data` (transformed)
   - Rows: Sizes, Columns: Categories

---

## Page 3: AllocationWorkbench (YFT-AdminConsole)

### Purpose
Manually allocate garments to cycles based on fit profiles.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Allocation Workbench                                        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌─────────────────────────────┐ │
│  │  Cycles to Allocate   │  │  User Fit Profile           │ │
│  │  ─────────────────    │  │  ─────────────────────────  │ │
│  │  ○ C-125 Alice (M)    │  │  Alice Test                 │ │
│  │  ● C-126 Bob (L)   ←  │  │  Top: M  Bottom: 32        │ │
│  │  ○ C-127 Carol (S)    │  │  Style: Casual, Minimal     │ │
│  │  ○ C-128 Dan (XL)     │  │  Colors: Neutrals, Darks   │ │
│  │                       │  │  Notes: "Prefers loose fit" │ │
│  └───────────────────────┘  └─────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Available Garments (filtered for Bob's fit)            ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  ☐ G012 TOP-CREW-NAV (L) Casual ★★★★☆               ││
│  │  ☐ G015 TOP-HENLEY-GRY (L) Casual ★★★★★             ││
│  │  ☐ G021 BTM-CHINO-KHK (34) Casual ★★★★☆             ││
│  │  ☐ G045 BTM-JEAN-BLU (34) Casual ★★★☆☆              ││
│  │  ☐ G067 DRS-POLO-BLK (L) Professional ★★★★☆         ││
│  │                                                         ││
│  │  [Show All] [Filter: Tops Only] [Filter: Bottoms Only] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Current Allocation for C-126 (Bob)                     ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Target: 3 items  |  Selected: 2 items                  ││
│  │                                                         ││
│  │  ✓ G015 TOP-HENLEY-GRY (L)                     [Remove]││
│  │  ✓ G021 BTM-CHINO-KHK (34)                     [Remove]││
│  │  + (need 1 more item)                                   ││
│  │                                                         ││
│  │  [Save Allocation] → Creates Box, reserves garments    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getCyclesToAllocate**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: AND(
//   {cycle_state} = 'Scheduled',
//   OR({box_id} = '', LEN({box_id}) = 0)
// )
// Sort: week_id ASC
```

**getUserFitProfile**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: FitProfiles
// Filter: {user_id} = '{{selectedCycle.user_id[0].id}}'
```

**getAvailableGarments**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Garments
// Filter: {asset_state} = 'Available'
// Additional filter based on fit profile (in transformer)
```

**filterGarmentsForFit**
```javascript
// Transformer: Score and filter garments for user's fit
const profile = getUserFitProfile.data[0];
const garments = getAvailableGarments.data;

return garments
  .map(g => {
    let score = 0;

    // Size match
    if (g.size === profile.top_size && g.category === 'Top') score += 3;
    if (g.size === profile.bottom_size && g.category === 'Bottom') score += 3;

    // Style match
    const styles = profile.style_preference || [];
    // ... style matching logic

    // Color match
    const colors = profile.color_preference || [];
    const avoidColors = profile.avoid_colors || [];
    // ... color matching logic

    return { ...g, fitScore: score };
  })
  .filter(g => g.fitScore > 0)
  .sort((a, b) => b.fitScore - a.fitScore);
```

**saveAllocation**
```javascript
// Transformer that:
// 1. Creates Box record with planned_contents
// 2. Links Box to Cycle
// 3. Updates Cycle with box_id
```

### Components

1. **cyclesToAllocateList** (List)
   - Data: `getCyclesToAllocate.data`
   - Display: User name, sizes
   - Selection: single

2. **fitProfileCard** (Container)
   - Show when: Cycle selected
   - Display all fit profile fields

3. **availableGarmentsTable** (Table)
   - Data: `filterGarmentsForFit`
   - Columns: barcode, sku, size, style (inferred), fit score (stars)
   - Multi-select checkbox

4. **categoryFilterButtons** (Button Group)
   - "All", "Tops Only", "Bottoms Only", "Dresses Only"

5. **allocationSummary** (Container)
   - Target item count (configurable, default: 3)
   - Selected items list with remove buttons

6. **saveAllocationButton** (Button)
   - Disabled if: Selected count < target
   - On click: Run `saveAllocation`

---

## Page 4: PilotDashboard (YFT-AdminConsole)

### Purpose
Overview of pilot status, health metrics, and KPIs.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Pilot Dashboard                         Week: 2024-W03     │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┬───────────┬───────────┬───────────┐          │
│  │  Users    │  Inventory│  Cycles   │  Returns  │          │
│  │  ───────  │  ───────  │  ───────  │  ───────  │          │
│  │  23/25    │  87 total │  18 active│  3 overdue│          │
│  │  Active   │  72 avail │  this week│  ⚠        │          │
│  └───────────┴───────────┴───────────┴───────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  This Week's Cycles                                     ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  ████████████████████████░░░░░░                          ││
│  │  Scheduled: 3 | Committed: 5 | Shipped: 8 | Delivered: 2││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌───────────────────────┐  ┌─────────────────────────────┐ │
│  │  Attention Needed     │  │  Recent Activity            │ │
│  │  ─────────────────    │  │  ─────────────────────────  │ │
│  │  ⚠ 3 overdue returns  │  │  10:32 Box received (Bob)   │ │
│  │  ⚠ 2 users on hold    │  │  10:15 Cycle shipped (Eve)  │ │
│  │  ⚠ 1 unresolved issue │  │  09:45 User onboarded       │ │
│  │                       │  │  09:30 Feedback logged      │ │
│  │  [View Exceptions]    │  │  09:00 Scheduling ran ✓     │ │
│  └───────────────────────┘  └─────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Pilot KPIs (Week to Date)                              ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Metric                    Value    Target   Status     ││
│  │  Cycle Completion Rate     94%      95%      🟡         ││
│  │  On-Time Delivery          92%      90%      🟢         ││
│  │  Return Compliance         88%      90%      🟡         ││
│  │  Fit Satisfaction          4.2/5    4.0/5    🟢         ││
│  │  Exception Rate            6%       10%      🟢         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getPilotStats**
```javascript
// Multiple queries or a transformer that computes:
// - Active users count
// - Available inventory count
// - Active cycles count
// - Overdue returns count
```

**getThisWeekCycles**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Filter: {week_id} = '{{currentWeekId}}'
// Group by: cycle_state
```

**getRecentEvents**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Events
// Sort: timestamp DESC
// Limit: 20
```

**getAttentionItems**
```javascript
// Transformer combining:
// - Overdue returns (from Cycles)
// - Users on hold (from Users)
// - Unresolved feedback (from PilotFeedback)
```

**getPilotKPIs**
```javascript
// Transformer computing:
// - Cycle completion rate = closed cycles / total cycles
// - On-time delivery = on-time / total delivered
// - Return compliance = returned on time / total returns due
// - Fit satisfaction = avg fit_rating from PilotFeedback
// - Exception rate = cycles with exceptions / total cycles
```

### Components

1. **statCards** (Container with 4 cards)
   - Users, Inventory, Cycles, Returns
   - Color coding for status

2. **cycleProgressBar** (Stacked Progress)
   - Segments for each cycle state
   - Counts below

3. **attentionList** (List)
   - Data: `getAttentionItems`
   - Priority indicators
   - Link to relevant page

4. **activityFeed** (List)
   - Data: `getRecentEvents.data` (formatted)
   - Timestamp, description

5. **kpiTable** (Table)
   - Data: `getPilotKPIs`
   - Columns: Metric, Value, Target, Status indicator

---

## Page 5: CommunicationLog (YFT-AdminConsole)

### Purpose
Track and log all user communications.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Communication Log                       [+ Log New]        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Filter: [All Types ▼] [All Users ▼] [This Week ▼]     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Communications (47 total)                              ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Date       User         Type              Status       ││
│  │  Jan 15     Alice Test   BoxShipping       ✓ Sent      ││
│  │  Jan 15     Bob Test     ReturnReminder1   ✓ Sent      ││
│  │  Jan 14     Carol Test   OverdueWarning    ✓ Sent      ││
│  │  Jan 14     Dan Test     DeliveryConfirmed ✓ Sent      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Log New Communication                                  ││
│  │  ──────────────────────────────────────────────────────│││
│  │  User: [Select User ▼]                                 │ │
│  │  Cycle: [Select Cycle ▼] (optional)                    │ │
│  │  Type: [BoxShipping ▼]                                 │ │
│  │  Channel: [Email ▼]                                    │ │
│  │  Subject: [________________________________]           │ │
│  │  Notes: [________________________________]             │ │
│  │                                                         │ │
│  │  [Log as Sent]                                         │ │
│  │                                                         │ │
│  │  💡 Use email templates: [View Templates]              │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getCommunications**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: CommunicationEvents
// Filter: Based on filter selections
// Sort: sent_at DESC
```

**logCommunication**
```javascript
// Resource: YFT-Airtable
// Action: Create Record
// Table: CommunicationEvents
// Fields: Form values + sent_at = NOW(), sent_by = current operator
```

### Components

1. **filterBar** (Container)
   - Type filter (comm_type options)
   - User filter
   - Date range filter

2. **communicationsTable** (Table)
   - Data: `getCommunications.data`
   - Columns: sent_at, user_name, comm_type, channel, status

3. **logForm** (Form Container)
   - User selector
   - Cycle selector (optional, filtered by user)
   - Type selector
   - Channel selector
   - Subject input
   - Notes textarea

4. **logButton** (Button)
   - On click: Run `logCommunication`, clear form

5. **templatesLink** (Link/Button)
   - Opens email templates reference (modal or new tab)

---

## Page 6: FeedbackCapture (YFT-AdminConsole)

### Purpose
Log and manage user feedback and fit observations.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Feedback & Observations                [+ New Feedback]    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Unresolved Feedback (5)                                ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Sev  User        Type          Description             ││
│  │  🔴   Carol Test  FitIssue      "Pants too tight"       ││
│  │  🟡   Bob Test    StyleFeedback "More casual options"   ││
│  │  🟢   Alice Test  Positive      "Love the quality!"     ││
│  │  🟡   Dan Test    Suggestion    "Earlier delivery"      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Selected: Carol Test - Fit Issue                       ││
│  │  ──────────────────────────────────────────────────────│││
│  │  Reported: Jan 14  |  Cycle: C-120  |  Garment: G021   │ │
│  │                                                         │ │
│  │  Description: "The pants (G021) were too tight in the  │ │
│  │  waist. I usually wear 32 but these felt like 30."     │ │
│  │                                                         │ │
│  │  Fit Rating: ★★☆☆☆ (2/5)                              │ │
│  │  Would Wear Again: No                                   │ │
│  │                                                         │ │
│  │  Operator Notes: [_____________________________]        │ │
│  │  Action Taken: [_____________________________]          │ │
│  │                                                         │ │
│  │  [Update Fit Profile]  [Flag Garment]  [Mark Resolved] │ │
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Log New Feedback                                       ││
│  │  ──────────────────────────────────────────────────────│││
│  │  User: [Select ▼]  Cycle: [Select ▼]  Garment: [▼]    │ │
│  │  Type: [FitIssue ▼]  Severity: [Medium ▼]             │ │
│  │  Fit Rating: [★★★☆☆]                                  │ │
│  │  Would Wear Again: [☐]                                 │ │
│  │  Description: [________________________________]       │ │
│  │  [Submit Feedback]                                     │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**getUnresolvedFeedback**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: PilotFeedback
// Filter: {resolved} = FALSE
// Sort: severity DESC, reported_at ASC
```

**createFeedback**
```javascript
// Resource: YFT-Airtable
// Action: Create Record
// Table: PilotFeedback
// Fields: Form values + reported_at = NOW()
```

**resolveFeedback**
```javascript
// Resource: YFT-Airtable
// Action: Update Record
// Table: PilotFeedback
// Fields: {
//   "resolved": true,
//   "resolved_at": NOW(),
//   "operator_notes": "{{notesInput.value}}",
//   "action_taken": "{{actionInput.value}}"
// }
```

### Components

1. **unresolvedTable** (Table)
   - Data: `getUnresolvedFeedback.data`
   - Columns: severity (icon), user, type, description (truncated)
   - Row selection: single

2. **feedbackDetailContainer** (Container)
   - Full feedback details
   - Operator notes input
   - Action taken input

3. **actionButtons** (Button Group)
   - "Update Fit Profile" → Opens UserManager with fit profile edit
   - "Flag Garment" → Adds note to garment
   - "Mark Resolved" → Run `resolveFeedback`

4. **newFeedbackForm** (Form Container)
   - All feedback fields
   - Star rating component for fit_rating

---

## Page 7: DataExport (YFT-AdminConsole)

### Purpose
Export pilot data for analysis.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Data Export                                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Export Options                                         ││
│  │  ─────────────────────────────────────────────────────  ││
│  │                                                         ││
│  │  Date Range: [Jan 1] to [Jan 31]                       ││
│  │                                                         ││
│  │  Data Sets to Export:                                   ││
│  │  ☑ Users (with fit profiles)                           ││
│  │  ☑ Cycles (all states)                                 ││
│  │  ☑ Garments (with utilization)                         ││
│  │  ☑ Events (state changes)                              ││
│  │  ☑ Feedback                                            ││
│  │  ☑ Communications                                       ││
│  │                                                         ││
│  │  Format: [CSV ▼]                                       ││
│  │                                                         ││
│  │  [Generate Export]                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Quick Reports                                          ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  [Cycle Summary] [Utilization Report] [Fit Analysis]   ││
│  │  [Exception Report] [KPI Dashboard Export]             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Generated Files                                        ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  pilot-export-2024-01-15-cycles.csv        [Download]  ││
│  │  pilot-export-2024-01-15-users.csv         [Download]  ││
│  │  pilot-export-2024-01-15-feedback.csv      [Download]  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Queries

**exportUsers**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Users
// Join with FitProfiles
// Format for CSV
```

**exportCycles**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Cycles
// Include computed fields (durations, etc.)
```

**exportGarments**
```javascript
// Resource: YFT-Airtable
// Action: List Records
// Table: Garments
// Compute utilization metrics
```

### Components

1. **dateRangePicker** (Date Range)
   - Start and end date

2. **datasetCheckboxes** (Checkbox Group)
   - Select which tables to export

3. **formatSelector** (Select)
   - CSV, JSON options

4. **generateExportButton** (Button)
   - On click: Run selected export queries
   - Generate downloadable files

5. **quickReportButtons** (Button Group)
   - Pre-configured report exports

6. **generatedFilesList** (List)
   - Show recent exports with download links

---

## Page 8: Enhanced ExceptionWorkflow

See Weekly Cycle Flow guide for base ExceptionWorkflow. Add these pilot-specific enhancements:

### Additional Pilot Features

1. **Feedback Integration**
   - Show related feedback for user/cycle
   - Quick "Log Feedback" button

2. **Communication History**
   - Show all communications sent to user
   - "Send Communication" button

3. **Fit Profile Update**
   - When resolving fit issues, option to update profile

4. **Pilot-Specific Resolutions**
   - "Skip Next Cycle" - Give user a week off
   - "Swap Inventory" - Replace garments with better fit
   - "Refund Credit" - Issue pilot credit

---

## Verification Checklist

After completing setup:

- [ ] UserOnboarding creates user + fit profile
- [ ] GarmentOnboarding registers garments with barcodes
- [ ] AllocationWorkbench filters by fit and saves allocations
- [ ] PilotDashboard shows all KPIs correctly
- [ ] CommunicationLog tracks all communications
- [ ] FeedbackCapture logs and resolves feedback
- [ ] DataExport generates downloadable files
- [ ] ExceptionWorkflow has pilot-specific options

---

## Navigation Structure

```
YFT-AdminConsole
├── Dashboard (State Authority)
├── PilotDashboard (NEW)
├── UserManager (State Authority)
├── UserOnboarding (NEW)
├── CycleManager (State Authority)
├── AllocationWorkbench (NEW)
├── SchedulingMonitor (Weekly Cycle Flow)
├── CommitmentMonitor (Weekly Cycle Flow)
├── ExceptionWorkflow (Weekly Cycle Flow + Pilot enhancements)
├── CommunicationLog (NEW)
├── FeedbackCapture (NEW)
├── EventViewer (State Authority)
└── DataExport (NEW)

YFT-WarehouseOps
├── GarmentScanner (State Authority)
├── GarmentOnboarding (NEW)
├── BoxPacker (State Authority)
├── FulfillmentQueue (Weekly Cycle Flow)
├── ShipmentDashboard (Weekly Cycle Flow)
├── ReceivingStation (Weekly Cycle Flow)
└── InspectionStation (Weekly Cycle Flow)
```
