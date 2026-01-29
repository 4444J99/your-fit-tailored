## Q: 
You are an operating partner tasked with launching a pilot-scale version of a circular, weekly apparel subscription service. Your task is to produce a PILOT-SCALE OPERATIONAL PLAYBOOK that can run with limited capital, constrained inventory, and manual overrides while preserving system integrity. The playbook must: – Assume 25–250 active users. – Assume imperfect automation and human-in-the-loop processes. – Preserve the theoretical invariants of cadence, fit learning, and circular reuse. – Be executable by a small team without specialized infrastructure. Produce: 1. A clear definition of pilot objectives and success criteria. 2. Day-to-day operational flow for one weekly cycle, end to end. 3. Roles and responsibilities required to operate the pilot. 4. Explicit fallback procedures for late returns, lost boxes, damaged garments, and user dissatisfaction. 5. Instrumentation and metrics required to decide whether the pilot graduates, pivots, or shuts down. 6. A section titled “What We Intentionally Do Not Automate Yet” with justification. Avoid aspirational language. Assume mistakes will happen. Optimize for learning velocity and survival, not elegance.

## A: 
# Pilot-Scale Operational Playbook for a Weekly Circular Apparel Subscription

`$DOC_ID=playbook_ops_pilot_v0_9`  
`$PILOT_USER_RANGE=25..250`  
`$PILOT_PRINCIPLE=survive_and_learn_fast`  
`$CADENCE_INVARIANT=weekly_dispatch_per_user`  
`$FIT_INVARIANT=every_cycle_produces_fit_signal`  
`$CIRCULARITY_INVARIANT=every_garment_has_state_and_lifecycle`

## 1. Pilot objectives and success criteria

The pilot exists to validate whether a weekly cadence service can maintain circular inventory integrity under real-world variance using a small team, constrained inventory, and human-in-the-loop decisioning. The pilot is not designed to maximize style breadth or personalization depth; it is designed to prove repeatability, cost discipline, and recoverability when users behave imperfectly and operations make mistakes.

Success is defined by achieving three outcomes simultaneously within `$PILOT_RUN_WEEKS` while operating inside `$WORKING_CAPITAL_CAP` and `$INVENTORY_CAP`. First, cadence integrity: at least `$CADENCE_ON_TIME_TARGET_PCT` of users receive their weekly box on the promised day window, and cadence misses do not compound (a miss triggers a contained recovery path that returns the user to normal cadence within `$RECOVERY_MAX_DAYS`). Second, circular integrity: inventory state is always knowable, meaning every garment and box is in exactly one operational state at any time, with an auditable chain of custody, and loss/damage does not exceed `$LOSS_DMG_MAX_PCT_PER_CYCLE`. Third, fit learning velocity: the system captures enough feedback per cycle to reduce “dissatisfaction-driven support contacts” and increase “keep-rate within the service” (not retail keep) by cohort, with measurable improvement by week `$LEARNING_INFLECTION_WEEK`.

“Graduate” means the unit economics and failure rates are stable enough to justify investment in automation and inventory expansion, with predictable staffing load. “Pivot” means cadence is technically feasible but the product/operations shape must change (for example, fewer SKUs, different garment categories, different cadence, different packaging constraint). “Shut down” means cadence cannot be maintained without unacceptable loss or labor cost, or user sentiment indicates the value proposition is not real at this price point.

## 2. Day-to-day operational flow for one weekly cycle, end to end

This is the minimum viable weekly cycle that preserves the invariants while allowing manual overrides. The cycle uses a fixed dispatch day for all users in a cohort to reduce cognitive load and chaos. Users are segmented into cohorts to smooth labor peaks.

Core IDs and logs are mandatory. Every physical object is labeled and every movement is logged. `Garment` uses `$GARMENT_ID`, `Box` uses `$BOX_ID`, user-week cycle uses `$CYCLE_ID`, and every exception uses `$EXCEPTION_ID`. All work is recorded in `$OPS_LEDGER` stored at `$OPS_LOG_PATH`, even if the “system” is just a spreadsheet plus a shared folder at `$OPS_DRIVE_ROOT`.

### Weekly cadence structure

You operate in repeating “waves” so a small team can handle volume without breaking quality. A practical setup is `$COHORT_COUNT=2..4` cohorts, each with its own `$COHORT_SHIP_DOW`. Every user has a fixed ship day in their cohort, which is the cadence anchor.

### End-to-end flow for a cohort ship day

| Relative day | Operational objective | Non-negotiable outputs (must be true in logs) |
| --- | --- | --- |
| `$D_MINUS_2` | Plan and reserve inventory | Each active user has a provisional set with `$GARMENT_ID`s reserved; shortages produce a controlled substitution record in `$SUBSTITUTION_LOG`. |
| `$D_MINUS_1` | Pick, QC, pack, label | Each box has a packed manifest; each garment state becomes `IN_BOX_$CYCLE_ID`; each box state becomes `READY_TO_DISPATCH`. |
| `$D0` | Dispatch and notify | Each box is scanned to `IN_TRANSIT_OUTBOUND`; user receives the same structured message template; support queue is pre-loaded with likely issues. |
| `$D_PLUS_1..$D_PLUS_3` | Wear window and feedback capture | Each user receives a friction-minimized feedback request; fit signals are recorded to `$FIT_SIGNAL_TABLE` even if sparse. |
| `$D_PLUS_2..$D_PLUS_5` | Returns intake, cleaning, QA, restock | Returns are scanned to `IN_TRANSIT_INBOUND` then `RECEIVED`; cleaning produces `CLEANED` and QA produces `AVAILABLE` or `QUARANTINED`. |
| Continuous | Exceptions and recovery | Every exception enters `$EXCEPTION_TRIAGE_QUEUE` with SLA and resolution path. |

### Detailed daily operating procedure (for one cohort)

