# RESONA-SI — Proposed Ten-System Governed AI Research Testbed
Version: proposal v0.3 • 2026-10-23 • Status: RESEARCH / NOT ADOPTED

## Claim boundary
"Superintelligence" is an untested research hypothesis, NOT an achieved or validated capability. Fit to a specific NSF opportunity has not been established; any future alignment claim must cite the opportunity and map its requirements to this proposal. Ten AI systems do not by themselves constitute superintelligence. No NSF award, affiliation, approval, government certification, clinical approval, or operational authorization is claimed.

## Purpose
Investigate whether a heterogeneous cooperative-AI system can solve harder problems while retaining independent control of consequential actions. Motto: **Govern movement, not truth**.

## Ten participating AI systems (proposed roles; not independent verification)
1. GPT / OpenAI — synthesis and task coordination
2. Claude / Anthropic — critique and code analysis
3. Gemini / Google — multimodal review
4. Grok / xAI — adversarial challenge
5. Qwen / Alibaba — open-weight experimentation
6. DeepSeek — alternate reasoning
7. Kimi / Moonshot — long-context analysis
8. Mistral / Le Chat — agent workflow experiments
9. Perplexity — retrieval and source comparison
10. Microsoft Copilot — enterprise workflow and M365 review

Consumer chat accounts do not imply API access. Microsoft Copilot is not interchangeable with an arbitrary Copilot API model; use documented Copilot Studio/agent interfaces as appropriate. Mistral API is not identical to the Le Chat application; Moonshot API is not identical to a Kimi consumer subscription. Verify current IDs, rights, terms, model availability, costs and data policies individually before live integrations.

## Platform separation
- **GitHub**: reviewable source, test fixtures, evidence manifests, PRs; no autonomous repository mutations.
- **Vercel**: isolated preview hosting; AI Gateway is a possible routing component, not the security authority.
- **v0 (Vercel)**: UI prototyping/design, not the authorization or enforcement boundary.
- **Resona / OSAA**: proposed Observe → Speak → Adjudicate → Authorize → Enforce; authorization decisions separated from model outputs, enforced by destination.

## Minimum experiment
Provide identical synthetic source materials and question to three or more models independently, preserve exact inputs/model identifiers/versions/settings, timestamps, outputs, source citations, and SHA-256 hashes. Compare propositions and disagreements using non-authoritative analysis. Record ABSTAIN/DEFER for missing evidence. No live writes, PHI, customer secrets, finance operations, or medical advice. Initial runs with mock outputs must be labeled SIMULATED.

## Evidence gates
These are prospective research milestones only. They do not redefine, satisfy, or replace existing Resona Gate A/B acceptance criteria or sign-off records. Neither local test summary establishes Gate A/B sign-off.

- Gate 0: schema/fixture hashes and deterministic synthetic demonstration
- Gate 1: real API runs, cost and provider trace verification, observed isolation
- Gate A: independent reviewer reproduces precise commit and acceptance criteria
- Gate B: separate enforcement service proves denial, replay resistance, expiry, crash/restore, concurrency, revocation, destination bypass attempts
No promotion merely from agreement, demo visuals, passing local tests, or provider self-reports.

## Research metrics
Unresolved disagreement rate; correctly abstained claims; unsupported citation rate; action-denial consistency; revocation latency; bypass-success rate; reproducibility; cost and latency; human decision quality against a baseline. Pre-register thresholds before trials.

## Naming and regulatory boundary
Use **RESONA-SI | Proposed Ten-System Governed AI Research Testbed** with subtitle **Governed Multi-Agent Intelligence Research; Physical-System Applications Proposed**. Treat "superintelligence" as an untested hypothesis requiring predefined capability benchmarks and comparative evidence. Do not claim NSF endorsement; verify trademark clearance, current NSF opportunity terms, FAR/agency terms for any future government use, privacy and health data conditions for any clinical expansion.

## GitHub / Vercel / v0 workflow
Develop in this separate research branch and draft PR. Prototype interface may be generated in v0 and deployed via Vercel preview without production authority. Keep previous PRs, Gate A/B records and main untouched. Live-provider configuration and expenditure require separately approved credentials and budgets.
