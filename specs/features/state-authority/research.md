# Research: State Authority Subsystem

**Date**: 2026-01-29
**Context**: Pilot validation stack selection

## Decision: Airtable + Retool for Pilot

### Why No-Code/Low-Code for Pilot

The plan recommends validating the business model before engineering investment. State Authority is the foundation, but the pilot goal is **proving the circular apparel subscription model works**, not building production infrastructure.

**Key Constraints**:
- 25 users maximum
- ~500 garments in circulation
- ~100 cycles per month
- 3-6 month pilot duration
- Non-engineering team must be able to iterate

### Airtable Capabilities Assessment

| Requirement | Airtable Capability | Notes |
|-------------|---------------------|-------|
| Entity state storage | Native tables | ✅ Sufficient for pilot scale |
| Linked records | Native | ✅ User → Cycles, Garment → Box |
| Unique constraints | Formula + automation | ⚠️ Requires validation automation |
| State transitions | Automations + scripts | ✅ JavaScript in automations |
| Event logging | Append-only table | ✅ Automation creates record |
| Audit queries | Views + filters | ✅ Adequate for debugging |
| Multi-tenant | Workspace isolation | ✅ Pilot is single-tenant |

**Limitations Accepted for Pilot**:
- No true ACID transactions (compensating design required)
- Rate limits (5 req/sec) acceptable at pilot scale
- 50k record limit per base (pilot: <10k records)
- No real event sourcing (simulated via append-only table)

### Retool Capabilities Assessment

| Requirement | Retool Capability | Notes |
|-------------|-------------------|-------|
| Barcode scanning | Mobile app native | ✅ Critical for warehouse |
| Form workflows | Native components | ✅ Packing, inspection flows |
| Airtable integration | Native connector | ✅ Real-time sync |
| Error handling | UI conditionals | ✅ Show validation errors |
| Mobile access | Retool Mobile | ✅ Warehouse operators |
| Admin console | Web app | ✅ Entity browsing, debugging |

### State Machine Implementation in Airtable

**Pattern**: Transition Rules table + Validation Automation

```
TransitionRules Table:
- entity_type: "Garment"
- from_state: "Reserved"
- to_state: "Packed"
- preconditions: "box_id IS NOT NULL AND box_state = 'Picking'"
- postconditions: "Update box.actual_contents"
```

**Automation Flow**:
1. Retool calls Airtable API with transition request
2. Automation triggers on record update
3. Script queries TransitionRules for valid transition
4. Script validates preconditions
5. If valid: update state, create Event record
6. If invalid: reject, create RejectionEvent record

### Event Sourcing Simulation

True event sourcing requires replaying events to reconstruct state. For pilot:

**Simplified Approach**:
- Events table is append-only audit log (not source of truth)
- Current state lives in entity tables (mutable)
- Events enable debugging and compliance, not reconstruction
- Production migration will implement proper event sourcing

**Event Record Structure**:
```
Events Table:
- event_id (auto-generated)
- entity_type
- entity_id
- from_state
- to_state
- timestamp
- actor_id (operator or "system")
- cycle_id (if applicable)
- metadata (JSON string)
- idempotency_key
```

### Alternative Considered: PostgreSQL + Custom API

**Rejected for pilot because**:
- Requires deployment infrastructure
- Requires API development (2-4 weeks)
- Requires migration management
- Requires test environment setup
- Non-engineers cannot iterate

**When to migrate**: After pilot validates business model, before scaling to 100+ users.

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Airtable automation reliability | Manual override procedures in Retool |
| Rate limiting during busy periods | Batch operations, queue patterns |
| Data loss | Daily Airtable backups, event log reconstruction |
| Complexity creep | Strict constitution gates; rebuild in production |

## Recommendations

1. **Accept pilot-grade durability**: Airtable is sufficient for proving the model.
2. **Document state machines thoroughly**: Enables clean migration to production.
3. **Log everything**: Events table enables post-hoc analysis.
4. **Plan migration path**: After pilot, migrate to PostgreSQL + proper event sourcing.