`$D_MINUS_2` (Planning and reservation) runs as a controlled batch. You pull the cohort roster from `$ACTIVE_USER_TABLE` and freeze it at `$CUTOFF_TIME_LOCAL`. Any user changes after cutoff enter the next cycle unless they are in `$EXCEPTION_CLASS=SAFETY_OR_MEDICAL` or you explicitly approve a manual override with `$OVERRIDE_REASON`. You generate a draft allocation per user using the simplest workable logic: “fit-safe basics + one exploration item,” constrained by available sizes and condition grade. For each user you must produce `$PACK_PLAN_RECORD` containing the reserved garment IDs, the user’s constraints, and the rationale code `$RATIONALE_CODE` so learning is traceable. If inventory cannot satisfy the plan, you record a substitution using `$SUBSTITUTION_REASON` and you downgrade the promise rather than silently improvising.

`$D_MINUS_1` (Pick, QC, pack) is a physical assembly line even if staffed by two people. Pick uses the reservation list; every garment is scanned out of its location into the cycle. QC is not subjective styling review; it is a binary gate: pass/fail against cleanliness, odor, stains, tears, pilling threshold, zipper/button function, and correct label/size. Failing items go to `QUARANTINE` with `$QC_FAIL_CODE` and do not enter boxes. Packing includes a printed or handwritten manifest with `$CYCLE_ID`, garment IDs, and a return instruction card that is identical every week to reduce user error. Boxes are closed only after a second-person verification or, if single-staffed, a forced self-check with a timestamped photo saved to `$PACK_PROOF_PATH/$CYCLE_ID`.

`$D0` (Dispatch) is a scan-and-confirm ritual. You do not hand a box to the carrier without scanning it to `IN_TRANSIT_OUTBOUND` and verifying the label matches the user and cohort. The user notification is operational, not marketing: it includes the expected arrival window, what to do if it does not arrive, and the return expectation. You also open a “first 24 hours watchlist” in `$DELIVERY_RISK_QUEUE` for address issues, prior late returns, and first-time users.

`$D_PLUS_1..$D_PLUS_3` (Feedback capture) is executed as a low-friction, structured prompt that yields fit learning even if the user provides minimal input. You capture at least `$MIN_FIT_SIGNAL_FIELDS` per item: “fit tight/ok/loose,” “comfort low/med/high,” “wore yes/no,” and “issue code if no.” If the user does nothing, you still record a null response explicitly as `$FIT_SIGNAL=NULL_CONFIRMED` to avoid confusing missing data with system failure.

`$D_PLUS_2..$D_PLUS_5` (Returns intake and reprocessing) begins the moment inbound boxes appear. Intake is a three-step gate: scan box to `RECEIVED`, scan each garment to `RETURNED_DIRTY`, reconcile against manifest, and immediately open an exception if anything is missing. Cleaning is treated as a production step with a batch log `$CLEANING_BATCH_ID` that records method, date/time, operator, and any issues found. After cleaning, QA assigns condition grade `$CONDITION_GRADE=A/B/C/RETIRED_PENDING` and routes garments to `AVAILABLE`, `REPAIR_QUEUE`, or `RETIREMENT_QUEUE`. Restock is not complete until the location is recorded in `$LOCATION_TABLE` so picking stays deterministic.

Continuous exception handling runs off one queue: `$EXCEPTION_TRIAGE_QUEUE`. Every exception has an owner, SLA, and next action. The queue is reviewed twice daily at `$TRIAGE_TIME_1` and `$TRIAGE_TIME_2` so surprises do not silently accumulate into a cadence collapse.

## 3. Roles and responsibilities required to operate the pilot

You staff to functions, not titles. One person can cover multiple functions at low volume, but ownership must remain explicit in logs.

| Function (`$ROLE_ID`) | Primary responsibility | Practical staffing at 25–75 users | Practical staffing at 75–250 users |
| --- | --- | --- | --- |
| `$ROLE=OPS_LEAD` | Owns cadence, cutoffs, and exception arbitration; protects invariants | 1 part-time to full-time | 1 full-time |
| `$ROLE=INVENTORY_CONTROLLER` | Owns garment/box state truth, audits, and shrink control | 0.5 FTE | 1 FTE |
| `$ROLE=PACK_QC_OPERATOR` | Picking, QC, packing proof, dispatch scan | 1 FTE equivalent | 2–4 FTE equivalent (staggered by cohorts) |
| `$ROLE=CLEANING_QA_OPERATOR` | Cleaning batches, QA grading, repair triage | 0.5–1 FTE | 1–2 FTE |
| `$ROLE=USER_SUPPORT` | Manages dissatisfaction, late returns, address issues; captures structured signals | 0.25–0.5 FTE | 1 FTE |
| `$ROLE=DATA_STEWARD` | Maintains `$OPS_LEDGER`, metrics, weekly reporting, cohort analysis | shared with Ops Lead | 0.5 FTE |

The operational rule is that “state truth” is never owned by support, marketing, or styling. State truth is owned by `$ROLE=INVENTORY_CONTROLLER` and enforced by scan/log discipline. If you do not enforce this, the pilot will appear to function until it abruptly collapses from hidden shrink and compounding exceptions.

## 4. Explicit fallback procedures

Fallbacks are designed to protect cadence and circular integrity, even at the cost of short-term delight. Each fallback produces a traceable record and forces a decision: recover, charge (if your contract allows), or churn the user intentionally.

### Late returns (`$EXCEPTION_CLASS=LATE_RETURN`)

Trigger condition is `$RETURN_DUE_DATE` missed by `$LATE_GRACE_DAYS`. Immediate action is to freeze the next cycle’s “exploration item” and ship a minimal, inventory-safe set only if you have surplus; otherwise you hold shipment and send a cadence-preserving message: “Your next dispatch resumes when the prior box is scanned inbound.” This is strict because the model is circular. Operationally, you set user state to `$USER_STATE=RETURN_BLOCKED` and open `$EXCEPTION_ID` with reason code `$LATE_REASON_UNKNOWN` unless the user provides one. Resolution requires one of three closures: inbound scan occurs and user returns to normal; user enters a managed pause `$USER_STATE=PAUSED` with revised cadence; or user is offboarded `$USER_STATE=ENDED` if repeated.

