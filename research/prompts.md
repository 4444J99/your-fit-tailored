## Q: 
Areas for deep research within this market niche

## A: 
## Deep-Research Areas for a Specialized Market Niche

### 1) Category definition and boundary mapping

Define exactly what the niche is and is not, using a tight taxonomy: primary problem space, adjacent substitutes, and “no-go” edges. Output a one-page “category boundary spec” with $NICH E_LABEL, $CATEGORY_PROMISE, $EXCLUSION_RULES, and $SUBSTITUTE_SET so every later insight stays comparable.

Keyboard shortcut: in most browsers, use `Ctrl+L` (Windows/Linux) or `Cmd+L` (macOS) to jump to the address bar and rapidly validate category terms across sources.

### 2) Ideal customer profile decomposition and segmentation

Break the niche into decision-maker types, economic buyers, champions, end-users, and blockers; then segment by urgency triggers, budget bands, compliance constraints, and procurement friction. Store as a normalized matrix keyed by $ICP_ID and $SEGMENT_TRIGGER rather than by company names.

Keyboard shortcut: in spreadsheets, `Ctrl+F` / `Cmd+F` to locate repeating segment language fast; in editors, `Ctrl+Shift+F` / `Cmd+Shift+F` to search across a whole research vault.

### 3) Jobs-to-be-done and “switching” research

Map the functional job, emotional job, and social job; then study the “switch” moment: what breaks trust in the current solution and what proves safety in the new one. Capture verbatim phrasing as $VOICE_OF_CUSTOMER_SNIPPETS and tag by stage ($AWARENESS_STAGE, $EVALUATION_STAGE, $RISK_STAGE).

### 4) Demand intelligence and channel physics

Quantify where demand expresses itself: search, communities, referrals, procurement platforms, events, and internal stakeholder escalations. For each channel, research the “physics”: time-to-trust, proof requirements, and content formats that convert. Track as $CHANNEL_NAME, $CAC_MODEL, $TRUST_ASSET_TYPE, $TIME_TO_CLOSE.

Keyboard shortcut: `Ctrl+F` / `Cmd+F` on long forum threads and procurement docs; `Ctrl+K` / `Cmd+K` in many tools to open a universal search palette.

### 5) Competitive landscape, including non-obvious substitutes

Do not limit to direct competitors; map substitutes by outcome (manual labor, in-house build, agency bundle, “good-enough” platform feature, or doing nothing). Build a “loss tree” that explains why buyers choose each substitute. Maintain $COMPETITOR_SET and $SUBSTITUTE_SET separately.

### 6) Offer architecture, pricing logic, and packaging experiments

Research how the niche prices risk reduction (warranties, SLAs, compliance, timelines), not just features. Model willingness-to-pay by avoided cost and time-to-value. Output three packaging archetypes with $OFFER_CORE, $RISK_REVERSAL, $PROOF_ARTIFACTS, and $PRICING_ANCHOR.

Keyboard shortcut: in docs, `Ctrl+Alt+1/2/3` (Windows) or `Cmd+Option+1/2/3` (macOS) often applies heading styles quickly for clean offer docs.

### 7) Proof, credibility signals, and buyer due diligence

Deep research what evidence actually passes diligence in this niche: case study structure, metrics accepted, security questionnaires, references, portfolios, audits, and “before/after” artifacts. Create a proof inventory spec: $PROOF_TYPE, $VERIFIABILITY_LEVEL, $RISK_IT_ADDRESSES, $WHERE_IT_LIVES.

### 8) Regulatory, privacy, accessibility, and contractual constraints

Even “creative” niches often have hidden constraints (data handling, accessibility, IP ownership, indemnities, procurement rules). Research the constraints that change how you message and deliver. Maintain a compliance map: $CONSTRAINT, $APPLIES_TO_SEGMENTS, $MITIGATION_CONTROL, $CONTRACT_CLAUSE_IMPACT.

### 9) Buyer journey narrative and message testing

Research the narrative arc buyers already believe, then test message variants that align with it: problem framing, “enemy,” mechanism, and differentiation. Store tested claims as hypotheses with $CLAIM, $EVIDENCE, $COUNTERARGUMENT, $DISPROOF_SIGNAL.

Keyboard shortcut: in most email and doc tools, `Ctrl+Shift+V` / `Cmd+Shift+V` pastes without formatting, which keeps message tests clean.

### 10) Unit economics, delivery throughput, and operational constraints

Study the operational realities that cap growth: lead times, review cycles, dependency risk, quality gates, and rework drivers. Translate into a delivery system model: $THROUGHPUT_LIMITER, $QA_GATE, $REWORK_RATE, $MARGIN_SENSITIVITY.

