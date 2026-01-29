# There & Back Again: The Complete Your-Fit-Tailored Journey

> A living roadmap from concept through pilot to scale

---

## 1. The Metaphor Explained

"There & back again" captures the essence of Your-Fit-Tailored at every level of operation.

**The Surface Meaning**: Garments go out to users and come back. A simple round trip that repeats weekly.

**The Deeper Meaning**: The business model itself is circular—not just in logistics, but in learning and investment. Each cycle that completes feeds the next. Returns generate fit data. Fit data improves allocation. Better allocation increases satisfaction. Satisfaction drives retention. Retention justifies investment. Investment expands inventory. Inventory enables more users. More users generate more returns.

**The Strategic Meaning**: This project follows the same pattern. We start with specification (there), validate through pilot (the journey), return with operational truth (back again), then venture further into scale. Each epoch builds on what the previous learned.

The metaphor reminds us that in a circular business, endings are beginnings. The goal is not to reach a destination but to establish a sustainable rhythm where "there & back" becomes invisible to users—always fresh, always fits, no thought required.

---

## 2. Constitutional Foundation

All design decisions flow from six invariants established in `memory/constitution.md`. These are non-negotiable truths that govern the system regardless of implementation choices.

### Invariant 1: Weekly Cadence

> 7-day cycles are non-negotiable; exceptions close with recovery, never skip.

- Every active user maps to exactly one `$WEEK_ID` at any time
- A delayed box is not "late shipping" but a broken cycle requiring explicit compensation
- Exceptions are allowed only as explicit state changes, not silent delays

### Invariant 2: Circular Inventory

> Garments are stateful assets with lifecycle bounds; inventory is closed-loop.

- A garment cannot be in two boxes at once
- A garment cannot re-enter Available without passing through inspection
- Every garment exit path (resale, donation, recycling) must be defined at intake

### Invariant 3: State Truth Discipline

> All entities auditable; single subsystem owns each state class.

- Exactly one subsystem is authoritative for each class of state
- External signals (carriers, facilities) are inputs that must be validated
- State transitions are event-driven and monotonic where possible

### Invariant 4: Explicit Failure Handling

> Failures are normal; recovery paths are first-class, not exceptions.

- Each failure resolves into: cost absorption, user compensation, or inventory adjustment
- No failure remains unclassified (unclassified failures accumulate as hidden debt)
- Recovery paths are designed upfront, not bolted on

### Invariant 5: Probabilistic Fit

> Fit is a belief distribution that evolves, not static measurement.

- Allocations must incorporate uncertainty and remain correct when predictions are wrong
- Each cycle should increase fit certainty or reduce uncertainty
- Both explicit and implicit signals inform fit beliefs

### Invariant 6: Cognitive Load Minimization

> System defaults for all routine decisions; user input optional.

- User cognitive load must asymptotically approach zero
- Users must never be required to understand the internal state machine
- Explicit user input is optional and rare

**Verification Question**: Does this choice reduce uncertainty, friction, or variance across cycles without increasing cognitive load on the user? If not, it violates the constitution.

---

## 3. The Complete Journey (5 Epochs)

```
    EPOCH 0        EPOCH 1         EPOCH 2          EPOCH 3           EPOCH 4          EPOCH 5
   Conception    Foundation      Validation      Maturation        Scaling         Sustained
   ──────────    ──────────      ──────────      ──────────        ───────         ─────────

   ╭─────────╮   ╭─────────╮    ╭─────────╮     ╭─────────╮      ╭─────────╮     ╭─────────╮
   │  Specs  │──▶│  Build  │───▶│  Pilot  │────▶│  Learn  │─────▶│  Scale  │────▶│ Operate │
   │ & Plans │   │  MVP    │    │ 25 Users│     │ Automate│      │ Expand  │     │ Sustain │
   ╰─────────╯   ╰─────────╯    ╰─────────╯     ╰─────────╯      ╰─────────╯     ╰─────────╯
       │              │              │               │                │               │
       │              │              │               │                │               │
       ▼              ▼              ▼               ▼                ▼               ▼
   Complete       Ready to       Decision:      Decision:        Decision:       Ongoing
   Jan 2026       Execute        Graduate/      Automate/        National/       Ops
                  3 weeks        Pivot/Shut     Manual Scale     Regional
                                 8-12 weeks     12-24 weeks      24-52 weeks
```

