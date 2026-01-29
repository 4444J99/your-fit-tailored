## Q: 
You are operating as a unified design authority composed of three roles acting in strict sequence and constraint: systems architect, unit-economics analyst, and operating partner. You are given an upstream THEORETICAL SPECIFICATION that defines non-negotiable truths about the system’s purpose, invariants, entities, and failure modes. You may not reinterpret or soften those constraints. Your task is to translate them downward into architecture, economics, and operations without contradiction. You must execute this work in three passes, where each pass is binding on the next. PASS ONE: FORMAL SYSTEM ARCHITECTURE Produce a formal system architecture specification that expresses the theoretical specification as enforceable system structure. All entities must be stateful. All cycles must be explicit. Weekly cadence must be treated as an invariant, not a preference. No technologies, vendors, or tooling are to be named. At the conclusion of this pass, include a short section titled “Architectural Commitments” that enumerates the decisions that downstream layers are not allowed to violate. PASS TWO: UNIT-ECONOMICS SIMULATION Using only the architectural commitments from Pass One, construct a unit-economics simulation model. Revenue must be time-based. Costs must be per-cycle. Variance must be explicit. Human error must be modeled. If an architectural choice causes economic fragility, you must surface that fragility rather than smoothing it away. At the conclusion of this pass, include a section titled “Economic Constraints Imposed on Operations” that clearly states what operations must respect for the model to remain viable. PASS THREE: PILOT-SCALE OPERATIONAL PLAYBOOK Using only the architectural commitments and economic constraints already defined, produce a pilot-scale operational playbook suitable for 25–250 active users. Assume manual processes, imperfect compliance, and constrained capital. Every operational step must map back to a system requirement and an economic necessity. If an operational shortcut would violate cadence, fit learning, or circular integrity, it must be explicitly rejected. At the conclusion of this pass, include a section titled “Pilot Exit Criteria” explaining the exact signals that justify scaling, pausing, or terminating the venture. GLOBAL CONSTRAINTS: You are not allowed to optimize locally at the expense of system coherence. You are not allowed to introduce features that reduce user cognitive load at the cost of hidden operational or economic debt. You must assume failure is normal and design recovery paths rather than exception handling. FINAL SYNTHESIS REQUIREMENT: End the document with a section titled “Cross-Layer Consistency Check” in which you explicitly state why the architecture, economics, and operations do not contradict one another, and identify the single weakest assumption in the entire stack. Your output must read as one integrated document authored by a single, disciplined intelligence, not three disconnected analyses.

## A: 
# Circular Weekly Apparel Subscription System

$DOC_ID=CSA-WKLY-CIRC-ARCH_ECON_OPS_v1  
$TIMEZONE=America/New_York  
$CADENCE_UNIT=7_days  
$UNIT_OF_ANALYSIS=member_week_cycle

This document translates the upstream theoretical specification into a binding, cross-layer stack: architecture first, then economics constrained by that architecture, then pilot operations constrained by both. Weekly cadence is treated as an invariant. Circular integrity is treated as an invariant. Failure is treated as normal; recovery paths are first-class system behaviors, not “edge cases.”

* * *

## Pass One: Formal System Architecture

### 1.1 Purpose and Non-Negotiable Invariants

1.  Weekly cadence is invariant. Every active member is governed by a repeating 7-day cycle that must complete with an explicit state transition record, even when recovery actions are required.
    
2.  Circular inventory reuse is invariant. Garments are assets that persist across cycles with state, provenance, and retirement rules.
    
3.  Revenue is time-based subscription yield, not per-item sales. The system must represent earned service time separately from physical item movements.
    
4.  Costs are per-cycle marginal economics. The architecture must surface per-cycle cost drivers (cleaning, labor, logistics, loss, damage, retirement) as attributable events.
    
5.  Failure is normal. Late returns, lost shipments, damage, mis-sorts, and human error must be modeled as explicit states with recovery workflows, not hidden adjustments.
    

### 1.2 Core Stateful Entities and Required State

All entities are stateful, versioned, and auditable. No “stateless” objects are permitted.