### Lost outbound box (`$EXCEPTION_CLASS=LOST_OUTBOUND`)

Trigger condition is carrier scan stalls beyond `$OUTBOUND_STALL_HOURS` or user reports non-receipt after `$DELIVERY_WINDOW_END`. Action sequence is deterministic. First, verify address and scan history in `$SHIPMENT_LOG`. Second, start a trace with the carrier while simultaneously initiating a “shadow replacement” plan that does not reuse scarce items: you pack from buffer stock flagged `$REPLACEMENT_ELIGIBLE=TRUE`. Third, you mark the original box state as `AT_RISK_LOST` and freeze its garments from being double-counted. If the original later arrives, you reconcile by scanning it as `RECOVERED` and decide whether to reclaim items next cycle. If it never arrives within `$LOST_FINALIZE_DAYS`, you close the exception by marking garments `LOST` and box `LOST`, and you update shrink metrics.

### Lost inbound return (`$EXCEPTION_CLASS=LOST_INBOUND`)

Trigger condition is user shows proof of drop-off or scan, but inbound is stalled past `$INBOUND_STALL_DAYS`. You do not accuse the user; you open the exception, mark the box as `AT_RISK_LOST_INBOUND`, and you prevent inventory from assuming those garments exist. If your contract uses deposits or fees, you delay any enforcement until `$LOST_FINALIZE_DAYS` and only apply it if the scan chain supports loss. Operationally, the important point is to protect inventory truth and avoid shipping commitments that rely on missing items.

### Damaged garments (`$EXCEPTION_CLASS=DAMAGE`)

Damage is handled as condition grading plus a user-friction policy. On intake QA, any damage above `$DAMAGE_THRESHOLD_MINOR` routes to `REPAIR_QUEUE` or `RETIREMENT_QUEUE`. You record `$DAMAGE_CODE` and, if user-caused is plausible, you still avoid debate in early pilot; you focus on learning. You track repeat damage by user and garment category. If repeat damage crosses `$USER_DAMAGE_RATE_MAX`, you move the user into a “restricted assortment” and/or revise contract terms at renewal, or you intentionally churn if the economics cannot support that behavior. The pilot must learn which categories are fragile under real usage.

### User dissatisfaction (`$EXCEPTION_CLASS=USER_DISSAT`)

Dissatisfaction is treated as a service failure to capture signals, not as a stylistic argument. Your resolution ladder is three steps. Step one is “fast acknowledgment + structured diagnosis,” captured in `$DISSAT_REASON_CODE` (fit, comfort, style mismatch, quality, hygiene, expectation mismatch, logistics). Step two is “next-cycle corrective action” expressed as an explicit change to their profile `$PROFILE_DELTA` (size shift, cut preference, fabric avoidance, category ban, sensory flags). Step three is “make-good” bounded by `$MAKEGOOD_CAP`: either an extra item next cycle if inventory allows, a one-time credit, or a pause offer. You do not provide unlimited make-goods; you provide controlled remedies and measure whether remedies reduce future contacts.

## 5. Instrumentation and metrics for graduate, pivot, or shut down

Instrumentation is designed to answer one question: “Is this service stable under variance at this scale with this team and inventory?” You track leading indicators that predict cadence collapse and unit economics failure, not vanity engagement.

The pilot dashboard at `$DASHBOARD_PATH` is updated weekly at `$WEEKLY_REVIEW_TIME`. At minimum it includes: cadence performance, inventory integrity, reprocessing throughput, exception load, user sentiment, and economic contribution by cohort.

Cadence metrics include `$ON_TIME_DELIVERY_PCT`, `$ON_TIME_DISPATCH_PCT`, `$RECOVERY_TIME_P50_P90`, and `$CYCLE_SLIP_RATE` (users who fall out of weekly rhythm). Inventory integrity metrics include `$SHRINK_PCT_PER_CYCLE`, `$MISSING_ITEM_RATE`, `$STATE_MISMATCH_COUNT` found in audits, and `$RETIREMENT_RATE`. Reprocessing metrics include `$CLEANING_TAT_HOURS` (return to available), `$QC_FAIL_RATE`, `$REPAIR_BACKLOG_COUNT`, and `$THROUGHPUT_ITEMS_PER_LABOR_HOUR`. Exception metrics include `$EXCEPTIONS_PER_100_CYCLES` and `$OPEN_EXCEPTIONS_AGE_P90`, because unresolved exceptions compound. User metrics include `$SUPPORT_CONTACT_RATE`, `$DISSAT_RATE`, `$PAUSE_RATE`, `$CHURN_RATE`, and a simple `$NPS_LIKE_SCORE` only if it correlates with churn and contact rate. Economics for survival include `$CONTRIB_MARGIN_PER_USER_WEEK` (subscription revenue minus variable cycle costs), `$COST_PER_CYCLE`, `$COST_PER_EXCEPTION`, and `$LABOR_COST_PER_BOX`.

Graduation criteria is reached if the following hold for `$STABILITY_WEEKS` consecutively: cadence targets met without overtime spikes, shrink and damage within bounds, cleaning throughput keeps up without backlog growth, exceptions per cycle trend down or remain flat as user count rises, and contribution margin remains non-negative after including a realistic allowance for shrink and rework. Pivot criteria is reached if cadence is stable but any one of: economics require a price change, certain garment categories are structurally unworkable, user dissatisfaction concentrates in a solvable segment mismatch, or labor scales superlinearly with users due to process design. Shutdown criteria is reached if you cannot maintain cadence without persistent deficit, shrink exceeds bounds despite process enforcement, or support load indicates the value proposition is not being delivered even after corrective learning cycles.

## 6. What We Intentionally Do Not Automate Yet

You avoid automation that creates hidden brittleness, false precision, or debugging debt. In early pilot, you want high observability and low coupling.