| Epoch | Name | Duration | Primary Question | Status |
|-------|------|----------|------------------|--------|
| 0 | Conception | Complete | What are we building? | ✅ Specs done |
| 1 | Foundation Build | 3 weeks | Can we build the MVP? | Ready to execute |
| 2 | Pilot Validation | 8-12 weeks | Does this work? | Next phase |
| 3 | Intelligence Maturation | 12-24 weeks | Can we learn fast enough? | Post-pilot |
| 4 | Controlled Scaling | 24-52 weeks | Can we grow profitably? | Future |
| 5 | Sustained Operation | Ongoing | Can we compound value? | Future |

---

## 4. Phase Definitions with Gate Criteria

### Epoch 0: Conception (Complete)

**Objective**: Define what the system must be true at every level of abstraction.

**Outputs Delivered**:
- Constitution with 6 invariants (`memory/constitution.md`)
- Business model analysis (`specs/economics/business-model.md`)
- Pilot operational playbook (`specs/pilot-ops/playbook.md`)
- Pilot MVP specification (`specs/features/pilot-mvp/spec.md`)
- Implementation artifacts for Airtable/Retool (`implementation/`)

**Exit Criteria**: All specifications reviewed and approved. Implementation artifacts ready to execute.

---

### Epoch 1: Foundation Build (Ready to Execute)

**Objective**: Build the operational infrastructure for 25-user pilot.

**Duration**: 3 weeks

**Work Breakdown**:

| Week | Focus | Artifacts |
|------|-------|-----------|
| 1 | Airtable foundation | 8 core tables, seed data, automations |
| 2 | Retool interfaces | 20 pages across AdminConsole and WarehouseOps |
| 3 | Validation & training | End-to-end testing, operator training |

**Key Deliverables**:
- 17 Airtable tables configured
- 6 automations running
- 20 Retool pages deployed
- Operators trained on SOPs
- Launch checklist complete

**Exit Gate**:
- [ ] All Airtable tables passing validation queries
- [ ] All automations tested with synthetic data
- [ ] All Retool pages functional
- [ ] One complete test cycle executed end-to-end
- [ ] Operator sign-off on readiness

---

### Epoch 2: Pilot Validation (8-12 weeks)

**Objective**: Prove (or disprove) that weekly cadence circular apparel works.

**User Scale**: 25 users (hard cap enforced by system)

**Inventory Scale**: ~100-150 garments

**Team**: 2-3 FTE equivalent (multi-functional roles)

**Success Criteria from Spec** (`specs/features/pilot-mvp/spec.md`):

| Code | Criteria | Target |
|------|----------|--------|
| SC-201 | Onboard 25 pilot users | Within 1 week |
| SC-202 | Register 100+ garments | Correct barcoding |
| SC-203 | Complete 25 first-week cycles | >90% success |
| SC-204 | Fit satisfaction on first cycle | >80% |
| SC-205 | Process returns | Within 10 days of window |
| SC-206 | Inventory shrinkage | <5% over pilot |
| SC-207 | Generate data export | Complete analysis |
| SC-208 | Document all exceptions | For process improvement |

**Decision Gate** (from `specs/pilot-ops/playbook.md`):

| Decision | Criteria |
|----------|----------|
| **Graduate** | Cadence on-time >90%, shrink <5%, contribution margin non-negative, NPS >30 |
| **Pivot** | Cadence feasible but economics/product shape needs change (price, SKUs, categories, packaging) |
| **Shutdown** | Cannot maintain cadence, shrink exceeds bounds, value proposition failure |

**Weekly Review Metrics**:
- Cadence: `$ON_TIME_DISPATCH_PCT`, `$RECOVERY_TIME_P90`
- Inventory: `$SHRINK_PCT_PER_CYCLE`, `$STATE_MISMATCH_COUNT`
- Operations: `$CLEANING_TAT_HOURS`, `$QC_FAIL_RATE`
- Exceptions: `$EXCEPTIONS_PER_100_CYCLES`, `$OPEN_EXCEPTIONS_AGE_P90`
- User: `$SUPPORT_CONTACT_RATE`, `$CHURN_RATE`, `$NPS_LIKE_SCORE`
- Economics: `$CONTRIB_MARGIN_PER_USER_WEEK`, `$COST_PER_BOX`

---

### Epoch 3: Intelligence Maturation (12-24 weeks)

**Objective**: Automate learning loops and scale with maintained quality.