1.  MemberEntity  
    1.1 MemberID (immutable)  
    1.2 SubscriptionState ∈ {Prospect, Active, Paused, PastDue, Churned}  
    1.3 CycleAnchorDay (the fixed weekly anchor for the member)  
    1.4 FitProfileState (learned, evolving)  
    1.5 RiskFlagsState (lateness propensity, loss propensity, dissatisfaction propensity)  
    1.6 ServiceLedgerState (time-based entitlement and earned service accounting)
    
2.  GarmentAssetEntity  
    2.1 GarmentID (immutable)  
    2.2 SizeAttributeSet (canonical)  
    2.3 ConditionState ∈ {New, Active, Soiled, Clean, NeedsRepair, UnderRepair, FailedQA, Retired, Lost}  
    2.4 CycleCount (turns completed)  
    2.5 DamageHistoryState (events + severity)  
    2.6 RetirementRuleState (thresholds, triggers, residual value policy)
    
3.  ContainerEntity (the physical kit/box)  
    3.1 ContainerID (immutable)  
    3.2 ContainerState ∈ {Ready, Packed, InTransitOut, Delivered, InUse, InTransitBack, Received, Quarantined, ExceptionHold}  
    3.3 ChainOfCustodyState (handoffs, timestamps)  
    3.4 ContentsManifestState (GarmentIDs + quantities + verification status)
    
4.  CycleEntity (the unit of time and accountability)  
    4.1 CycleID (immutable)  
    4.2 MemberID (foreign key)  
    4.3 CycleWeekIndex (monotonic per member)  
    4.4 CycleState ∈ {Planned, Packed, Shipped, Delivered, WearingWindow, ReturnExpected, Returned, IntakeComplete, CleaningComplete, ReadyForNext, ClosedWithRecovery}  
    4.5 ExceptionState (nullable, but explicit)  
    4.6 CostEventLedgerState (per-cycle marginal cost events)  
    4.7 ServiceEarnedState (time-based earned revenue mapping)
    
5.  NodeEntity (where work happens; no vendor assumptions)  
    5.1 NodeID  
    5.2 NodeType ∈ {Storage, Packing, Intake, Cleaning, Repair, QA, Dispatch, Support}  
    5.3 CapacityState (throughput per day)  
    5.4 QueueState (WIP, backlogs)
    
6.  MovementLegEntity (logistics as explicit legs)  
    6.1 LegID  
    6.2 FromNodeID, ToNodeID  
    6.3 LegState ∈ {LabelCreated, PickedUp, InTransit, Delivered, Exception}  
    6.4 LossRiskState (estimated)  
    6.5 CostState (postable)
    

### 1.3 Weekly Cadence as a Hard Scheduler

1.  Each Active MemberEntity instantiates exactly one CycleEntity per $CADENCE_UNIT, anchored to MemberEntity.CycleAnchorDay.
    
2.  A cycle cannot be skipped. If physical flow fails (late return, lost, cleaning backlog), the cycle closes as ClosedWithRecovery and triggers recovery actions that are themselves stateful and costed.
    
3.  The scheduler enforces two time domains that must be reconciled, never conflated.  
    3.1 ServiceTimeDomain: subscription entitlement and earned revenue per week.  
    3.2 PhysicalFlowDomain: movement and transformation of assets (garments, containers) across nodes and legs.
    

### 1.4 Required State Machines (Enforceable Transitions)

1.  GarmentAssetEntity transitions are only allowed through logged events. Examples include Active → Soiled upon return intake; Soiled → Clean after cleaning; Clean → FailedQA if rejected; FailedQA → UnderRepair or Retired; Active → Lost if confirmed lost with a closed investigation window.
    
2.  ContainerEntity cannot transition to Packed unless every GarmentID in ContentsManifestState is in Clean state and not reserved by another CycleEntity.
    
3.  CycleEntity cannot transition to Shipped unless ContainerEntity is Packed and chain-of-custody capture is complete.
    
4.  CycleEntity cannot transition to ReadyForNext until IntakeComplete and CleaningComplete are both satisfied, or until ClosedWithRecovery is declared with an explicit recovery plan.
    

### 1.5 Fit Learning as a First-Class Feedback Loop

1.  FitProfileState is updated only via explicit MemberFeedbackEventEntity records, keyed to GarmentID and CycleID.
    
