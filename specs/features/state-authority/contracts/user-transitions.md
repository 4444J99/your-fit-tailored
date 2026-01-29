# User State Transitions

**Entity**: UserEntity
**States**: Active, Paused, HoldPayment, HoldIdentity, HoldLogistics, Closed

## State Diagram

```
                    ┌─────────────────────────────┐
                    │         Onboarding          │
                    │    (pre-subscription)       │
                    └─────────────┬───────────────┘
                                  │ activate
                                  ▼
                    ┌─────────────────────────────┐
        ┌──────────▶│           Active            │◀──────────┐
        │           │   (cycles can be scheduled) │           │
        │           └───┬───────┬───────┬─────────┘           │
        │               │       │       │                     │
        │               │       │       │                     │
        │  restore      │       │       │           restore   │
        │  payment      │       │       │           logistics │
        │               │       │       │                     │
        │    ┌──────────┘       │       └──────────┐          │
        │    │ payment          │ pause            │late      │
        │    │ failure          │                  │return    │
        │    ▼                  ▼                  ▼          │
┌───────┴────────┐    ┌─────────────┐    ┌────────────────┐   │
│  HoldPayment   │    │   Paused    │    │  HoldLogistics │───┘
│                │    │             │    │                │
└────────────────┘    └──────┬──────┘    └────────────────┘
                             │
                             │ resume
                             │
                    ┌────────▼────────┐
                    │     Active      │
                    └─────────────────┘

Special transitions (from any operational state):
- Identity verification required → HoldIdentity
- Contract termination → Closed

┌────────────────┐
│  HoldIdentity  │ ◄── verification required (any state)
└───────┬────────┘
        │ verify
        ▼
    (previous state)

┌────────────────┐
│     Closed     │ ◄── contract terminated (any state)
└────────────────┘
    (terminal)
```

## Transition Contracts

### T-U001: (Onboarding) → Active

**Trigger**: User completes subscription signup.

**Preconditions**:
- User record created with required fields
- Payment method validated
- Shipping address validated
- Terms accepted

**Actions**:
1. Set `user.operational_state = 'Active'`
2. Set `user.weekly_anchor` based on preference
3. Emit event: `UserActivated`
4. Schedule first cycle

**Postconditions**:
- User is eligible for cycle scheduling
- First cycle will be created for next available week

**Error Codes**:
- `E020` - Missing required fields
- `E021` - Invalid payment method
- `E022` - Invalid shipping address

---

### T-U002: Active → Paused

**Trigger**: User requests subscription pause.

**Preconditions**:
- `user.operational_state == 'Active'`
- No cycle in `Committed` through `ReturnWindowOpen` states (or garments in user custody)
- Pause reason provided

**Actions**:
1. Set `user.operational_state = 'Paused'`
2. Cancel any `Scheduled` cycles
3. Emit event: `UserPaused` with `reason`, `expected_resume_date`

**Postconditions**:
- No new cycles will be scheduled
- Existing state preserved
- User can resume at any time

**Error Codes**:
- `E023` - Active cycle in progress
- `E024` - Garments in user custody

---

### T-U003: Paused → Active

**Trigger**: User requests resume.

**Preconditions**:
- `user.operational_state == 'Paused'`
- Payment method still valid
- Shipping address still valid

**Actions**:
1. Set `user.operational_state = 'Active'`
2. Emit event: `UserResumed`
3. Schedule next cycle for upcoming week

**Postconditions**:
- User is eligible for cycle scheduling
- Normal operations resume

**Error Codes**:
- `E025` - Payment method invalid
- `E026` - Shipping address invalid

---

### T-U004: Active → HoldPayment

**Trigger**: Payment failure detected.

**Preconditions**:
- `user.operational_state == 'Active'`
- Payment authorization failed OR payment declined

**Actions**:
1. Set `user.operational_state = 'HoldPayment'`
2. Block any `Scheduled` cycles from committing
3. Emit event: `UserPaymentHold` with `reason`
4. Notify user of payment issue