**User Scale**: 25 → 250 users

**Prerequisites**:
- Graduate decision from pilot
- Capital secured for inventory expansion
- Technical capacity for automation

**Focus Areas**:

1. **Fit Intelligence Implementation**
   - Deploy probabilistic fit matching
   - Implement automatic profile updates
   - Reduce manual allocation to exceptions only

2. **Logistics Optimization**
   - Negotiated carrier rates
   - Optimized routing algorithms
   - Hub-and-spoke consideration

3. **Exception Automation**
   - Rules-based exception handling
   - Graduated human escalation
   - Labeled data from pilot informs automation

4. **Retention Mechanics**
   - Churn prediction models
   - Proactive intervention workflows
   - Loyalty/engagement features

**Exit Gate**:
- [ ] Fit algorithm accuracy >80% (no manual override needed)
- [ ] Exception automation handles >50% of cases
- [ ] Unit economics positive at 250 users
- [ ] Operational load scales sublinearly with users

---

### Epoch 4: Controlled Scaling (24-52 weeks)

**Objective**: Grow profitably while compounding system intelligence.

**User Scale**: 250 → 2,500 users

**Inventory Scale**: 1,500 → 15,000 garments

**Focus Areas**:

1. **Geographic Expansion**
   - Multi-hub logistics
   - Regional inventory pools
   - Local carrier partnerships

2. **Product Expansion**
   - Category additions (informed by pilot data)
   - Size range optimization
   - Seasonal rotation capability

3. **Team Scaling**
   - Warehouse operations staff
   - Customer support scaling
   - Engineering for automation

4. **Financial Model Validation**
   - Prove unit economics at scale
   - Working capital efficiency
   - Path to profitability demonstration

**Exit Gate**:
- [ ] Positive contribution margin sustained 3+ months
- [ ] Customer acquisition cost < 3 months revenue
- [ ] Operational processes documented and repeatable
- [ ] Technology platform stable under load

---

### Epoch 5: Sustained Operation (Ongoing)

**Objective**: Establish the service as a continuously improving system.

**Characteristics**:
- User growth driven by word-of-mouth and brand
- Inventory turns compound efficiency
- Fit intelligence becomes competitive moat
- Operations are largely automated
- Human oversight for exceptions and improvement

**Key Metrics in Steady State**:
- Garment utilization: >15 uses per item
- Net retention: >100% (upsells offset churn)
- Contribution margin: >20%
- NPS: >50
- Carbon footprint per garment-use: declining

---

## 5. The Circular Nature (Triple-Loop Model)

Your-Fit-Tailored operates on three nested feedback loops, each with its own "there & back again" cadence.

```
                           ╭─────────────────────────────────────────╮
                           │        INVESTMENT LOOP (Quarterly)      │
                           │                                         │
          ╭────────────────┴───────────────╮                         │
          │                                │                         │
          ▼                                │                         │
    ┌──────────┐                           │                         │
    │  Invest  │                           │                         │
    │ Capital  │                           │                         │
    └────┬─────┘                           │                         │
         │                                 │                         │
         ▼         ╭─────────────────────────────────────────╮       │
    ┌──────────┐   │        LEARNING LOOP (Per Cycle)        │       │
    │ Acquire  │   │                                         │       │
    │Inventory │   │  ╭────────────────────────────────────╮ │       │
    └────┬─────┘   │  │      GARMENT LOOP (Weekly)         │ │       │
         │         │  │                                    │ │       │
         ▼         │  │    ┌─────┐    ┌──────┐   ┌──────┐  │ │       │
    ┌──────────┐   │  │    │ Out │───▶│ Wear │──▶│Return│  │ │       │
    │  Deploy  │───┼──┼───▶│     │    │      │   │      │  │ │       │
    │  to Box  │   │  │    └─────┘    └──────┘   └──┬───┘  │ │       │
    └──────────┘   │  │                            │      │ │       │
                   │  │    ┌─────────────────┐     │      │ │       │
                   │  │    │   Refurbish &   │◀────┘      │ │       │
                   │  │    │   Restock       │            │ │       │
                   │  │    └────────┬────────┘            │ │       │
                   │  │             │                     │ │       │
                   │  ╰─────────────┼─────────────────────╯ │       │
                   │                │                       │       │
                   │                ▼                       │       │
                   │  ┌──────────────────────────┐          │       │
                   │  │ Observe Fit & Condition  │          │       │
                   │  └────────────┬─────────────┘          │       │
                   │               │                        │       │
                   │               ▼                        │       │
                   │  ┌──────────────────────────┐          │       │
                   │  │ Update Fit Belief        │          │       │
                   │  └────────────┬─────────────┘          │       │
                   │               │                        │       │
                   │               ▼                        │       │
                   │  ┌──────────────────────────┐          │       │
                   │  │ Improve Next Allocation  │          │       │
                   │  └──────────────────────────┘          │       │
                   │                                        │       │
                   ╰────────────────────────────────────────╯       │
                                                                    │
    ┌──────────────────────────────┐                                │
    │  Measure Unit Economics      │◀───────────────────────────────╯
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │  Optimize Operations         │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │  Reinvest in Inventory       │──────▶ (back to top)
    └──────────────────────────────┘
```

