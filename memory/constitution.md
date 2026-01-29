# Your-Fit-Tailored Constitution

Architectural invariants that govern all system design. These are **non-negotiable truths** that must hold across all operations, regardless of implementation choices.

---

## 1. Weekly Cadence Invariant

**Statement:** 7-day cycles are non-negotiable; exceptions close with recovery, never skip.

**Implications:**
- Every Active UserEntity has a deterministic mapping from current time to exactly one `$WEEK_ID`
- At most one open CycleEntity per `$WEEK_ID` per user
- Deviations from cadence introduce compounding variance into cleaning queues, inventory availability, and user trust
- A delayed box is not "late shipping" but a **broken cycle** that must be logged and compensated at the system level
- Exceptions are allowed only as explicit state changes, not silent delays

**Violation:** Any silent delay, implicit skip, or cadence drift that is not recorded as an explicit compensating event.

---

## 2. Circular Inventory Invariant

**Statement:** Garments are stateful assets with lifecycle bounds; inventory is closed-loop.

**Implications:**
- A GarmentEntity cannot be in two boxes at once
- A GarmentEntity cannot be both Available and InTransit simultaneously
- A GarmentEntity cannot re-enter Available without passing through inspection and any required refurbishment
- Each garment has a maximum allowable lifecycle budget (bounded set of counters)
- Transitions must enforce retirement when bounds are exceeded
- Every garment exit path (resale, donation, recycling, downcycling) must be defined at inventory intake

**Violation:** Double-allocation, phantom inventory, garments returning to circulation without inspection, or lifecycle bounds being ignored.

---

## 3. State Truth Discipline

**Statement:** All entities auditable; single subsystem owns each state class.

**Implications:**
- Exactly one subsystem is authoritative for each class of state
- StateAuthoritySubsystem is the canonical source of truth for entity state and transitions
- External signals (carriers, facilities, payment rails) are inputs that must be validated, reconciled, and translated
- The platform must not delegate canonical state transitions to external actors
- All identifiers and temporal references are tenant- and time-scoped (`$TENANT_ID`, `$WEEK_ID`, `$CYCLE_ID`)
- State transitions are event-driven, monotonic where possible, reversible only via explicit compensating events

**Violation:** Split-brain state, external systems treated as authoritative, in-place mutation instead of compensating events, or ambiguous entity ownership.

---

## 4. Explicit Failure Handling

**Statement:** Failures are normal; recovery paths are first-class, not exceptions.

**Implications:**
- The system assumes failure as a normal operating condition
- Each failure must resolve into one of three outcomes: cost absorption, user compensation, or inventory state adjustment
- No failure is allowed to remain unclassified (unclassified failures accumulate as hidden debt)
- Recovery paths are designed upfront, not bolted on as exception handling
- Graceful degradation over brittle optimization

**Failure Categories:**
- Inventory shortage before commitment → controlled degradation, automatic skip, clear accounting
- Packing variance → record variance event, correct or commit to observed set
- Delivery signal missing → bounded uncertainty state, DeliveredByProxy events
- Late return → exception control loop, progressive escalation, HoldLogistics state
- Damage/contamination → immediate quarantine, SafetyIncident event
- Payment failure → HoldPayment state, AccountsReceivable tracking

**Violation:** Silent failures, unclassified exceptions, failures that corrupt state correctness, or ad hoc operational interventions.

---

## 5. Probabilistic Fit

**Statement:** Fit is a belief distribution that evolves, not static measurement.

**Implications:**
- No subsystem may collapse fit into a single deterministic fact for allocation decisions
- Allocations must incorporate uncertainty and remain correct even when predictions are wrong
- Fit confidence is modeled as a rolling posterior probability
- Each cycle should increase fit certainty or reduce uncertainty
- Fit belief updates occur after delivery, after wear, and after return inspection
- Both explicit user signals and implicit behavioral signals inform fit beliefs
- UserFitBelief includes DriftModel (gradual body changes)
- GarmentFitBelief includes AgingModel (repeated refurb effects)
- FitIntelligenceSubsystem must treat explicit feedback as optional

**Violation:** Deterministic fit matching, ignoring uncertainty in allocation, requiring explicit user feedback, or fit thrash (oscillating between sizes without learning).

---

## 6. Cognitive Load Minimization

**Statement:** System defaults for all routine decisions; user input optional.

**Implications:**
- User cognitive load must asymptotically approach zero as the system learns and stabilizes
- The system must have defaults for all routine decisions
- Users must never be required to understand the internal state machine
- Explicit user input is optional and rare, reserved for exceptions that cannot be safely resolved automatically
- Any UI, communication, or policy that shifts cognitive load back onto the user violates the core premise
- The user-facing state model is an intentionally simplified projection of the canonical state
- ExperienceMinimizationSubsystem defines what decisions are optional and what defaults apply

**Violation:** Requiring users to make routine decisions, exposing internal state complexity, or pursuing "low cognitive load" through lack of transparency rather than high-quality defaults plus precise exception handling.

---

## Cross-Cutting Verification

Any downstream design—whether technical architecture, warehouse layout, or pricing model—should be evaluated by asking:

> Does this choice reduce uncertainty, friction, or variance across cycles without increasing cognitive load on the user?

If not, it is misaligned with this constitution.
