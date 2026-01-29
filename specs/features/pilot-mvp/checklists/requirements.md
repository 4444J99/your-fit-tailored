# Requirements Checklist: Pilot MVP

## Specification Quality Gates

### Completeness
- [x] User onboarding defined
- [x] Inventory onboarding defined
- [x] Full cycle execution defined
- [x] Allocation process defined
- [x] Monitoring and communications defined
- [x] Exception recovery defined
- [x] Manual vs automated processes clear

### Testability
- [x] All acceptance scenarios use Given/When/Then format
- [x] Success criteria are measurable
- [x] Key metrics defined with targets
- [x] Independent tests per user story

### Constitution Alignment

#### §1 Weekly Cadence Invariant
- [x] Scheduling remains automated
- [x] Manual processes don't break cadence
- [x] Timing thresholds defined

#### §2 Circular Inventory Invariant
- [x] Barcode registration for tracking
- [x] Scan-based packing maintained
- [x] Inspection required before circulation

#### §3 State Truth Discipline
- [x] All transitions go through State Authority
- [x] Communication events logged
- [x] Exceptions documented

#### §4 Explicit Failure Handling
- [x] US8 covers all exception recovery paths
- [x] Each failure mode has defined resolution

#### §5 Probabilistic Fit
- [x] Manual allocation follows fit principles
- [x] Feedback captured for learning
- [x] Preparing data for future FitIntelligenceSubsystem

#### §6 Cognitive Load Minimization
- [x] Communications are action-oriented
- [x] Users don't need to understand internal state
- [x] Default behaviors handle normal cases

## Dependencies

### Depends On (must be complete)
- State Authority Subsystem (all tasks)
- Weekly Cycle Flow (all tasks)

### Pilot Prerequisites
- [ ] Physical inventory procured
- [ ] Barcodes printed
- [ ] Carrier account set up
- [ ] Email templates created
- [ ] User recruitment complete (25 users)
- [ ] Facility ready (packing, receiving, refurbishment)

## Functional Requirements Traceability

| Requirement | User Story | Notes |
|-------------|------------|-------|
| FR-201 | US1 | Manual onboarding form |
| FR-202 | US2 | Barcode scanning |
| FR-203 | US4 | Manual allocation |
| FR-204 | US3 | Retool UI covers all transitions |
| FR-205 | US3 | Automations from Weekly Cycle Flow |
| FR-206 | US5 | Dashboard |
| FR-207 | US6 | Communication tracking |
| FR-208 | US7 | Data export |
| FR-209 | US8 | Exception workflow |
| FR-210 | US1 | 25-user cap |

## Risk Assessment

### Pilot-Specific Risks

| Risk | Mitigation |
|------|------------|
| Operator error | Clear SOPs, training session |
| Barcode scanning failures | Manual fallback entry |
| Carrier delays | Buffer time in expectations |
| User no-shows for return | Progressive reminders, hold policy |
| Inventory shortage | Monitor closely, over-stock by 20% |
| System downtime (Airtable) | Daily backup, manual fallback |

### Risks NOT in Scope
- Scale beyond 25 users
- Automated carrier integration
- Automated user communications
- Automated fit intelligence

## Launch Checklist

### Week -2: System Ready
- [ ] State Authority all tasks complete
- [ ] Weekly Cycle Flow all tasks complete
- [ ] All Retool apps functional
- [ ] Configuration table populated with pilot timing

### Week -1: Operational Ready
- [ ] Pilot users recruited and agreements signed
- [ ] Inventory procured and barcoded
- [ ] Boxes procured and barcoded
- [ ] Facility setup complete
- [ ] Carrier account verified
- [ ] Email templates approved
- [ ] Training completed for all operators

### Day -1: Final Verification
- [ ] All 25 users onboarded in system (Active state)
- [ ] All inventory onboarded (100+ garments)
- [ ] Test cycle executed end-to-end
- [ ] Scheduling automation verified
- [ ] Communication workflow tested

### Day 0: Launch
- [ ] Scheduling runs for Week 1
- [ ] All cycles created
- [ ] Commitment monitoring active

## Approval

- [ ] Spec reviewed against constitution
- [ ] Operations team reviewed procedures
- [ ] Launch checklist complete
- [ ] Ready for pilot start