2.  Allocation decisions must be explainable by stored FitProfileState plus inventory availability; “manual intuition” is permitted only as a logged override with reason codes.
    
3.  Fit learning is constrained by cadence. Feedback collected in cycle $t influences allocation for cycle $t+1 at the earliest, never mid-cycle.
    

### 1.6 Recovery Paths as Normal Operations

1.  Late ReturnPath  
    1.1 Cycle closes as ClosedWithRecovery at the cadence boundary if the container has not returned.  
    1.2 The system issues a RecoveryCycleEntity that accounts for incremental costs (support time, replacement shipping if applicable, incremental inventory buffer consumption).
    
2.  LossPath  
    2.1 MovementLegEntity enters Exception; investigation window is time-bounded; then ContainerEntity and contained GarmentAssetEntities transition to Lost if unresolved.  
    2.2 Loss costs post to the originating CycleEntity and to an aggregate loss ledger.
    
3.  DamagePath  
    3.1 Damage is graded at intake; garments transition to NeedsRepair or Retired; costs post to the cycle that returned them (not to a generic bucket).
    
4.  Human ErrorPath  
    4.1 Mis-pick and mis-label are explicit event types that drive rework, reship, and dissatisfaction risk updates; they are not “silent corrections.”
    

### 1.7 Observability and Controls (No Hidden Debt)

1.  Every cycle posts an atomic CostEventLedgerState: cleaning events, labor events, packaging events, logistics events, exception events, asset write-down events.
    
2.  Every cycle posts an atomic ServiceEarnedState: earned service time and revenue recognition per week.
    
3.  The system exposes leading indicators of compounding efficiency: average turns per garment, queue times by node, and recovery-cycle rate.
    

### Architectural Commitments

The downstream layers are not allowed to violate the following commitments.

1.  $CADENCE_UNIT is fixed at 7 days per active member; cycles may close with recovery, but they may not be skipped or stretched silently.
    
2.  The unit of accountability is $UNIT_OF_ANALYSIS; every cost and failure must be postable to a CycleEntity.
    
3.  Garments and containers are durable, stateful assets with explicit lifecycle transitions, including retirement.
    
4.  Logistics is modeled as explicit legs with custody and exception states; “shipping happened” is not a single undifferentiated event.
    
5.  Fit learning is an explicit feedback loop; allocation is explainable, and overrides are logged with reason codes.
    
6.  Failures and human error are explicit states with recovery workflows and cost events; exceptions are not handled by informal judgment alone.
    

* * *

## Pass Two: Unit-Economics Simulation Model Constrained by the Architecture

This model uses only the Architectural Commitments above. Revenue is time-based. Costs are per-cycle. Variance and human error are explicit through probability and severity parameters that drive expected value and tail risk.

### 2.1 Unit of Analysis and Indexing

1.  The unit of analysis is one CycleEntity for one MemberEntity for one week: $UNIT_OF_ANALYSIS.
    
2.  Simulation indices: member $m ∈ [1..$N_MEMBERS], week $w ∈ [1..$N_WEEKS].
    
3.  Every cycle produces: RevenueEarned(m,w), Cost(m,w), Contribution(m,w), and StateOutcomes(m,w).
    

### 2.2 Revenue Model (Time-Based)

Let $P_WEEK be the subscription price per active member-week.

1.  Earned revenue per cycle is tied to service time, not delivery success. The architecture requires cycles to close; therefore revenue recognition is policy-driven but must be explicit. Two common policy switches exist; the model must simulate both because they materially alter economics.
    
2.  Policy A: “Time Earned” recognition  
    RevenueEarned(m,w) = $P_WEEK × ActiveServiceFraction(m,w)  
    Where ActiveServiceFraction is typically 1.0 unless the subscription is paused/past due.
    
3.  Policy B: “Service Delivered” recognition (stricter)  
    RevenueEarned(m,w) = $P_WEEK × DeliveredFlag(m,w)  
    DeliveredFlag ∈ {0,1} is derived from CycleState reaching Delivered within the week.
    

The model should compute both, because the system may be forced into Policy B by market expectations, disputes, or chargebacks. That is a core fragility surface.

