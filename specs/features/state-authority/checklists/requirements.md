# Requirements Checklist: State Authority Subsystem

## Specification Quality Gates

### Completeness
- [x] All core entities have defined state machines (User, Garment, Box, Cycle)
- [x] Transition contracts include preconditions and postconditions
- [x] Edge cases are identified and addressed
- [x] Multi-tenant isolation is specified ($TENANT_ID scoping)
- [x] Audit/event sourcing requirements are defined

### Testability
- [x] All acceptance scenarios use Given/When/Then format
- [x] Success criteria are measurable with specific metrics
- [x] Each user story has independent test description
- [x] Error conditions have expected outcomes

### Constitution Alignment

#### §1 Weekly Cadence Invariant
- [x] FR-009 enforces single cycle per user per week
- [x] CycleEntity state machine includes all temporal states
- [x] Cadence violations produce explicit errors, not silent failures

#### §2 Circular Inventory Invariant
- [x] FR-008 prevents garment double-allocation
- [x] FR-010 enforces lifecycle bounds
- [x] GarmentEntity cannot skip inspection states (ReceivedReturn → Refurbish → Available)

#### §3 State Truth Discipline
- [x] StateAuthoritySubsystem is explicitly the canonical source
- [x] FR-007 mandates immutable event emission
- [x] External signals are inputs, not authoritative state
- [x] All identifiers are tenant-scoped

#### §4 Explicit Failure Handling
- [x] Invalid transitions produce specific error codes (FR-006)
- [x] Bounded uncertainty states are supported (FR-013)
- [x] Compensating events are defined (FR-011)
- [x] No silent failures—all rejections are recorded

#### §5 Probabilistic Fit
- [x] Fit profile is a reference, not embedded state (separation of concerns)
- [x] No fit-related state collapsing in State Authority (correct—fit lives in FitIntelligenceSubsystem)

#### §6 Cognitive Load Minimization
- [x] State Authority operates internally; users never see internal state
- [x] Automatic state progressions (e.g., WearWindowOpen → ReturnWindowOpen)
- [x] Exception states (Holds) are well-defined with clear resolution paths

## Functional Requirements Traceability

| Requirement | User Story | Constitution Reference |
|-------------|------------|------------------------|
| FR-001 | US3 | §4 (explicit holds) |
| FR-002 | US1 | §2 (lifecycle states) |
| FR-003 | US4 | §3 (container tracking) |
| FR-004 | US2 | §1 (cycle progression) |
| FR-005 | US1, US2 | §3 (transition discipline) |
| FR-006 | US1, US2 | §4 (explicit errors) |
| FR-007 | US5 | §3 (audit trail) |
| FR-008 | US1 | §2 (no double-allocation) |
| FR-009 | US2 | §1 (weekly uniqueness) |
| FR-010 | US1 | §2 (lifecycle bounds) |
| FR-011 | US5 | §3 (compensating events) |
| FR-012 | US5 | §3 (idempotency) |
| FR-013 | US1, US2 | §4 (bounded uncertainty) |
| FR-014 | All | §3 (multi-tenant) |

## Risk Assessment

### Critical Risks Mitigated by This Spec
1. **Double-allocation** → FR-008 + US1 Scenario 2
2. **Phantom inventory** → FR-002 state machine + audit trail
3. **Cadence collapse** → FR-009 + US2 Scenarios 1-2
4. **State divergence** → FR-007 event sourcing + FR-013 uncertainty handling
5. **Silent failures** → FR-006 explicit errors + FR-011 compensating events

### Risks NOT in Scope (Addressed by Other Subsystems)
- Fit prediction accuracy → FitIntelligenceSubsystem
- Logistics routing optimization → LogisticsOrchestrationSubsystem
- User communication policy → ExperienceMinimizationSubsystem
- Payment processing → UserContractEnforcementSubsystem

## Approval

- [ ] Spec reviewed against constitution
- [ ] Edge cases validated with operations team
- [ ] State machine diagrams created
- [ ] Ready for /speckit.plan
