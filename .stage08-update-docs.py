from pathlib import Path

p = Path('HANDOVER.md')
s = p.read_text()
s = s.replace(
    '**Next controlled stage:** Stage 08 — competition integration decision',
    '**Current competition decision stage:** Stage 08 — Open Source locked; AWS Builder conditional on verified AWS access\n**Next executable product stage if AWS access remains unavailable:** Stage 09 — hardening'
)
marker = '## Current simulation and capability boundaries\n'
stage8 = '''## Stage 08 — competition integration decision

Stage 08 has now been researched against the current Devpost rules and current AWS documentation. It does not change the verified Stage 07 runtime.

### Open Source mini challenge — locked decision

**Enter the Open Source mini challenge.**

Verified evidence:

- public repository: `https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent`;
- GitHub username: `jamieozzy89-cmyk`;
- MIT licence;
- repository created 1 September 2026 at 02:23:58 UTC;
- clean Stage 07 contribution/release commit: `871ae74bf53461a02201554250f68b22c5382fc9`;
- contribution URL: `https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent/commit/871ae74bf53461a02201554250f68b22c5382fc9`;
- substantive implementation includes domain engine, persistence, 17 validated tools, agent/orchestrator, touch UI, browser voice, receipts/audit, tests and technical documentation.

Prepared submission evidence is stored in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.

### AWS Builder — conditional decision

AWS is **not required** for Host's valid simulated Alexa+ primary-track route.

The competition's AWS Builder examples explicitly distinguish obvious integrations such as a single Bedrock generation call from more creative multi-service/agentic architectures. Therefore Host must not add a token Bedrock call merely to qualify.

Options evaluated:

- single Bedrock text-generation call — rejected as shallow/padding;
- replace Host orchestration with Strands — rejected because it risks weakening the verified authoritative execution boundary;
- convert the current web simulation to AgentCore Gateway/MCP solely for the mini challenge — rejected as unnecessary architecture/infrastructure churn;
- **Bedrock + AgentCore Memory — selected as the only AWS architecture worth pursuing if real AWS access is supplied.**

#### Controlled Bedrock role

Bedrock would sit behind Host's existing `StructuredIntentModel` / `ModelBackedIntentInterpreter` interface, preferably through the Bedrock Converse API. Model output still terminates at the existing orchestrator/tool/domain path and cannot directly mutate authoritative state. `ResilientIntentInterpreter` must retain the deterministic fallback.

#### Controlled AgentCore Memory role

AgentCore Memory would hold **non-authoritative cross-event preferences** only, such as cuisine/style or normal prep preferences. Retrieved memory may suggest context; it must never silently become a confirmed dietary/allergen constraint, completion state, committed menu, transaction or other authoritative event fact.

#### AWS blocker

The current environment has no governed AWS connection or AWS/Bedrock plugin. Only the local-files connection is present. No AWS credentials/account access are available to verify real Bedrock or AgentCore calls.

Therefore:

- no AWS service is currently implemented or claimed;
- no mocked AWS integration may be substituted for a real competition claim;
- `Built With` must not list Bedrock/AgentCore until real calls are implemented and verified.

The competition rules currently offer up to $150 promotional AWS credits while supplies last, with additional charges remaining the entrant's responsibility. If AWS access is supplied, request/confirm credits and set a strict spend budget before implementation.

Full Stage 08 decision/evidence: `docs/COMPETITION_INTEGRATION_STAGE08.md`.

### Exact continuation after Stage 08

If secure AWS account access becomes available, implement Bedrock + AgentCore Memory behind the controlled adapters and rerun all existing plus AWS-specific tests before claiming AWS Builder.

If AWS access remains unavailable, Stage 08 is complete as a controlled decision: retain the stronger verified Stage 07 Alexa+ product, enter Open Source, do **not** claim AWS Builder, and proceed directly to Stage 09 hardening.

'''
if marker not in s:
    raise SystemExit('handover insertion marker not found')
s = s.replace(marker, stage8 + marker, 1)
start = s.find('## Exact continuation point — Stage 08')
end = s.find('## Later controlled work', start)
if start != -1 and end != -1:
    s = s[:start] + '''## Exact continuation point

Stage 08's decision is recorded above. The next executable action depends only on verified AWS access:

- **AWS access available:** implement the controlled Bedrock + AgentCore Memory design, verify real calls/cost/failure behavior, then continue hardening.
- **AWS access unavailable:** proceed to Stage 09 hardening with the verified Stage 07 runtime and Open Source mini entry; do not claim AWS Builder.

''' + s[end:]
p.write_text(s)

p = Path('README.md')
s = p.read_text()
insert = '''## Competition mini-challenge status

- **Open Source:** selected for entry. Host is a new public MIT repository with substantive implementation and tests. Submission evidence is prepared in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.
- **AWS Builder:** not currently claimed. Current research selects Bedrock + AgentCore Memory as the only AWS architecture worth pursuing, but no real AWS account/credential connection is available in this environment, so no AWS runtime integration has been implemented or verified.

See `docs/COMPETITION_INTEGRATION_STAGE08.md` for the controlled decision and AWS integration boundary.

'''
marker = '## Runtime/model boundary\n'
if marker not in s:
    raise SystemExit('README insertion marker not found')
s = s.replace(marker, insert + marker, 1)
p.write_text(s)