### Loop 1: Garment Loop (Weekly)

**Cadence**: 7 days

**Flow**: Out → Wear → Return → Refurbish → Out

**Key Metrics**:
- Days in transit (target: <2 each way)
- Wear window utilization
- Return compliance rate
- Refurbishment turnaround

**"There"**: Garment leaves warehouse to user
**"Back Again"**: Garment returns, cleaned, restocked

### Loop 2: Learning Loop (Per Cycle)

**Cadence**: Each completed cycle

**Flow**: Observe → Hypothesize → Test → Learn → Apply

**Key Metrics**:
- Fit feedback capture rate
- Fit prediction accuracy
- User satisfaction trend
- Allocation exception rate

**"There"**: Send garments based on current belief
**"Back Again"**: Update belief based on actual outcome

### Loop 3: Investment Loop (Quarterly)

**Cadence**: 13 weeks

**Flow**: Invest → Operate → Measure → Optimize → Reinvest

**Key Metrics**:
- Contribution margin per user-week
- Garment turns per quarter
- Working capital efficiency
- Customer lifetime value

**"There"**: Deploy capital into inventory
**"Back Again"**: Harvest learnings and returns to inform next deployment

---

## 6. Post-Pilot Roadmap

### Scale Trajectory

| Metric | Pilot (E2) | Maturation (E3) | Scale (E4) | Sustained (E5) |
|--------|------------|-----------------|------------|----------------|
| **Users** | 25 | 250 | 2,500 | 10,000+ |
| **Weekly Cycles** | 25 | 250 | 2,500 | 10,000+ |
| **Garments** | 100-150 | 1,500 | 15,000 | 60,000+ |
| **Garment Turns/Year** | 10-15 | 15-20 | 20-25 | 25-30 |
| **Team Size** | 2-3 | 5-8 | 15-25 | 40-60 |
| **Locations** | 1 hub | 1-2 hubs | 3-5 hubs | Regional network |
| **Capital Required** | $50K | $500K | $3M | $15M+ |
| **Revenue (Annual)** | $65K | $650K | $6.5M | $26M+ |
| **Contribution Margin** | Negative | Break-even | 10-15% | 20%+ |

### Key Milestones Post-Pilot

**Month 3-6 (Maturation Start)**:
- [ ] Deploy fit intelligence v1
- [ ] Expand to 100 users
- [ ] Establish second cohort ship day
- [ ] Negotiate volume carrier rates

**Month 6-9 (Maturation Mid)**:
- [ ] Achieve 200 users
- [ ] Automate 50% of exceptions
- [ ] Launch retention mechanics
- [ ] Achieve contribution margin break-even

**Month 9-12 (Maturation End)**:
- [ ] Reach 250 users
- [ ] Fit algorithm >80% accuracy
- [ ] Unit economics validated
- [ ] Series A readiness (if external capital path)

**Year 2 (Scale)**:
- [ ] Geographic expansion (2-3 markets)
- [ ] Product category expansion
- [ ] 2,500 users
- [ ] Positive EBITDA

---

## 7. Risk Framework

### Graduate Criteria (All Must Be True)

| Criteria | Threshold | Measurement |
|----------|-----------|-------------|
| Cadence On-Time | >90% | `$ON_TIME_DISPATCH_PCT` over stability period |
| Shrinkage | <5% per cycle | `$SHRINK_PCT_PER_CYCLE` |
| Contribution Margin | Non-negative | `$CONTRIB_MARGIN_PER_USER_WEEK` |
| Net Promoter Score | >30 | Post-cycle survey |
| Recovery Time | P90 <7 days | `$RECOVERY_TIME_P90_DAYS` |

