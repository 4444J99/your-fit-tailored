# Email Templates: Pilot Communications

## Overview

These templates are used for manual email communications during the pilot. Each template maps to a `comm_type` in the CommunicationEvents table.

**Pilot Communication Principles** (from Constitution §6):
- Minimal cognitive load: Tell users only what they need to know
- Action-oriented: Clear next steps when action is required
- No action required when no action needed
- Friendly but concise

---

## Template 1: Box Shipping

**comm_type**: `BoxShipping`
**Trigger**: When box transitions to `Shipped`
**Action Required**: No

### Subject
```
Your [Project Name] box is on the way
```

### Body
```
Hi [First Name],

Your weekly box has shipped and is on its way!

📦 Expected delivery: [Day, Month Date]
📍 Tracking: [Tracking Number/Link]

What's inside:
- [Item 1 description]
- [Item 2 description]
- [Item 3 description]

No action needed—just keep an eye out for delivery.

Enjoy your week!
[Operator Name]
[Project Name] Team
```

---

## Template 2: Delivery Confirmed

**comm_type**: `DeliveryConfirmed`
**Trigger**: When delivery is confirmed (manual or carrier webhook)
**Action Required**: No

### Subject
```
Your box has arrived!
```

### Body
```
Hi [First Name],

Great news—your box has been delivered!

📅 Return window opens: [Date] (in [X] days)

Wear, enjoy, repeat. We'll remind you when it's time to return.

No action needed right now.

[Operator Name]
[Project Name] Team
```

---

## Template 3: Return Reminder (Day 1)

**comm_type**: `ReturnReminder1`
**Trigger**: ReturnReminder escalation_level = 1, scheduled_for reached
**Action Required**: Yes

### Subject
```
Time to return your [Project Name] box
```

### Body
```
Hi [First Name],

Your wear window has ended—time to return your box!

📦 Return by: [Date] (in 2 days)

How to return:
1. Place items in the same box they arrived in
2. Use the prepaid return label (inside the box)
3. Drop off at any [Carrier] location or schedule a pickup

Return locations near you: [Link to carrier locator]

Questions? Reply to this email.

Thanks!
[Operator Name]
[Project Name] Team
```

---

## Template 4: Return Reminder (Day 3 Overdue)

**comm_type**: `ReturnReminder2`
**Trigger**: ReturnReminder escalation_level = 2, scheduled_for reached
**Action Required**: Yes (Urgent)

### Subject
```
Reminder: Please return your box
```

### Body
```
Hi [First Name],

Your return is now [X] days overdue. Please return your box as soon as possible.

📦 Original return date: [Date]
⏰ Days overdue: [X]

If your return isn't received within [Y] days, your account will be placed on hold and your next box won't ship.

Need help?
- Lost your return label? Reply to this email
- Issue with the items? Let us know

Please return today if possible.

[Operator Name]
[Project Name] Team
```

---

## Template 5: Overdue Warning (Pre-Hold)

**comm_type**: `OverdueWarning`
**Trigger**: ReturnReminder escalation_level = 3, scheduled_for reached
**Action Required**: Yes (Critical)

### Subject
```
Action required: Your return is significantly overdue
```

### Body
```
Hi [First Name],

Your box is now [X] days overdue for return.

⚠️ Your account will be placed on hold tomorrow if we don't receive your return.

When your account is on hold:
- Your next box won't ship
- You'll need to return the current items or contact us to resolve

If there's an issue preventing your return, please reply to this email immediately so we can help.

Return instructions:
1. Pack items in the original box
2. Attach the prepaid return label
3. Drop off at any [Carrier] location today

[Operator Name]
[Project Name] Team
```

---

## Template 6: Hold Applied

**comm_type**: `HoldNotice`
**Trigger**: User transitions to `HoldLogistics`
**Action Required**: Yes (Critical)

### Subject
```
Your account is on hold
```

### Body
```
Hi [First Name],

Your [Project Name] account has been placed on hold because your return hasn't been received.

📦 Box due: [Original Date]
📅 Days overdue: [X]

What this means:
- Your weekly service is paused
- No new boxes will ship until this is resolved

To reactivate your account:
1. Return your current box immediately, OR
2. Contact us to discuss your options

We want to help you get back on track. Please reply to this email or call us at [Phone].

[Operator Name]
[Project Name] Team
```

---

## Template Variables

| Variable | Source | Example |
|----------|--------|---------|
| `[First Name]` | Users.display_name (first word) | "Alice" |
| `[Day, Month Date]` | Cycle.expected_delivery_date | "Tuesday, January 16" |
| `[Tracking Number/Link]` | Box.tracking_outbound | "1Z999AA10123456784" |
| `[Item N description]` | Garment.sku + size | "Navy Crew Neck (M)" |
| `[Date]` | Computed from cycle dates | "January 18" |
| `[X]` | Computed days_overdue | "5" |
| `[Carrier]` | Configuration or ShipmentBatch.carrier | "UPS" |
| `[Operator Name]` | Current operator | "Sarah" |
| `[Project Name]` | Configuration | "Your Fit" |
| `[Phone]` | Configuration | "(555) 123-4567" |

---

## Communication Guidelines

### Tone
- Friendly but professional
- Direct and clear
- No marketing language
- Empathetic when addressing issues

### Timing
- BoxShipping: Send same day as shipment
- DeliveryConfirmed: Send same day as delivery
- ReturnReminder1: Send day 1 of return window
- ReturnReminder2: Send day 3 overdue
- OverdueWarning: Send day 6 overdue (one day before hold)
- HoldNotice: Send when hold is applied (day 7+)

### Escalation Path
```
Day 0: Delivery confirmed (no action)
Day 5: Return window opens, Reminder 1 sent
Day 8: Reminder 2 sent (3 days overdue)
Day 11: Overdue Warning sent (6 days overdue)
Day 12: Hold applied, HoldNotice sent (7 days overdue)
Day 19: Loss declaration (14 days overdue)
```

### Do NOT Send
- Marketing messages during pilot
- Multiple communications on same day
- Communications to users on hold (except HoldNotice and resolution)
- Automated messages—pilot uses manual sending

---

## Logging Communications

After sending any communication:

1. Open CommunicationLog in Retool
2. Select the user
3. Select the cycle (if applicable)
4. Select the comm_type matching the template
5. Enter the subject line used
6. Click "Log as Sent"

This creates a record in CommunicationEvents for tracking and analysis.