### 2.3 Per-Cycle Cost Structure (Marginal, Postable to CycleEntity)

For each cycle (m,w), define cost events aligned to the architecture’s ledgers.

Let the following be per-cycle random variables or parameters (all can be scalar inputs or distributions).

1.  LogisticsOutCost = $C_SHIP_OUT × (1 + ε_ship_out)
    
2.  LogisticsBackCost = $C_SHIP_BACK × (1 + ε_ship_back)
    
3.  PackagingCost = $C_PACK × (1 + ε_pack)
    
4.  LaborCost  
    LaborCost = $C_LAB_PICK + $C_LAB_PACK + $C_LAB_INTAKE + $C_LAB_QA + $C_LAB_SUPPORT × SupportTouches(m,w)  
    SupportTouches is driven by exception probabilities.
    
5.  CleaningCost  
    CleaningCost = $C_CLEAN_PER_GARMENT × ItemsPerCycle(m,w) × (1 + ε_clean)
    
6.  DamageAndRepairCost  
    DamageAndRepairCost = RepairFlag(m,w) × $C_REPAIR + RetireFlag(m,w) × WriteDownPerRetiredItem  
    Where RepairFlag and RetireFlag are random outcomes.
    
7.  LossCost  
    LossCost = LossFlag(m,w) × (WriteDownPerLostItem + ReplacementProcurementCostPerItem)
    
8.  MispackCost (human error)  
    MispackCost = MispackFlag(m,w) × ($C_REWORK + $C_RESHP + $C_SUPPORT_EXTRA)
    

TotalCost(m,w) = sum of the above.

Contribution(m,w) = RevenueEarned(m,w) − TotalCost(m,w)

### 2.4 Explicit Variance and Human Error Modeling

The architecture requires failures to be explicit states; therefore the simulation must generate those states.

Let the following probabilities be parameters (potentially dependent on member risk flags and operational maturity).

1.  p_late_return = P(ReturnInTransitBack does not reach Received by cadence boundary)
    
2.  p_loss_out = P(MovementLeg out enters LossPath)
    
3.  p_loss_back = P(MovementLeg back enters LossPath)
    
4.  p_damage = P(items returned require repair or retirement)
    
5.  p_failed_QA = P(cleaning results in FailedQA)
    
6.  p_mispack = P(mispick or mislabel events)
    
7.  p_dissatisfaction = P(member dissatisfaction event causing churn risk)
    

Severity variables should also be modeled.

1.  LateDays ∼ distribution with mean $MU_LATE and tail $P99_LATE
    
2.  DamageSeverity ∈ {Minor, Major, Terminal} with mapped costs and retirement likelihood
    
3.  SupportTouches increases with LateDays, MispackFlag, DamageSeverity, and Delivery exceptions.
    

A simple spreadsheet-ready expected value approach is:

ExpectedTotalCost = BaseCost

*   p_late_return × ExpectedLateCost
    
*   (p_loss_out + p_loss_back) × ExpectedLossCost
    
*   p_damage × ExpectedDamageCost
    
*   p_failed_QA × ExpectedQAReworkCost
    
*   p_mispack × ExpectedMispackCost
    

A more faithful simulation uses Monte Carlo draws per cycle for each flag and severity, then aggregates mean, variance, and tail loss.

### 2.5 Inventory Economics Under Weekly Cadence (Capital and Write-Downs)

Because cadence is fixed, the system’s economic viability depends on how many asset turns can be achieved per garment before retirement, and how much buffer inventory is required to absorb cycle-time variance.

Define:

1.  $K = target garments per container per cycle (assortment size)
    
2.  $T_flow = average end-to-end flow time in weeks from “Packed” to “Clean and Ready”
    
3.  $B = buffer factor in weeks to cover variance (lateness, cleaning backlog, loss investigations)
    
4.  GarmentsRequiredPerActiveMember = $K × ($T_flow + $B)
    

TotalGarmentsRequired = $N_MEMBERS × GarmentsRequiredPerActiveMember

If $T_flow rises above 1.0, the system must hold more garments per member. This is not optional under the architecture because cycles cannot be silently stretched; instead, recovery closes cycles and forces buffer consumption. That is the fundamental coupling between failure rates and capital intensity.