### Pivot Indicators (Any One Triggers Review)

| Indicator | Signal | Possible Pivot |
|-----------|--------|----------------|
| Price sensitivity | Churn spikes at renewal | Price increase or tier restructure |
| Category failure | Specific garment types high damage/dissatisfaction | Reduce SKU breadth |
| Fit ceiling | Cannot improve fit satisfaction past 70% | Simplify to standard sizes only |
| Cadence stress | Weekly is operationally unsustainable | Move to bi-weekly |
| Geographic limitation | Shipping costs destroy economics | Regional-only model |

### Shutdown Criteria (Any One Triggers Evaluation)

| Criteria | Threshold | Implication |
|----------|-----------|-------------|
| Cadence Failure | On-time <70% for 4+ weeks | Operational model broken |
| Shrinkage Spiral | >15% cumulative | Inventory economics unworkable |
| Value Rejection | NPS <0 or churn >50%/month | Users don't want this |
| Cash Exhaustion | <30 days runway | No path to continue |

### Risk Mitigations

| Risk | Mitigation | Owner |
|------|------------|-------|
| High shipping costs | Negotiate volume rates; staged replenishment | Ops Lead |
| Cleaning bottleneck | Multiple vendor contracts; overflow capacity | Inventory Controller |
| Fit intelligence failure | Maintain manual allocation capability | Data Steward |
| User acquisition cost | Referral focus; low-CAC channels | Marketing |
| Inventory capital lock-up | Resale channel for retired items | Finance |

---

## 8. Success Metrics by Phase

### Epoch 1: Foundation Build

| Metric | Target | Method |
|--------|--------|--------|
| Tables created | 17 | Count in Airtable |
| Automations working | 6/6 | Test with synthetic data |
| Pages deployed | 20 | Count in Retool |
| Test cycles complete | 1+ | End-to-end validation |
| Operators certified | 100% | Training sign-off |

### Epoch 2: Pilot Validation

| Metric | Target | Method |
|--------|--------|--------|
| User onboarding | 25 in week 1 | `$ACTIVE_USERS_END` |
| Cycle completion | >90% | `$CYCLES_COMPLETED / $CYCLES_SCHEDULED` |
| On-time delivery | >90% | `$ON_TIME_DELIVERY_PCT` |
| Return compliance | >90% | Returns received / Returns expected |
| Fit satisfaction | >80% | Survey response |
| Shrinkage | <5% | `$SHRINK_PCT_PER_CYCLE` |
| NPS | >30 | Survey calculation |

### Epoch 3: Maturation

| Metric | Target | Method |
|--------|--------|--------|
| User scale | 250 | Active user count |
| Fit automation | >80% | Manual overrides / Total allocations |
| Exception automation | >50% | Auto-resolved / Total exceptions |
| Contribution margin | Non-negative | `$CONTRIB_MARGIN_PER_USER_WEEK` |
| Churn | <10%/month | Churned / Active start of month |

### Epoch 4: Scale

| Metric | Target | Method |
|--------|--------|--------|
| User scale | 2,500 | Active user count |
| Markets | 3-5 | Active hub locations |
| Contribution margin | >10% | Monthly financial review |
| CAC payback | <3 months | CAC / ARPU |
| Garment turns | >20/year | Total rentals / Total inventory |

### Epoch 5: Sustained

| Metric | Target | Method |
|--------|--------|--------|
| Net revenue retention | >100% | Annual cohort analysis |
| NPS | >50 | Quarterly survey |
| Garment turns | >25/year | Inventory utilization report |
| Contribution margin | >20% | Monthly P&L |
| Carbon/garment-use | Declining | Annual sustainability audit |

---

## 9. Known Gaps and Future Work

### Specification Gaps

| Gap | Current Status | Required For | Priority |
|-----|----------------|--------------|----------|
| Fit Intelligence Subsystem | Theoretical (Constitution §5) | Epoch 3 | High |
| Logistics Optimization | Partial (playbook SOPs) | Epoch 3 | Medium |
| Retention Mechanics | Not specified | Epoch 3 | Medium |
| Churn Prediction | Not specified | Epoch 3 | Medium |
| Scale Architecture | Theoretical only | Epoch 4 | Low (for now) |
| Multi-tenant Support | Not addressed | Epoch 4 (if B2B) | Low |