You do not automate “styling intelligence” beyond simple rules because the objective is to learn operational truth and preference structure, not to build a fragile recommender that masks inventory constraints. You use `$RATIONALE_CODE` and manual selection so you can later train or formalize logic with real outcomes.

You do not automate exception adjudication because edge cases define whether the model survives. Automated decisions will be wrong in early pilot and will erode trust and inventory truth. Instead, you enforce a single exception queue with explicit ownership and resolution codes, creating labeled data for future automation.

You do not automate garment condition grading because early pilot needs human QA to establish what “acceptable” means and to quantify how cleaning and wear affect lifespan. You standardize grading with a rubric, but you keep the judgment manual until inter-rater consistency is proven with audits at `$AUDIT_FREQUENCY`.

You do not automate inventory state transitions without scan discipline. Any “auto transition” that guesses location or status will corrupt the ledger under real-world variance. The only acceptable automation is one that is strictly derived from an explicit scan or a completed checklist artifact.

You do not automate refunds/credits beyond a bounded make-good policy because you need to understand the causal drivers of dissatisfaction and their economic weight. Early automatic credits turn learning events into unstructured leakage.

You do not automate user profile updates from free-text. You constrain inputs into structured fields so fit learning remains machine-usable later. Free-text can exist as a note, but it cannot be the source of truth for sizing and constraints.

## Operational invariants enforcement mechanism

Cadence is protected by hard cutoffs, cohort batching, and recovery rules that prevent one late return from creating a cascade. Fit learning is protected by forcing a minimum signal capture per cycle, even if null. Circular reuse is protected by state truth discipline: a garment is never “assumed available,” it is made available only by a completed chain of custody from return through cleaning through QA through restock.

If you want, I can convert this into a set of copy/paste SOP sheets stored as `$SOP_PACKING`, `$SOP_INTAKE`, `$SOP_CLEANING`, `$SOP_EXCEPTION_TRIAGE`, and `$WEEKLY_REVIEW_TEMPLATE`, each written as a one-page procedure with exact check fields matching the logs.

## Q: 
convert this into a set of copy/paste SOP sheets stored as $SOP_PACKING, $SOP_INTAKE, $SOP_CLEANING, $SOP_EXCEPTION_TRIAGE, and $WEEKLY_REVIEW_TEMPLATE, each written as a one-page procedure with exact check fields matching the logs

## A: 
`$SOP_PACKING=$OPS_DOC_ROOT/sop_packing_v1_0.md`  
`$SOP_INTAKE=$OPS_DOC_ROOT/sop_intake_v1_0.md`  
`$SOP_CLEANING=$OPS_DOC_ROOT/sop_cleaning_v1_0.md`  
`$SOP_EXCEPTION_TRIAGE=$OPS_DOC_ROOT/sop_exception_triage_v1_0.md`  
`$WEEKLY_REVIEW_TEMPLATE=$OPS_DOC_ROOT/weekly_review_template_v1_0.md`