Asset write-down per cycle can be represented as:

WriteDownPerCycle = (p_retire × $C_GARMENT_NET) + (p_loss × $C_GARMENT_NET)

Where $C_GARMENT_NET is the net capitalized cost less any residual value assumptions.

### 2.6 Break-Even Thresholds and Compounding Efficiency

Let fixed weekly overhead be $F_WEEK (core team, facility baseline, software overhead if any, insurance, etc.). Do not embed it into per-cycle marginal costs; keep it explicit.

WeeklyContributionTotal(w) = Σ_m Contribution(m,w)  
BreakEvenCondition: WeeklyContributionTotal(w) ≥ $F_WEEK

Compounding efficiency appears when process improvements reduce $T_flow, p_late_return, p_mispack, and p_failed_QA. Under weekly cadence, the first-order compounding mechanism is: lower variance reduces buffer $B, which reduces required inventory, which reduces write-down exposure and capital drag, which further improves per-cycle economics.

### 2.7 Economic Fragility Surfaces Caused by Architectural Commitments

These are not “problems to smooth away.” They are structural.

1.  Cadence rigidity makes lateness expensive twice. First via support and recovery logistics; second via increased buffer inventory needs driven by higher $B and effectively higher $T_flow.
    
2.  Explicit loss states force real write-downs to be recognized rather than amortized quietly. A small increase in loss probability can dominate contribution margin because it converts durable assets into immediate expense.
    
3.  Fit learning is a throughput constraint. If feedback capture or allocation explainability is weak, dissatisfaction and churn rise; churn reduces revenue per unit of inventory held, increasing capital inefficiency.
    
4.  Human error is multiplicative. Mispack events create reship logistics, extra labor, and dissatisfaction risk simultaneously.
    

### Economic Constraints Imposed on Operations

Operations must respect these constraints or the model will fail structurally under the architecture.

1.  $T_flow must remain bounded close to one week. If $T_flow persistently exceeds 1.2 weeks at pilot scale, required inventory per member rises nonlinearly, and capital burden dominates.
    
2.  p_late_return must be kept low enough that buffer $B remains small. If p_late_return drives $B above 0.5 weeks, inventory per member materially increases and write-down exposure grows.
    
3.  Combined loss probability (p_loss_out + p_loss_back) must remain below a strict threshold consistent with contribution margin; otherwise LossCost becomes the primary cost driver and overwhelms time-based revenue.
    
4.  p_mispack and p_failed_QA must be controlled because they create multi-cost cascades (labor + logistics + support + churn).
    
5.  Recovery cycles must be processed within the same cadence framework. “Let it ride” operationally is not permitted because it silently inflates $T_flow and breaks inventory assumptions.
    
6.  Fit feedback capture rate must be high enough to measurably reduce dissatisfaction over successive cycles; otherwise the system pays the cost of complexity without earning the benefit.
    

* * *

## Pass Three: Pilot-Scale Operational Playbook Constrained by Architecture and Economics

$PILOT_SIZE_RANGE=25_to_250_active_members  
$PILOT_MODE=manual_processes_with_logged_overrides  
$GOAL=prove_weekly_cadence_with_circular_integrity_and_positive_contribution_margin

Every step below maps to a system requirement (state transitions, ledger posting) and an economic necessity (controlling $T_flow, loss, damage, mispack, and support touches). Shortcuts that violate cadence, fit learning, or circular integrity are explicitly rejected.

### 3.1 Pilot Operating Rhythm (Weekly Cadence as a Work Calendar)

Define a single pilot anchor day-of-week for cycle boundaries, $ANCHOR_DAY, and enforce it.

1.  Day 1 ($ANCHOR_DAY): Cycle Planning and Risk Gating  
    1.1 Generate the list of members whose cycles begin now: MemberEntity.SubscriptionState must be Active.  
    1.2 For each member, instantiate CycleEntity with CycleState=Planned and bind to a ContainerID reservation.  
    1.3 Apply risk gates based on RiskFlagsState. High-risk members trigger stricter packing verification and earlier shipping cutoffs.  
    1.4 Reject the shortcut of “rolling members whenever returns arrive.” That violates the invariant cadence model and will corrupt $T_flow accounting.
    
