# Standard Operating Procedures: Pilot Operations

## Overview

These SOPs define the daily, weekly, and as-needed procedures for operating the 25-user pilot. Each procedure includes the trigger, steps, and expected outcome.

---

## Daily Procedures

### SOP-D1: Morning Operations Review

**When**: Every morning at 8:00 AM
**Who**: Operations Lead
**Duration**: 15 minutes

**Steps**:

1. Open PilotDashboard in YFT-AdminConsole
2. Review attention items:
   - [ ] Check overdue returns count
   - [ ] Check users on hold count
   - [ ] Check unresolved feedback count
3. Review this week's cycle progress
4. Note any items requiring immediate action
5. Review automation results:
   - [ ] Open SchedulingMonitor—verify Sunday job succeeded
   - [ ] Open CommitmentMonitor—verify morning commitment succeeded
6. Document any issues in daily log

**Expected Outcome**: Clear picture of system health, action items identified

---

### SOP-D2: Fulfillment Processing

**When**: Daily at 9:00 AM (after commitment runs)
**Who**: Warehouse Operator
**Duration**: Variable (based on volume)

**Steps**:

1. Open FulfillmentQueue in YFT-WarehouseOps
2. Review boxes ready for fulfillment, sorted by ship date
3. For each box with today's ship date:
   a. Click to view box details
   b. Verify garments are available
   c. Click "Start Packing"
   d. Complete BoxPacker workflow:
      - [ ] Scan each garment barcode
      - [ ] Verify all items match plan
      - [ ] Handle any variance
      - [ ] Click "Verify Pack"
4. When all boxes packed, proceed to ShipmentDashboard

**Expected Outcome**: All today's boxes packed and verified

---

### SOP-D3: Shipment Processing

**When**: Daily at 11:00 AM (before carrier pickup)
**Who**: Warehouse Operator
**Duration**: 30 minutes

**Steps**:

1. Open ShipmentDashboard in YFT-WarehouseOps
2. Review boxes ready to ship
3. For each box:
   a. Generate or retrieve tracking number from carrier
   b. Enter tracking number in dashboard
   c. Apply shipping label to box
4. Select all boxes with tracking numbers
5. Click "Ship Selected"
6. Verify boxes transition to `Shipped`
7. Hand off boxes to carrier at pickup time

**Post-Shipment**:
1. Open CommunicationLog
2. For each shipped box:
   a. Send BoxShipping email using template
   b. Log communication as sent

**Expected Outcome**: All boxes shipped, customers notified

---

### SOP-D4: Return Processing

**When**: When returns arrive (typically daily)
**Who**: Warehouse Operator
**Duration**: Variable

**Steps**:

1. Open ReceivingStation in YFT-WarehouseOps
2. For each returned box:
   a. Scan box barcode
   b. Verify box received in system
   c. Unpack contents
   d. Verify contents match expected
   e. Document any variance
3. For each received box, open InspectionStation:
   a. Inspect each garment
   b. Grade condition (A/B/C/D/F)
   c. Select routing (Refurbish/Repair/Quarantine/Retired)
   d. Add notes if needed
   e. Save inspection
4. When all garments inspected:
   a. Click "Complete Closeout"
   b. Verify cycle closed

**Expected Outcome**: Returns processed, garments routed, cycles closed

---

### SOP-D5: Communication Sending

**When**: Daily at 10:00 AM
**Who**: Operations Lead
**Duration**: 15-30 minutes

**Steps**:

1. Open ReturnReminders view in Airtable (or Retool query)
2. Filter for `status = 'Pending'` and `scheduled_for <= TODAY`
3. For each pending reminder:
   a. Look up user email
   b. Select appropriate email template based on `escalation_level`:
      - Level 1: ReturnReminder1 template
      - Level 2: ReturnReminder2 template
      - Level 3: OverdueWarning template
   c. Send email manually
   d. Update reminder status to `Sent`
   e. Log in CommunicationLog

4. Check for any new HoldLogistics users
5. Send HoldNotice to newly held users
6. Log all communications

**Expected Outcome**: All due reminders sent and logged

---

### SOP-D6: Exception Review

**When**: Daily at 4:00 PM
**Who**: Operations Lead
**Duration**: 15 minutes

**Steps**:

1. Open ExceptionWorkflow in YFT-AdminConsole
2. Review all active exceptions
3. For each exception, determine resolution path:
   - **Overdue 1-3 days**: Monitor, reminder sent
   - **Overdue 4-6 days**: Contact user directly (phone/email)
   - **Overdue 7+ days**: Verify hold applied, escalate if needed
   - **Missing items**: Investigate, update settlement
   - **User complaint**: Review and respond
4. Document actions taken
5. Escalate critical issues to management

**Expected Outcome**: All exceptions reviewed, actions documented

---

## Weekly Procedures

### SOP-W1: Pre-Scheduling Review (Saturday)