```markdown
# $SOP_PACKING
$DOC_ID=sop_packing_v1_0
$OWNER_ROLE=$ROLE_PACK_QC_OPERATOR
$BACKUP_ROLE=$ROLE_OPS_LEAD
$FREQUENCY=per_cohort_cycle
$GOAL=Pick+QC+Pack+Dispatch-ready boxes with auditable state truth
$INVARIANTS=$CADENCE_INVARIANT;$CIRCULARITY_INVARIANT;$FIT_INVARIANT
$INPUTS=$PACK_PLAN_RECORD;$LOCATION_TABLE;$QC_RUBRIC;$MANIFEST_TEMPLATE
$OUTPUTS=$PACK_PROOF_PATH/$CYCLE_ID; $OPS_LEDGER entries; box state READY_TO_DISPATCH

## Scope
This SOP covers pick, QC, pack, and dispatch-ready staging for one cohort ship day. No box leaves without scan+manifest reconciliation.

## Preconditions (must be true before starting)
[ ] $CYCLE_ID roster frozen at $CUTOFF_TIME_LOCAL in $ACTIVE_USER_TABLE
[ ] Reservations created in $PACK_PLAN_RECORD for each user in cohort
[ ] Printer/labels available OR handwritten manifest stock available
[ ] Scanner/phone camera functional for proof capture to $PACK_PROOF_PATH
[ ] Empty boxes with $BOX_ID labels available and counted

## Workstation setup checklist
[ ] Open $PACK_PLAN_RECORD filtered by Cohort + $SHIP_DATE
[ ] Open $LOCATION_TABLE (latest)
[ ] Open $OPS_LEDGER (today tab/section)
[ ] Prepare QC station (lighting, lint roller, measuring tape, stain pen not used for concealment)
[ ] Prepare packing station (manifest cards, return instruction cards, polybags as needed)

## Procedure (repeat per user)
### Step 1 — Identify cycle and box
Field entry (required)
$CYCLE_ID=__________
$USER_ID=__________
$COHORT_ID=__________
$BOX_ID=__________
$SHIP_DATE=__________
$OPERATOR_ID=__________
$START_TS_LOCAL=__________

Checks
[ ] $BOX_ID exists and is physically labeled
[ ] $BOX_ID is not currently assigned to any other open $CYCLE_ID in $OPS_LEDGER

### Step 2 — Pick (scan-based)
For each reserved garment in $PACK_PLAN_RECORD:
Field entry (repeat lines as needed)
$GARMENT_ID_01=__________  $PICK_LOCATION_01=__________  $SCAN_TS_01=__________
$GARMENT_ID_02=__________  $PICK_LOCATION_02=__________  $SCAN_TS_02=__________
$GARMENT_ID_03=__________  $PICK_LOCATION_03=__________  $SCAN_TS_03=__________
$GARMENT_ID_04=__________  $PICK_LOCATION_04=__________  $SCAN_TS_04=__________
$GARMENT_ID_05=__________  $PICK_LOCATION_05=__________  $SCAN_TS_05=__________

Checks
[ ] Each $GARMENT_ID scanned out of its location and recorded
[ ] If any reserved item missing, open substitution record before proceeding:
$SUBSTITUTION_LOG_ENTRY_CREATED=[ ] yes  [ ] no
If yes: $SUBSTITUTION_REASON=__________  $SUB_GARMENT_ID=__________  $RATIONALE_CODE=__________

Ledger writes (required, per garment)
[ ] Write to $OPS_LEDGER: $GARMENT_ID → state=IN_PICKING $CYCLE_ID

### Step 3 — QC gate (binary pass/fail)
QC rubric checks (per garment)
[ ] Cleanliness/odor pass
[ ] Stain pass
[ ] Tears/seams pass
[ ] Pilling threshold pass
[ ] Closure function pass (zip/button)
[ ] Correct label/size verified
[ ] Safety check pass (no sharps, pins, allergens residue where relevant)

If FAIL:
$QC_FAIL=[ ] yes  [ ] no
If yes: $QC_FAIL_CODE=__________  $GARMENT_ID=__________
Actions
[ ] Move garment to QUARANTINE bin
[ ] Write to $OPS_LEDGER: $GARMENT_ID → state=QUARANTINED; $QC_FAIL_CODE
[ ] Create substitution entry (required) and return to Step 2 for replacement

If PASS:
[ ] Write to $OPS_LEDGER: $GARMENT_ID → state=APPROVED_FOR_PACK $CYCLE_ID

### Step 4 — Pack and manifest
Manifest fields (must match box contents exactly)
$MANIFEST_ID=__________
$BOX_ID=__________
$CYCLE_ID=__________
$USER_ID=__________
$GARMENT_ID_LIST=(comma)=____________________________________
$COUNT_ITEMS=______

Checks
[ ] Manifest printed/handwritten and placed in box
[ ] Standard return instruction card placed in box
[ ] Items folded/bagged per category to reduce damage
[ ] Box weight/feel check (sanity)

Ledger writes (required)
[ ] Write to $OPS_LEDGER: $BOX_ID → state=PACKED; $MANIFEST_ID
[ ] Write to $OPS_LEDGER: each $GARMENT_ID → state=IN_BOX_$CYCLE_ID

### Step 5 — Packing proof
Proof capture fields
$PACK_PROOF_PHOTO=[ ] captured  [ ] not possible
$PACK_PROOF_PATH=$PACK_PROOF_PATH/$CYCLE_ID/__________
$PROOF_TS_LOCAL=__________

Checks
[ ] Photo shows open box + visible garment stack + manifest
[ ] Upload saved to correct folder path

### Step 6 — Label and stage for dispatch
Shipping fields
$SHIP_LABEL_ID=__________
$CARRIER=__________
$TRACKING_ID=__________

Checks
[ ] Label matches $USER_ID shipping address record
[ ] Tracking captured (photo or scan)
[ ] Box staged in “READY_TO_DISPATCH” area with cohort tag

Ledger writes (required)
[ ] Write to $OPS_LEDGER: $BOX_ID → state=READY_TO_DISPATCH; $TRACKING_ID

## Dispatch scan ritual (batch at handoff)
Batch fields
$DISPATCH_BATCH_ID=__________
$HANDOFF_TS_LOCAL=__________
$HANDOFF_OPERATOR_ID=__________

Checks per box
[ ] Scan $BOX_ID at handoff
[ ] Write to $OPS_LEDGER: $BOX_ID → state=IN_TRANSIT_OUTBOUND; $HANDOFF_TS_LOCAL
[ ] Send user notification template ID: $NOTIFY_TEMPLATE_ID=__________ recorded

## Stop conditions (do not proceed)
If any of these occur, stop and escalate to $ROLE_OPS_LEAD:
[ ] Any unlogged garment movement is discovered
[ ] Any box cannot be reconciled to a single $CYCLE_ID
[ ] QC failures exceed $QC_FAIL_SPIKE_THRESHOLD in a batch
```
```markdown
# $SOP_INTAKE
$DOC_ID=sop_intake_v1_0
$OWNER_ROLE=$ROLE_INVENTORY_CONTROLLER
$BACKUP_ROLE=$ROLE_CLEANING_QA_OPERATOR
$FREQUENCY=daily_inbound_window
$GOAL=Receive returns, reconcile manifests, and restore inventory truth
$INVARIANTS=$CIRCULARITY_INVARIANT;$CADENCE_INVARIANT
$INPUTS=$SHIPMENT_LOG;$MANIFEST_TEMPLATE;$OPS_LEDGER;$EXCEPTION_TRIAGE_QUEUE
$OUTPUTS=Updated garment+box states; exceptions opened when mismatches occur

## Scope
This SOP covers inbound boxes from arrival to “RETURNED_DIRTY” garment state and routing to cleaning.

## Preconditions
[ ] Intake table cleared and labeled bins ready: RECEIVED / MISMATCH / QUARANTINE / CLEANING_QUEUE
[ ] Open $SHIPMENT_LOG and $OPS_LEDGER (today section)
[ ] Exception form accessible ($EXCEPTION_TRIAGE_QUEUE)

## Procedure (repeat per inbound box)
### Step 1 — Identify and receive box
Required fields
$RECEIVE_TS_LOCAL=__________
$BOX_ID=__________
$TRACKING_ID=__________
$OPERATOR_ID=__________

Checks
[ ] Scan/record $BOX_ID
[ ] Confirm $BOX_ID exists in $OPS_LEDGER and shows IN_TRANSIT_INBOUND or expected return

Ledger writes (required)
[ ] $OPS_LEDGER: $BOX_ID → state=RECEIVED; $RECEIVE_TS_LOCAL

### Step 2 — Open box and pull manifest
Manifest fields
$MANIFEST_PRESENT=[ ] yes  [ ] no
If yes: $MANIFEST_ID=__________  $CYCLE_ID=__________  $USER_ID=__________

If no manifest:
Actions
[ ] Create $EXCEPTION_ID immediately
$EXCEPTION_CLASS=MISSING_MANIFEST
$EXCEPTION_ID=__________
$EXCEPTION_OWNER=$ROLE_INVENTORY_CONTROLLER
$SLA_HOURS=______
$NOTES=____________________________________

### Step 3 — Reconcile garments (scan every item)
Reconciliation table (repeat lines)
$GARMENT_ID_01=__________  $FOUND=[ ] yes [ ] no  $CONDITION_NOTE_01=__________
$GARMENT_ID_02=__________  $FOUND=[ ] yes [ ] no  $CONDITION_NOTE_02=__________
$GARMENT_ID_03=__________  $FOUND=[ ] yes [ ] no  $CONDITION_NOTE_03=__________
$GARMENT_ID_04=__________  $FOUND=[ ] yes [ ] no  $CONDITION_NOTE_04=__________
$GARMENT_ID_05=__________  $FOUND=[ ] yes [ ] no  $CONDITION_NOTE_05=__________

If extra/unexpected garments found:
$UNEXPECTED_GARMENT_ID_01=__________
$UNEXPECTED_GARMENT_ID_02=__________

Ledger writes (required, per garment found)
[ ] $OPS_LEDGER: $GARMENT_ID → state=RETURNED_DIRTY; $BOX_ID; $RECEIVE_TS_LOCAL

### Step 4 — Mismatch handling
If any expected garment is missing OR any unexpected garment exists:
Open exception (required)
$EXCEPTION_ID=__________
$EXCEPTION_CLASS=[ ] MISSING_ITEM [ ] UNEXPECTED_ITEM [ ] BOTH
$USER_ID=__________
$CYCLE_ID=__________
$BOX_ID=__________
$MISSING_GARMENT_IDS=(comma)=________________________
$UNEXPECTED_GARMENT_IDS=(comma)=_____________________
$EVIDENCE_PHOTO=[ ] captured
$EVIDENCE_PATH=$OPS_DRIVE_ROOT/evidence/$EXCEPTION_ID/__________
$NEXT_ACTION=[ ] user_contact [ ] carrier_trace [ ] internal_search
$EXCEPTION_OWNER=__________
$SLA_HOURS=______

Immediate actions
[ ] Put box contents in MISMATCH bin with $EXCEPTION_ID tag
[ ] Do not move items to cleaning until exception record exists

### Step 5 — Route to cleaning queue
Cleaning routing fields
$CLEANING_QUEUE_BIN=__________
$CLEANING_PRIORITY=[ ] normal [ ] urgent_for_next_cycle
$READY_FOR_CLEANING_TS_LOCAL=__________

Checks
[ ] All found garments are tagged/contained to avoid mixing across boxes
[ ] Box is emptied and inspected for stray items

Ledger writes (required)
[ ] $OPS_LEDGER: $BOX_ID → state=EMPTY_AWAITING_QC; $READY_FOR_CLEANING_TS_LOCAL

## End-of-day intake closeout
Batch fields
$INTAKE_BATCH_ID=__________
$BATCH_START_TS=__________
$BATCH_END_TS=__________
$TOTAL_BOXES_RECEIVED=______
$TOTAL_GARMENTS_RECEIVED=______
$TOTAL_EXCEPTIONS_OPENED=______

Checks
[ ] Count reconciliation matches ledger totals
[ ] Any open mismatches handed off in $EXCEPTION_TRIAGE_QUEUE
```
```markdown
# $SOP_CLEANING
$DOC_ID=sop_cleaning_v1_0
$OWNER_ROLE=$ROLE_CLEANING_QA_OPERATOR
$BACKUP_ROLE=$ROLE_INVENTORY_CONTROLLER
$FREQUENCY=daily_batches
$GOAL=Convert RETURNED_DIRTY garments into AVAILABLE or QUARANTINED with auditable batches
$INVARIANTS=$CIRCULARITY_INVARIANT
$INPUTS=$CLEANING_QUEUE;$OPS_LEDGER;$QC_RUBRIC;$CONDITION_GRADE_POLICY
$OUTPUTS=$CLEANING_BATCH_LOG; garment states CLEANED→(AVAILABLE|REPAIR_QUEUE|QUARANTINE|RETIREMENT_QUEUE)

## Scope
This SOP covers cleaning batch creation, processing, post-clean QA grading, and restock location assignment.

## Preconditions
[ ] Cleaning method and supplies available (by fabric types)
[ ] QA grading rubric visible at station
[ ] $OPS_LEDGER open
[ ] Clean bins labeled: CLEANED_PENDING_QA / AVAILABLE / REPAIR_QUEUE / QUARANTINE / RETIREMENT_QUEUE

## Procedure
### Step 1 — Create batch
Batch fields (required)
$CLEANING_BATCH_ID=__________
$BATCH_DATE=__________
$OPERATOR_ID=__________
$METHOD=[ ] wash [ ] dry_clean [ ] steam_sanitize [ ] spot_treat_only
$START_TS_LOCAL=__________
$END_TS_LOCAL=__________

### Step 2 — Pull garments into batch (scan all)
Batch garment list (repeat lines)
$GARMENT_ID_01=__________  $FABRIC_CODE_01=__________  $SPECIAL_INSTRUCTIONS_01=__________
$GARMENT_ID_02=__________  $FABRIC_CODE_02=__________  $SPECIAL_INSTRUCTIONS_02=__________
$GARMENT_ID_03=__________  $FABRIC_CODE_03=__________  $SPECIAL_INSTRUCTIONS_03=__________

Checks
[ ] Each garment currently in state RETURNED_DIRTY in $OPS_LEDGER
[ ] Any garment in mismatch/exception hold is excluded unless exception cleared

Ledger writes (required, per garment added)
[ ] $OPS_LEDGER: $GARMENT_ID → state=IN_CLEANING; $CLEANING_BATCH_ID

### Step 3 — Process cleaning
Operator checks (required)
[ ] Pockets checked and cleared
[ ] Fabric compatibility verified
[ ] Any stain treatment recorded (no concealment)

Incident logging
If any garment is damaged during cleaning:
$CLEANING_INCIDENT=[ ] yes  [ ] no
If yes: $GARMENT_ID=__________  $INCIDENT_CODE=__________  $NOTES=__________
[ ] Open $EXCEPTION_ID with class DAMAGE if threshold exceeded

### Step 4 — Post-clean QA and condition grading
For each garment (repeat lines)
$GARMENT_ID=__________
$ODOR_PASS=[ ] yes [ ] no
$STAIN_PASS=[ ] yes [ ] no
$STRUCTURE_PASS=[ ] yes [ ] no
$HARDWARE_PASS=[ ] yes [ ] no
$CONDITION_GRADE=[ ] A [ ] B [ ] C [ ] RETIRED_PENDING
$ROUTE=[ ] AVAILABLE [ ] REPAIR_QUEUE [ ] QUARANTINE [ ] RETIREMENT_QUEUE
$QA_TS_LOCAL=__________
$QA_OPERATOR_ID=__________

Ledger writes (required)
If AVAILABLE:
[ ] $OPS_LEDGER: $GARMENT_ID → state=AVAILABLE; grade=$CONDITION_GRADE
If REPAIR_QUEUE:
[ ] $OPS_LEDGER: $GARMENT_ID → state=REPAIR_QUEUE; grade=$CONDITION_GRADE; issue=__________
If QUARANTINE:
[ ] $OPS_LEDGER: $GARMENT_ID → state=QUARANTINED; $QC_FAIL_CODE=__________
If RETIREMENT_QUEUE:
[ ] $OPS_LEDGER: $GARMENT_ID → state=RETIREMENT_QUEUE; reason=__________

### Step 5 — Restock location assignment (for AVAILABLE only)
Restock fields
$GARMENT_ID=__________
$RESTOCK_LOCATION=__________
$RESTOCK_TS_LOCAL=__________
$LOCATION_CONFIRMED_BY=__________

Checks
[ ] Location exists in $LOCATION_TABLE taxonomy
[ ] Location is physically labeled
[ ] Garment placed immediately after logging (no “later” piles)

Ledger writes (required)
[ ] $OPS_LEDGER: $GARMENT_ID → location=$RESTOCK_LOCATION; $RESTOCK_TS_LOCAL

## End-of-batch closeout
Batch totals
$TOTAL_GARMENTS_IN_BATCH=______
$TOTAL_AVAILABLE=______
$TOTAL_REPAIR_QUEUE=______
$TOTAL_QUARANTINE=______
$TOTAL_RETIREMENT=______

Checks
[ ] Totals reconcile with scan list
[ ] Any exceptions opened are present in $EXCEPTION_TRIAGE_QUEUE
```
```markdown
# $SOP_EXCEPTION_TRIAGE
$DOC_ID=sop_exception_triage_v1_0
$OWNER_ROLE=$ROLE_OPS_LEAD
$BACKUP_ROLE=$ROLE_USER_SUPPORT
$FREQUENCY=2x_daily + immediate_for_critical
$GOAL=Contain exceptions before they compound into cadence or inventory failure
$INVARIANTS=$CADENCE_INVARIANT;$CIRCULARITY_INVARIANT
$INPUTS=$EXCEPTION_TRIAGE_QUEUE;$OPS_LEDGER;$SHIPMENT_LOG;$USER_SUPPORT_INBOX
$OUTPUTS=Resolved exceptions with closure codes; updated user/inventory states

## Scope
This SOP governs triage, assignment, SLA enforcement, and closure for all exceptions.

## Triage windows
$TRIAGE_TIME_1=__________
$TRIAGE_TIME_2=__________
$CRITICAL_RESPONSE_MINUTES=______

## Severity model (choose one per exception)
$SEVERITY=[ ] CRITICAL (blocks cohort dispatch or inventory truth)
          [ ] HIGH (blocks a single user cycle)
          [ ] MEDIUM (recoverable without blocking next dispatch)
          [ ] LOW (informational / follow-up)

## Required exception record (must be complete)
Fields
$EXCEPTION_ID=__________
$CREATED_TS_LOCAL=__________
$EXCEPTION_CLASS=__________
$SEVERITY=__________
$USER_ID=__________
$CYCLE_ID=__________
$BOX_ID=__________
$GARMENT_IDS=(comma)=________________________
$OWNER_ROLE=__________
$SLA_HOURS=______
$STATUS=[ ] OPEN [ ] IN_PROGRESS [ ] WAITING_ON_USER [ ] WAITING_ON_CARRIER [ ] RESOLVED
$NEXT_ACTION=____________________________________
$EVIDENCE_PATH=___________________________________
$NOTES=___________________________________________

## Triage procedure (for each OPEN exception)
### Step 1 — Validate facts
Checks
[ ] Cross-check $OPS_LEDGER states for $BOX_ID and $GARMENT_IDS
[ ] Cross-check $SHIPMENT_LOG for $TRACKING_ID events if logistics-related
[ ] Confirm user state in $ACTIVE_USER_TABLE (ACTIVE/PAUSED/RETURN_BLOCKED)

### Step 2 — Assign owner and deadline
[ ] Set $OWNER_ROLE and named operator: $OWNER_PERSON=__________
[ ] Set SLA: $DUE_TS_LOCAL=__________
[ ] Write status to IN_PROGRESS or WAITING state

### Step 3 — Execute standard playbooks by class
If LATE_RETURN:
[ ] Set $USER_STATE=RETURN_BLOCKED if beyond grace
[ ] Decide: ship minimal set? hold shipment?
$DECISION=[ ] HOLD [ ] SHIP_MINIMAL [ ] PAUSE [ ] END
$DECISION_TS_LOCAL=__________

If LOST_OUTBOUND:
[ ] Open carrier trace: $TRACE_ID=__________
[ ] Initiate shadow replacement: $REPLACEMENT_APPROVED=[ ] yes [ ] no
[ ] Mark box state: AT_RISK_LOST
[ ] Notify user template: $NOTIFY_TEMPLATE_ID=__________

If LOST_INBOUND:
[ ] Verify proof/scan chain: $PROOF_PRESENT=[ ] yes [ ] no
[ ] Mark box state: AT_RISK_LOST_INBOUND
[ ] Start carrier trace if applicable

If MISSING_ITEM / UNEXPECTED_ITEM:
[ ] Evidence photo confirmed
[ ] Internal search initiated (bins, cleaning, quarantine)
$SEARCH_OWNER=__________  $SEARCH_DEADLINE=__________
[ ] User contact only after internal search begins

If DAMAGE:
[ ] Grade and route garment (REPAIR/RETIRE)
[ ] Record $DAMAGE_CODE and suspected cause (unknown/user/ops)
$CAUSE=[ ] UNKNOWN [ ] USER_PLAUSIBLE [ ] OPS_PLAUSIBLE

If USER_DISSAT:
[ ] Capture structured reason code:
$DISSAT_REASON_CODE=__________
[ ] Record profile change:
$PROFILE_DELTA=____________________________________
[ ] Decide bounded make-good:
$MAKEGOOD=[ ] none [ ] extra_item_next_cycle [ ] credit [ ] pause_offer
$MAKEGOOD_AMOUNT_OR_DETAIL=__________

### Step 4 — Closure
Closure fields (required for RESOLVED)
$RESOLVED_TS_LOCAL=__________
$CLOSURE_CODE=__________
$ROOT_CAUSE=[ ] user_behavior [ ] ops_process [ ] carrier [ ] inventory_constraint [ ] unknown
$PREVENTION_ACTION=________________________________
$FOLLOWUP_OWNER=__________  $FOLLOWUP_DUE=__________

Checks
[ ] $OPS_LEDGER updated to reflect true states
[ ] User notified if it affects their cycle
[ ] Any cost impact recorded: $COST_IMPACT_USD=______
```
```markdown
# $WEEKLY_REVIEW_TEMPLATE
$DOC_ID=weekly_review_template_v1_0
$OWNER_ROLE=$ROLE_DATA_STEWARD
$BACKUP_ROLE=$ROLE_OPS_LEAD
$FREQUENCY=weekly
$GOAL=Decide graduate/pivot/shut_down based on operational truth
$INPUTS=$OPS_LEDGER;$EXCEPTION_TRIAGE_QUEUE;$SHIPMENT_LOG;$CLEANING_BATCH_LOG;$SUPPORT_LOG
$OUTPUTS=Weekly decision memo + actions for next week

## Week metadata
$WEEK_START_DATE=__________
$WEEK_END_DATE=__________
$ACTIVE_USERS_START=______
$ACTIVE_USERS_END=______
$COHORT_COUNT=______
$TEAMING_ACTUAL_HOURS=______
$WORKING_CAPITAL_USED_USD=______

## Cadence performance (fill with numbers)
$ON_TIME_DISPATCH_PCT=______
$ON_TIME_DELIVERY_PCT=______
$CYCLE_SLIP_RATE=______
$RECOVERY_TIME_P50_DAYS=______
$RECOVERY_TIME_P90_DAYS=______

## Inventory integrity
$SHRINK_PCT_PER_CYCLE=______
$MISSING_ITEM_RATE_PER_100_CYCLES=______
$STATE_MISMATCH_COUNT=______
$RETIREMENT_RATE=______
$DAMAGE_RATE=______

## Reprocessing throughput
$CLEANING_TAT_HOURS_AVG=______
$QC_FAIL_RATE=______
$REPAIR_BACKLOG_COUNT=______
$THROUGHPUT_ITEMS_PER_LABOR_HOUR=______

## Exceptions
$EXCEPTIONS_PER_100_CYCLES=______
$OPEN_EXCEPTIONS_AGE_P90_DAYS=______
$TOP_EXCEPTION_CLASSES=(ranked)=____________________________________

## User experience and support
$SUPPORT_CONTACT_RATE_PER_100_USERS=______
$DISSAT_RATE=______
$PAUSE_RATE=______
$CHURN_RATE=______
$TOP_DISSAT_REASON_CODES=(ranked)=__________________________________

## Economics (pilot survival view)
$REVENUE_USD=______
$VARIABLE_COST_USD=______
$LABOR_COST_USD=______
$EXCEPTION_COST_USD=______
$CONTRIB_MARGIN_PER_USER_WEEK_USD=______
$COST_PER_BOX_USD=______

## Decision gate
Choose one:
$DECISION=[ ] GRADUATE [ ] PIVOT [ ] SHUT_DOWN [ ] CONTINUE_AS_IS

Justification (must cite 3 metrics + 1 qualitative operational reality)
$JUSTIFICATION=______________________________________________________
______________________________________________________
______________________________________________________

## Next-week actions (must be executable)
Action 1
$ACTION_ID=__________
$OWNER_ROLE=__________
$DUE_DATE=__________
$SUCCESS_METRIC=__________
$DETAIL=______________________________________________

Action 2
$ACTION_ID=__________
$OWNER_ROLE=__________
$DUE_DATE=__________
$SUCCESS_METRIC=__________
$DETAIL=______________________________________________

Action 3
$ACTION_ID=__________
$OWNER_ROLE=__________
$DUE_DATE=__________
$SUCCESS_METRIC=__________
$DETAIL=______________________________________________

## Risks observed this week (write as operational facts)
$RISK_1=______________________________________________
$RISK_2=______________________________________________
$RISK_3=______________________________________________

## Audit spot-check (mandatory)
$AUDIT_SAMPLE_SIZE=______
$AUDIT_FINDINGS_SUMMARY=___________________________________________
$AUDIT_CORRECTIVE_ACTION=_________________________________________
```

If you want these sheets also expressed as printable “single-page” checklists (tightened whitespace, fixed field order, signature lines), I can compress each into a strict one-page layout while keeping the same fields and IDs.