### 11) Partnership and ecosystem leverage

Identify upstream and downstream partners who already own trust (integrators, community leaders, educators, tool vendors, compliance consultants). Research partnership structures and co-selling mechanics; track $PARTNER_TYPE, $INTEGRATION_COST, $COSELL_MOTION, $REV_SHARE_RANGE.

### 12) Future-proofing and scenario planning

Research how the niche shifts under plausible futures: automation, regulation tightening, platform consolidation, and changing buyer risk tolerance. Produce three scenarios with $SCENARIO_NAME, $TRIGGER, $WINNING_OFFERS, $LOSING_OFFERS, $EARLY_SIGNALS.

* * *

## Practical Deliverable Set You Can Produce Immediately

Create a minimal “research operating system” using environment variables so it ports cleanly across niches: $RESEARCH_ROOT, $SOURCE_LOG, $FINDINGS_DB, $ICP_MATRIX, $LOSS_TREE, $OFFER_ARCHETYPES, $PROOF_INVENTORY, $CONSTRAINT_MAP, $MESSAGE_TESTS, $SCENARIO_SET.

Keyboard shortcut: `Ctrl+N` / `Cmd+N` for new notes; `Ctrl+S` / `Cmd+S` after each interview snippet capture to prevent loss of raw voice-of-customer data.

* * *

If you tell me the niche label you mean (one line is enough), I will convert the above into a niche-specific research backlog with prioritized hypotheses, the exact artifact schema for $FINDINGS_DB, and a 14-day execution plan keyed to your highest-leverage channel.

## Q: 
Provide in separate code windows copy/paste research prompts for ai