**When**: Saturday afternoon
**Who**: Operations Lead
**Duration**: 30 minutes

**Steps**:

1. Review current week's cycle completion
2. Check inventory levels:
   - [ ] Sufficient Available garments by size?
   - [ ] Any sizes critically low?
3. Review user states:
   - [ ] How many Active users?
   - [ ] Any users to be removed from hold?
4. Plan any inventory adjustments
5. Document readiness for Sunday scheduling

**Expected Outcome**: Confidence that scheduling will succeed

---

### SOP-W2: Post-Scheduling Verification (Sunday Evening)

**When**: Sunday at 7:00 PM (after 6 PM automation)
**Who**: Operations Lead
**Duration**: 15 minutes

**Steps**:

1. Open SchedulingMonitor
2. Verify latest job completed successfully
3. Check results:
   - [ ] Cycles created matches Active user count
   - [ ] No errors logged
4. If job failed:
   - [ ] Review error details
   - [ ] Manually create cycles if needed
   - [ ] Document issue

**Expected Outcome**: All users have cycles scheduled for next week

---

### SOP-W3: Weekly Allocation (Sunday Evening or Monday Morning)

**When**: After scheduling, before commitment deadline
**Who**: Operations Lead
**Duration**: 1-2 hours

**Steps**:

1. Open AllocationWorkbench
2. For each scheduled cycle without a box:
   a. Select the cycle
   b. Review user's fit profile
   c. Review suggested garments
   d. Select 3 appropriate items
   e. Save allocation
3. Verify all cycles have boxes
4. Review allocation summary:
   - [ ] Any sizes over-allocated?
   - [ ] Any users without allocations?

**Expected Outcome**: All scheduled cycles have garments allocated

---

### SOP-W4: Weekly KPI Review (Friday)

**When**: Friday afternoon
**Who**: Operations Lead
**Duration**: 30 minutes

**Steps**:

1. Open PilotDashboard
2. Review weekly KPIs:
   - [ ] Cycle completion rate
   - [ ] On-time delivery rate
   - [ ] Return compliance rate
   - [ ] Fit satisfaction score
   - [ ] Exception rate
3. Compare against targets:
   | Metric | Target | Actual | Status |
   |--------|--------|--------|--------|
   | Completion | 95% | | |
   | On-time | 90% | | |
   | Returns | 90% | | |
   | Fit | 80% | | |
   | Exceptions | <10% | | |
4. Document weekly summary
5. Identify improvement areas

**Expected Outcome**: Weekly performance documented, improvements identified

---

### SOP-W5: Weekly Data Export (Friday)

**When**: Friday afternoon
**Who**: Operations Lead
**Duration**: 15 minutes

**Steps**:

1. Open DataExport in YFT-AdminConsole
2. Set date range for the week
3. Select all data sets
4. Generate export
5. Download files
6. Store in designated folder:
   - `/pilot-data/exports/week-NN/`
7. Verify files contain expected data

**Expected Outcome**: Weekly data archived for analysis

---

## As-Needed Procedures

### SOP-A1: User Onboarding

**When**: New pilot user signs up
**Who**: Operations Lead
**Duration**: 15 minutes

**Prerequisites**: Pilot capacity not reached (< 25 users)

**Steps**:

1. Collect user information:
   - [ ] Name
   - [ ] Email
   - [ ] Phone
   - [ ] Shipping address
   - [ ] Fit information
2. Open UserOnboarding in YFT-AdminConsole
3. Enter all user information
4. Enter fit profile information
5. Click "Create User & Fit Profile"
6. Verify user created in `Active` state
7. Send welcome communication (manual)
8. Log communication

**Expected Outcome**: User ready for first cycle

---

### SOP-A2: Garment Onboarding

**When**: New inventory arrives
**Who**: Warehouse Operator
**Duration**: Variable

**Steps**:

1. Unpack new garments
2. Generate or assign barcodes:
   - Use barcode generator in GarmentOnboarding
   - Apply barcode label to garment
3. Open GarmentOnboarding
4. For each garment:
   a. Scan barcode
   b. Enter SKU, category, size, color
   c. Set condition grade (A for new)
   d. Click "Register Garment"
5. Verify garments appear in Available inventory

**Expected Outcome**: New inventory tracked and available

---

### SOP-A3: Hold Resolution

**When**: User contacts support about hold
**Who**: Operations Lead
**Duration**: 15-30 minutes

**Steps**:

1. Look up user in UserManager
2. Review hold reason:
   - HoldLogistics: Late return
   - HoldPayment: Payment failed
   - HoldIdentity: Verification needed
3. For HoldLogistics:
   a. Confirm return status with user
   b. If returning today: Wait for receipt, then remove hold
   c. If can't return: Discuss options (charge for items, etc.)
4. For HoldPayment:
   a. Verify payment resolved
   b. If resolved: Remove hold
   c. If not: Assist user with payment