### Financial Model Gaps

| Gap | Current Status | Required For | Priority |
|-----|----------------|--------------|----------|
| Working capital model | Preliminary estimates | Epoch 2 investment decision | High |
| CAC/LTV analysis | Framework only | Epoch 3 go-to-market | Medium |
| Multi-hub economics | Not modeled | Epoch 4 expansion | Low |
| Exit scenarios | Not addressed | Investor discussions | Low |

### Operational Gaps

| Gap | Current Status | Required For | Priority |
|-----|----------------|--------------|----------|
| Carrier contract templates | Not created | Epoch 2 launch | High |
| Cleaning vendor SOPs | Not formalized | Epoch 2 launch | High |
| User legal agreements | Not drafted | Epoch 2 launch | High |
| Safety/hygiene protocols | Mentioned in playbook | Epoch 2 launch | High |
| Insurance requirements | Not researched | Epoch 2 launch | Medium |

### Technology Gaps

| Gap | Current Status | Required For | Priority |
|-----|----------------|--------------|----------|
| Fit algorithm design | Conceptual | Epoch 3 | Medium |
| Barcode/RFID selection | Not specified | Epoch 1 | High |
| User-facing app/portal | Not designed | Epoch 2 or 3 | Medium |
| Analytics platform | Ad-hoc exports | Epoch 3 | Medium |

---

## 10. Appendices

### A. Document Cross-References

| Document | Location | Purpose |
|----------|----------|---------|
| Constitution | `memory/constitution.md` | Invariants governing all design |
| Business Model | `specs/economics/business-model.md` | Unit economics and pricing analysis |
| Pilot Playbook | `specs/pilot-ops/playbook.md` | Operational procedures and SOPs |
| Pilot MVP Spec | `specs/features/pilot-mvp/spec.md` | Feature requirements and acceptance criteria |
| Implementation Status | `implementation/IMPLEMENTATION-STATUS.md` | Current build progress |
| Airtable Setup | `implementation/airtable/SETUP-GUIDE.md` | Database configuration |
| Retool Setup | `implementation/retool/SETUP-GUIDE.md` | UI configuration |

### B. Key Variable Reference

From pilot playbook (`specs/pilot-ops/playbook.md`):

| Variable | Definition | Typical Value |
|----------|------------|---------------|
| `$PILOT_USER_RANGE` | Target user count | 25-250 |
| `$CADENCE_ON_TIME_TARGET_PCT` | On-time delivery target | 90% |
| `$LOSS_DMG_MAX_PCT_PER_CYCLE` | Maximum acceptable shrinkage | 5% |
| `$LATE_GRACE_DAYS` | Days before late return triggers action | 2-3 |
| `$LOST_FINALIZE_DAYS` | Days before declaring item lost | 14 |
| `$RECOVERY_MAX_DAYS` | Maximum days to restore cadence | 7 |

### C. Epoch Timeline (Nominal)

```
2026
────────────────────────────────────────────────────────────────────────
Jan    Feb    Mar    Apr    May    Jun    Jul    Aug    Sep    Oct    Nov
│      │      │      │      │      │      │      │      │      │      │
├──────┤
│  E0  │  Specs complete
│      │
      ├────────┤
      │   E1   │  Foundation build (3 weeks)
      │        │
              ├────────────────────────────┤
              │           E2               │  Pilot validation (12 wks)
              │                            │
                                          ├────────────────────────────┤
                                          │           E3               │
                                          │  Maturation (begins)       │

2027
────────────────────────────────────────────────────────────────────────
              │           E3 continues     │           E4 begins
              ├────────────────────────────┼───────────────────────────▶
```

### D. Decision Log Template

For tracking graduate/pivot/shutdown decisions:

```
Decision ID: ____
Date: ____
Week of Pilot: ____

Metrics Snapshot:
- On-time dispatch: ____%
- Shrinkage: ____%
- NPS: ____
- Contribution margin: $____

Decision: [ ] GRADUATE  [ ] PIVOT  [ ] SHUTDOWN  [ ] CONTINUE

Justification (cite 3 metrics + 1 qualitative observation):
1. ____
2. ____
3. ____
4. ____

If PIVOT, what changes:
____

If SHUTDOWN, reason:
____

Next actions:
1. ____
2. ____
3. ____

Signed: ____
```

---

*Last updated: 2026-01-29*
*Status: Living document—update as epochs progress*