2.  Day 2: Picking, Verification, and Packing (Error Prevention)  
    2.1 Select garments only from GarmentAssetEntity.ConditionState=Clean and not reserved.  
    2.2 Perform two-stage verification: picker verification then packer verification against ContentsManifestState.  
    2.3 Seal container, set ContainerState=Packed, post PackagingCost and labor events to CostEventLedgerState.  
    2.4 Reject the shortcut of packing from unverified clean batches. That increases p_failed_QA and p_mispack, creating cost cascades.
    
3.  Day 3: Dispatch and Chain of Custody  
    3.1 Create MovementLegEntity for outbound leg; set LegState=LabelCreated then PickedUp with timestamp.  
    3.2 Set ContainerState=InTransitOut, CycleState=Shipped; post outbound logistics cost.  
    3.3 Daily exception sweep: any LegState=Exception triggers SupportTouches and explicit recovery workflow initiation.
    
4.  Days 4–5: Delivery Confirmation and Wearing Window  
    4.1 Confirm delivered legs; set ContainerState=Delivered, CycleState=Delivered then WearingWindow.  
    4.2 Support scripts are allowed, but every contact must post to SupportTouches (time is money; silence is hidden debt).  
    4.3 Fit feedback prompts occur during WearingWindow, but allocations do not change mid-cycle.
    
5.  Day 6: Return Expected Enforcement  
    5.1 CycleState transitions to ReturnExpected.  
    5.2 Members receive a return instruction tied to ContainerID; the goal is to reduce loss and misrouting.  
    5.3 If a member signals a delay, do not “extend the week” silently. Mark the expected delay and prepare ClosedWithRecovery at boundary if needed.
    
6.  Day 7 (next $ANCHOR_DAY): Boundary Close and Intake Start  
    6.1 For containers received: ContainerState=Received; CycleState transitions toward IntakeComplete as checks finish.  
    6.2 For containers not received: CycleState=ClosedWithRecovery; create RecoveryCycleEntity and begin Late ReturnPath. This preserves the cadence invariant and keeps $T_flow honest.
    

### 3.2 Intake-to-Clean-to-Ready Flow (Controls $T_flow)

1.  Intake (same day as receipt whenever possible)  
    1.1 Open container under controlled station; reconcile ContentsManifestState against physical contents.  
    1.2 If mismatch, trigger Human ErrorPath or LossPath depending on evidence; do not “fix it later.”  
    1.3 Grade garment condition; set ConditionState to Soiled, NeedsRepair, or Retired as applicable; post DamageAndRepairCost events.  
    1.4 Set ContainerState=Quarantined if contamination or anomaly is detected; quarantine is a first-class state to protect downstream QA.
    
2.  Cleaning  
    2.1 Process Soiled → Clean with batch records; post CleaningCost per garment.  
    2.2 Any garment failing cleaning transitions to FailedQA; it cannot be packed. FailedQA must route to UnderRepair or Retired, with costs posted.
    
3.  QA and Return-to-Stock  
    3.1 QA confirms Clean state plus functional integrity.  
    3.2 GarmentAssetEntity becomes available for reservation only after QA passes.  
    3.3 This is the economic choke point: if QA is skipped, p_failed_QA and dissatisfaction rise, and the model breaks via churn and rework.
    

### 3.3 Fit Learning Operations (Without Violating Cadence)

1.  Feedback capture is mandatory, but low-friction capture may not create hidden work. The pilot uses a single standardized feedback form per cycle tied to CycleID and GarmentIDs.
    
2.  FitProfileState updates occur in a scheduled batch after the cycle boundary.
    
3.  Manual overrides to allocation are allowed only with logged reason codes and must be reviewable in $WEEKLY_REVIEW.
    

### 3.4 Exception and Recovery Playbooks (Failure is Normal)

1.  Late ReturnPath (primary economic risk)  
    1.1 On boundary close, create RecoveryCycleEntity and mark the member’s RiskFlagsState.  
    1.2 Do not ship a second full kit automatically. If shipped, it must be treated as a deliberate economic decision with explicit incremental inventory exposure recorded.  
    1.3 If lateness persists beyond a defined window $LATE_WINDOW_DAYS, enforce subscription state actions (pause or deposit requirement if allowed by policy), because otherwise $B expands and capital collapses margins.
    