5. Document resolution in user notes
6. If removing hold:
   a. Transition user to `Active`
   b. Verify next cycle can be scheduled

**Expected Outcome**: Hold resolved, user reactivated or closed

---

### SOP-A4: Feedback Response

**When**: User provides feedback or complaint
**Who**: Operations Lead
**Duration**: 15-30 minutes

**Steps**:

1. Log feedback in FeedbackCapture
2. Assess severity:
   - Critical: Product safety, major service failure
   - High: Significant fit issue, multiple complaints
   - Medium: Single fit issue, minor complaint
   - Low: Suggestion, positive feedback
3. For Critical/High:
   a. Contact user directly within 24 hours
   b. Determine resolution
   c. Implement fix
   d. Document actions
4. For Medium/Low:
   a. Acknowledge receipt (if user expects response)
   b. Queue for weekly review
5. If fit issue:
   a. Update user's fit profile
   b. Flag garment if issue is garment-specific
6. Mark feedback as resolved when complete

**Expected Outcome**: Feedback addressed, improvements captured

---

### SOP-A5: Inventory Issue Resolution

**When**: Garment damaged, lost, or retired
**Who**: Warehouse Operator
**Duration**: 10 minutes

**Steps**:

1. Identify issue type:
   - **Damaged**: Found during inspection
   - **Lost**: Never returned after 14 days
   - **Retired**: Lifecycle limit reached
2. Open GarmentScanner
3. Scan garment barcode
4. Transition to appropriate state:
   - Damaged → Repair or Quarantine
   - Lost → Lost (via automation or manual)
   - Retired → Retired
5. Add notes explaining reason
6. Review inventory levels:
   - [ ] Is size band still adequate?
   - [ ] Need to order replacements?

**Expected Outcome**: Inventory accurately tracked, gaps identified

---

### SOP-A6: System Issue Escalation

**When**: Technical issue prevents normal operation
**Who**: Operations Lead
**Duration**: Variable

**Steps**:

1. Document the issue:
   - What were you trying to do?
   - What error occurred?
   - What time did it happen?
2. Attempt basic troubleshooting:
   - [ ] Refresh the page
   - [ ] Try a different browser
   - [ ] Check Airtable directly
3. If issue persists:
   a. Document in incident log
   b. Implement manual workaround if possible
   c. Notify technical lead
4. Track resolution
5. Update SOPs if process change needed

**Expected Outcome**: Issue resolved or escalated, operations continue

---

## Emergency Procedures

### SOP-E1: System Down

**Steps**:
1. Switch to manual tracking (spreadsheet backup)
2. Continue physical operations (packing, receiving)
3. Log all actions in backup spreadsheet
4. Notify all operators of manual mode
5. When system restored, reconcile data

### SOP-E2: Carrier Failure

**Steps**:
1. Hold shipments until carrier issue resolved
2. Notify affected users of delay
3. Update cycle expected dates
4. Resume normal operations when carrier available

### SOP-E3: Data Loss

**Steps**:
1. Stop all operations immediately
2. Notify technical lead
3. Do not attempt to recreate data without guidance
4. Use latest export for reference
5. Follow data recovery procedure

---

## Appendix: Quick Reference

### State Transitions Summary

| From State | Trigger | To State |
|------------|---------|----------|
| User.Active | Payment fails | HoldPayment |
| User.Active | Return overdue 7+ days | HoldLogistics |
| User.Hold* | Issue resolved | Active |
| Cycle.Scheduled | Commitment deadline | Committed |
| Cycle.Committed | Packing starts | FulfillmentInProgress |
| Cycle.FulfillmentInProgress | Box shipped | OutboundInTransit |
| Cycle.OutboundInTransit | Delivery confirmed | Delivered |
| Cycle.Delivered | Automatic | WearWindowOpen |
| Cycle.WearWindowOpen | 5 days elapsed | ReturnWindowOpen |
| Cycle.ReturnWindowOpen | Return received | CloseoutInspection |
| Cycle.CloseoutInspection | All inspected | Settled |
| Cycle.Settled | Settlement complete | Closed |
| Garment.Available | Committed to cycle | Reserved |
| Garment.Reserved | Packed in box | Packed |
| Garment.Packed | Box delivered | InUse |
| Garment.InUse | Return received | ReceivedReturn |
| Garment.ReceivedReturn | Inspection complete | Refurbish/Repair/Quarantine/Retired |
| Garment.Refurbish | Cleaning complete | Available |

### Contact Information

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Operations Lead | | | |
| Technical Lead | | | |
| Product Owner | | | |

### Tool Access

| Tool | URL |
|------|-----|
| YFT-AdminConsole | [Retool URL] |
| YFT-WarehouseOps | [Retool URL] |
| Airtable Base | [Airtable URL] |
| Carrier Portal | [Carrier URL] |