## A: 
```plain text
$PROMPT_ID: research__niche__category_boundary__v1
$MODE: analyst
$CONTEXT: I am researching a specialized market niche. Produce a precise category definition and boundary map.
$INPUTS_REQUIRED: $NICHE_LABEL, $TARGET_BUYER, $REGION, $PRICE_TIER, $DELIVERY_MODE
$TASK:
1) Define the niche in one sentence as a falsifiable claim.
2) List inclusion criteria (must-have attributes) and exclusion criteria (must-not attributes).
3) Map adjacent categories and substitutes (DIY, in-house, agency, platform feature, “do nothing”).
4) Provide a canonical taxonomy: Tier-0 category, Tier-1 segments, Tier-2 subsegments.
5) Produce a glossary of 20 niche-specific terms with crisp definitions.
$OUTPUT_FORMAT:
- $CATEGORY_DEFINITION
- $INCLUSION_RULES[]
- $EXCLUSION_RULES[]
- $ADJACENT_CATEGORIES[]
- $SUBSTITUTE_SET[]
- $TAXONOMY_TREE (indented)
- $GLOSSARY (term: definition)
$QUALITY_BARS:
No fluff. Use operational language. Avoid brand names unless unavoidable.
```
```plain text
$PROMPT_ID: research__niche__icp_segmentation__v1
$MODE: strategist
$CONTEXT: Build an ICP and segmentation model for $NICHE_LABEL with decision dynamics.
$INPUTS_REQUIRED: $NICHE_LABEL, $REGION, $B2B_OR_B2C, $ACV_RANGE, $SALES_MOTION
$TASK:
1) Identify economic buyer, champion, end-user, blocker for each segment.
2) Segment by urgency trigger, compliance constraints, budget band, procurement friction.
3) Provide segment “tell” signals (language used, tools used, situations).
4) For each segment, list top 5 objections and the evidence that resolves each.
$OUTPUT_FORMAT:
- $SEGMENTS_TABLE with fields:
  $SEGMENT_ID | $SEGMENT_NAME | $PRIMARY_ROLE | $URGENCY_TRIGGER | $BUDGET_BAND | $FRICTION_LEVEL | $TOP_OBJECTIONS[] | $EVIDENCE_NEEDED[]
- $ROLE_MAP (Buyer/Champion/User/Blocker)
- $SIGNAL_DICTIONARY (signal -> segment mapping)
```
```plain text
$PROMPT_ID: research__niche__jtbd_switching__v1
$MODE: ethnographer
$CONTEXT: Extract Jobs-to-be-Done and switching triggers for $NICHE_LABEL.
$INPUTS_REQUIRED: $NICHE_LABEL, $TARGET_PERSONA, $CURRENT_ALTERNATIVES
$TASK:
1) Define functional, emotional, and social jobs.
2) Map the “switch” timeline: first thought → passive looking → active evaluation → decision → adoption.
3) Identify forcing functions (events that create urgency) and perceived risks.
4) Produce 30 “voice of customer” phrases that sound like real buyers.
$OUTPUT_FORMAT:
- $JTBD_FUNCTIONAL[]
- $JTBD_EMOTIONAL[]
- $JTBD_SOCIAL[]
- $SWITCH_TIMELINE (stages + triggers + artifacts)
- $RISK_MAP (risk -> proof needed)
- $VOC_PHRASES[] (tag each with stage)
```
```plain text
$PROMPT_ID: research__niche__demand_channels__v1
$MODE: growth_analyst
$CONTEXT: Identify how demand manifests for $NICHE_LABEL and rank channels.
$INPUTS_REQUIRED: $NICHE_LABEL, $REGION, $TARGET_SEGMENTS, $CONTENT_CAPABILITIES
$TASK:
1) List demand channels: search, communities, events, referrals, marketplaces, outbound, partners.
2) For each channel, describe “channel physics”: time-to-trust, proof required, content formats.
3) Provide a prioritized channel stack with rationale and expected time-to-signal.
4) Draft 10 channel-specific content ideas that function as proof assets.
$OUTPUT_FORMAT:
- $CHANNELS[] with:
  $CHANNEL_NAME | $WHY_IT_WORKS | $TIME_TO_TRUST | $PROOF_REQUIRED | $BEST_FORMATS[] | $RISK | $METRICS
- $PRIORITY_STACK (1..N)
- $PROOF_ASSET_IDEAS[]
```
```plain text
$PROMPT_ID: research__niche__competitive_substitutes__v1
$MODE: competitive_intel
$CONTEXT: Map direct competitors and non-obvious substitutes for $NICHE_LABEL.
$INPUTS_REQUIRED: $NICHE_LABEL, $REGION, $PRICE_TIER, $CUSTOMER_TYPE
$TASK:
1) Identify competitor archetypes (not brands): specialist, platform, agency, integrator, DIY toolkit.
2) Build a “loss tree”: reasons buyers choose each substitute, including “do nothing”.
3) Define differentiation vectors that matter in this niche (speed, risk, compliance, quality, cost).
4) Produce 12 “battlecards” framed as: claim → evidence → counterclaim → response.
$OUTPUT_FORMAT:
- $COMPETITOR_ARCHETYPES[]
- $SUBSTITUTE_SET[]
- $LOSS_TREE (indented)
- $DIFFERENTIATION_VECTORS[]
- $BATTLECARDS[] (structured)
```
```plain text
$PROMPT_ID: research__niche__offer_pricing_packaging__v1
$MODE: pricing_analyst
$CONTEXT: Create offer and pricing hypotheses for $NICHE_LABEL that reflect risk and time-to-value.
$INPUTS_REQUIRED: $NICHE_LABEL, $ACV_RANGE, $BUYER_RISK_PROFILE, $DELIVERY_CONSTRAINTS
$TASK:
1) Propose 3 offer archetypes (starter/core/enterprise or equivalent).
2) For each, define scope boundaries, deliverables, timeline, acceptance criteria.
3) Recommend pricing logic: value metric, anchor, discount policy, SLA/warranty options.
4) Identify what must be true operationally to deliver profitably (throughput constraints).
$OUTPUT_FORMAT:
- $OFFER_ARCHETYPES[] with:
  $OFFER_NAME | $IDEAL_FOR | $DELIVERABLES[] | $TIMELINE | $ACCEPTANCE_CRITERIA[] | $RISK_REVERSAL | $PRICE_LOGIC
- $UNIT_ECONOMICS_ASSUMPTIONS
- $OPERATIONS_REQUIREMENTS[]
```
```plain text
$PROMPT_ID: research__niche__proof_due_diligence__v1
$MODE: trust_engineer
$CONTEXT: Determine proof assets and diligence requirements buyers expect in $NICHE_LABEL.
$INPUTS_REQUIRED: $NICHE_LABEL, $BUYER_TYPE, $SECURITY_SENSITIVITY, $COMPLIANCE_CONTEXT
$TASK:
1) List diligence checkpoints (security, privacy, accessibility, references, portfolio, audits).
2) For each checkpoint, define “passing artifacts” and minimum bar.
3) Produce a proof inventory plan with verifiability levels (low/med/high).
4) Draft a case study template that fits this niche’s credibility standards.
$OUTPUT_FORMAT:
- $DILIGENCE_CHECKPOINTS[] (checkpoint -> required artifacts)
- $PROOF_INVENTORY[] (asset -> risk addressed -> verifiability -> where stored)
- $CASE_STUDY_TEMPLATE (headings + prompts)
```
```plain text
$PROMPT_ID: research__niche__constraints_regulatory_contract__v1
$MODE: risk_analyst
$CONTEXT: Identify constraints that shape delivery and messaging for $NICHE_LABEL.
$INPUTS_REQUIRED: $NICHE_LABEL, $REGION, $DATA_HANDLING, $ACCESSIBILITY_NEEDS, $IP_OWNERSHIP_EXPECTATIONS
$TASK:
1) Enumerate likely constraints (legal, regulatory, privacy, accessibility, IP, procurement).
2) For each, state how it impacts: product scope, onboarding, contracts, and marketing claims.
3) Provide mitigation controls (process, policy, technical measures).
4) Draft “safe claims” vs “high-risk claims” for marketing copy.
$OUTPUT_FORMAT:
- $CONSTRAINT_MAP[] (constraint -> applies_to -> impact -> mitigation)
- $CONTRACT_CLAUSE_IMPACTS[]
- $SAFE_CLAIMS[]
- $HIGH_RISK_CLAIMS[]
```
```plain text
$PROMPT_ID: research__niche__messaging_hypotheses__v1
$MODE: positioning
$CONTEXT: Create message hypotheses and tests for $NICHE_LABEL aligned to buyer psychology.
$INPUTS_REQUIRED: $NICHE_LABEL, $TOP_SEGMENTS, $DIFFERENTIATION_VECTORS, $PROOF_ASSETS_AVAILABLE
$TASK:
1) Produce 5 positioning statements (one per segment).
2) Draft 10 headline variants and 10 elevator pitches.
3) For each, specify: target segment, claim, mechanism, proof, and disproof signal.
4) Create a 2-week message testing plan across 3 channels with success metrics.
$OUTPUT_FORMAT:
- $POSITIONING_STATEMENTS[]
- $HEADLINES[]
- $ELEVATOR_PITCHES[]
- $MESSAGE_TEST_MATRIX (message -> segment -> proof -> metric -> disproof)
- $TEST_PLAN (day-by-day)
```
```plain text
$PROMPT_ID: research__niche__ops_throughput_quality__v1
$MODE: operations_analyst
$CONTEXT: Model delivery throughput, quality gates, and scaling constraints for $NICHE_LABEL.
$INPUTS_REQUIRED: $NICHE_LABEL, $DELIVERY_WORKFLOW, $TEAM_SHAPE, $QUALITY_BAR
$TASK:
1) Identify the top throughput limiters and rework drivers.
2) Define quality gates and acceptance criteria per stage.
3) Recommend instrumentation: metrics, leading indicators, dashboards.
4) Propose 3 scale paths (hire, productize, partner) with tradeoffs.
$OUTPUT_FORMAT:
- $THROUGHPUT_LIMITERS[]
- $REWORK_DRIVERS[]
- $QA_GATES[] (stage -> gate -> criteria)
- $INSTRUMENTATION_PLAN
- $SCALE_PATHS[] (path -> prerequisites -> risks)
```
```plain text
$PROMPT_ID: research__niche__partners_ecosystem__v1
$MODE: ecosystem_strategist
$CONTEXT: Identify partners that can compress trust and distribution for $NICHE_LABEL.
$INPUTS_REQUIRED: $NICHE_LABEL, $REGION, $TARGET_SEGMENTS, $INTEGRATION_CAPABILITY
$TASK:
1) Map upstream/downstream partners and who owns buyer trust.
2) Propose partnership models: referral, reseller, integration, co-marketing, co-delivery.
3) Define partner qualification criteria and a scoring rubric.
4) Draft outreach sequences (short) tailored to 3 partner types.
$OUTPUT_FORMAT:
- $PARTNER_MAP[] (type -> value -> access -> integration cost)
- $PARTNERSHIP_MODELS[]
- $PARTNER_SCORECARD (fields + scoring rules)
- $OUTREACH_SEQUENCES[] (3 sequences)
```
```plain text
$PROMPT_ID: research__niche__future_scenarios__v1
$MODE: foresight
$CONTEXT: Build scenario plans for how $NICHE_LABEL evolves over the next 24–36 months.
$INPUTS_REQUIRED: $NICHE_LABEL, $REGION, $TECH_TRENDS, $REGULATORY_TRENDS, $PLATFORM_DEPENDENCIES
$TASK:
1) Produce 3 plausible scenarios with triggers and early signals.
2) For each scenario, list winning offers, losing offers, and pricing changes.
3) Recommend “no-regrets moves” that help across all scenarios.
4) Provide a monitoring cadence and signal dashboard spec.
$OUTPUT_FORMAT:
- $SCENARIOS[] (name -> trigger -> early signals -> implications)
- $NO_REGRETS_MOVES[]
- $SIGNAL_DASHBOARD_SPEC
- $MONITORING_CADENCE
```