2.  LossPath  
    2.1 When a leg enters Exception, start a time-bounded investigation workflow.  
    2.2 After the window, mark the container and garments Lost, post write-down, and adjust buffer planning.  
    2.3 Replace inventory only if break-even math still holds; otherwise reduce active members to protect contribution margin.
    
3.  DamagePath  
    3.1 Grade damage at intake and decide immediately: repair versus retire.  
    3.2 Repairs must have a turnaround target aligned to $T_flow. If repairs routinely exceed the cadence window, inventory requirements inflate.
    
4.  Human ErrorPath (mispack/mislabel)  
    4.1 When detected, log event type, root cause code, and rework steps.  
    4.2 Rework is processed as a costed recovery action, not an informal correction.  
    4.3 A mispack that reaches the member is treated as both a logistics cost and a churn risk update, because economically it is.
    

### 3.5 Pilot Governance: Weekly Review as a Control Loop

A weekly control meeting ($WEEKLY_REVIEW) is mandatory because compounding efficiency is the only path to durable margins in a cadence-locked circular system.

1.  Review $T_flow and its components: outbound transit, wear window compliance, return transit, intake queue, cleaning queue, QA queue.
    
2.  Review p_late_return, p_loss_out, p_loss_back, p_damage, p_failed_QA, p_mispack, and SupportTouches per cycle.
    
3.  Review per-cycle contribution distribution, not just averages; tail losses determine survivability.
    
4.  Review inventory per member: GarmentsRequiredPerActiveMember relative to the model’s target; if it rises, scaling should pause.
    

### Pilot Exit Criteria

Scaling, pausing, or terminating is determined by signals tied directly to the architectural and economic constraints.

1.  Scale criteria (proceed toward larger cohorts)  
    1.1 $T_flow remains near one week with stable variance; queues do not trend upward week-over-week.  
    1.2 Loss and damage rates are low enough that write-downs do not dominate contribution margin.  
    1.3 Mispack and FailedQA rates trend downward through process learning, not through suppression.  
    1.4 Contribution per member-week is positive under the stricter revenue policy (Policy B) for a sustained window $SCALE_WINDOW_WEEKS, indicating resilience to disputes and delivery failures.  
    1.5 Fit feedback capture and allocation explainability demonstrably reduce dissatisfaction and support touches over successive cycles.
    
2.  Pause criteria (stabilize before adding members)  
    2.1 $T_flow drifts upward or becomes volatile, increasing required inventory per member.  
    2.2 SupportTouches per cycle rises, indicating hidden operational debt is accumulating.  
    2.3 Cleaning/QA backlog becomes the binding constraint and threatens cadence closure quality.
    
3.  Termination criteria (structural non-viability at pilot scale)  
    3.1 Combined loss probability and write-downs consistently exceed the margin available from time-based revenue, even after process corrections.  
    3.2 Late return behavior forces buffer $B to expand such that GarmentsRequiredPerActiveMember becomes economically untenable under constrained capital.  
    3.3 The system cannot maintain weekly cadence without either skipping cycles (forbidden) or shipping unverified/unclean inventory (forbidden), indicating a structural mismatch between throughput and promise.
    

* * *

## Cross-Layer Consistency Check

The architecture, economics, and operations do not contradict one another because they share the same binding unit and the same invariant cadence. Architecture enforces stateful entities and explicit cycle closure; economics prices and costs those same state transitions per $UNIT_OF_ANALYSIS; operations executes only those transitions and treats failures as normal state progressions (ClosedWithRecovery), preserving cadence while keeping $T_flow and buffer consumption observable rather than hidden.

The single weakest assumption in the entire stack is behavioral compliance with returns under a rigid weekly cadence. If real-world lateness is materially higher than modeled, the architecture forces the truth to surface as recovery cycles and increased buffer needs; economics then converts that into higher required inventory per member and higher write-down exposure; operations cannot “paper over” it without violating cadence or circular integrity. Consequently, return compliance is the primary make-or-break variable that must be proven, instrumented, and governed from the first pilot week.