**Postconditions**:
- No new cycles can commit
- Existing in-progress cycles continue
- User must resolve payment to continue

**Error Codes**:
- None (system-initiated)

---

### T-U005: HoldPayment → Active

**Trigger**: Payment issue resolved.

**Preconditions**:
- `user.operational_state == 'HoldPayment'`
- New payment method validated OR existing method retry successful

**Actions**:
1. Set `user.operational_state = 'Active'`
2. Emit event: `UserPaymentRestored`
3. Re-evaluate any blocked cycles

**Postconditions**:
- Normal operations resume
- Blocked cycles can proceed to commitment

---

### T-U006: Active → HoldLogistics

**Trigger**: Late return exceeds threshold.

**Preconditions**:
- `user.operational_state == 'Active'`
- Cycle in `ReturnWindowOpen` state for > 7 days (configurable)
- Garments still in user custody

**Actions**:
1. Set `user.operational_state = 'HoldLogistics'`
2. Block any `Scheduled` cycles from committing
3. Emit event: `UserLogisticsHold` with `overdue_cycle_id`
4. Escalate reminders

**Postconditions**:
- No new shipments until return resolved
- Prevents unbounded inventory exposure

**Error Codes**:
- None (system-initiated)

---

### T-U007: HoldLogistics → Active

**Trigger**: Overdue return received.

**Preconditions**:
- `user.operational_state == 'HoldLogistics'`
- All overdue cycles have transitioned to `CloseoutInspection` or beyond

**Actions**:
1. Set `user.operational_state = 'Active'`
2. Emit event: `UserLogisticsRestored`
3. Re-evaluate blocked cycles

**Postconditions**:
- Normal operations resume
- May have late fees applied

---

### T-U008: Any → HoldIdentity

**Trigger**: Identity verification required (fraud signal, address change to high-risk area, etc.).

**Preconditions**:
- Verification trigger detected
- User in any operational state except `Closed`

**Actions**:
1. Store `previous_state = user.operational_state`
2. Set `user.operational_state = 'HoldIdentity'`
3. Block any active operations
4. Emit event: `UserIdentityHold` with `trigger_reason`
5. Request verification from user

**Postconditions**:
- All operations blocked
- User must complete verification

---

### T-U009: HoldIdentity → (Previous State)

**Trigger**: Identity verification successful.

**Preconditions**:
- `user.operational_state == 'HoldIdentity'`
- Verification completed successfully

**Actions**:
1. Set `user.operational_state = user.previous_state` (stored at T-U008)
2. Emit event: `UserIdentityVerified`
3. Resume normal operations

**Postconditions**:
- User returns to state before hold

---

### T-U010: Any → Closed

**Trigger**: Contract termination.

**Preconditions**:
- Termination requested (user or platform)
- All garments returned OR declared Lost with settlement
- All financial obligations settled

**Actions**:
1. Set `user.operational_state = 'Closed'`
2. Cancel any `Scheduled` cycles
3. Close any open cycles with settlement
4. Emit event: `UserClosed` with `reason`
5. Archive user data per retention policy

**Postconditions**:
- User cannot be reactivated without new signup
- Historical data preserved for audit
- All garments accounted for

**Error Codes**:
- `E027` - Garments still in custody
- `E028` - Outstanding balance

---

## Hold Priority

When multiple hold conditions exist simultaneously:

1. **HoldIdentity** (highest priority) - Security concern
2. **HoldPayment** - Financial risk
3. **HoldLogistics** - Inventory exposure

User cannot transition to Active until ALL hold conditions are resolved.

## State Visibility

Per Constitution §6 (Cognitive Load Minimization):

| Internal State | User-Facing Display |
|----------------|---------------------|
| Active | "Active" |
| Paused | "Paused - ready to resume anytime" |
| HoldPayment | "Action needed: update payment method" |
| HoldLogistics | "Action needed: return pending box" |
| HoldIdentity | "Action needed: verify your identity" |
| Closed | "Subscription ended" |

Users never see internal state names or transition mechanics.
