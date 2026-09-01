from pathlib import Path

# HANDOVER
p = Path('HANDOVER.md')
s = p.read_text()
s = s.replace(
    '**Current competition decision stage:** Stage 08 — Open Source locked; AWS Builder conditional on verified AWS access\n**Next executable product stage if AWS access remains unavailable:** Stage 09 — hardening',
    '**Current competition decision stage:** Stage 08 — Open Source locked; AWS Builder deliberately deferred for now\n**Next executable product stage:** Stage 09 — hardening'
)
s = s.replace(
    '#### AWS blocker\n\nThe current environment has no governed AWS connection or AWS/Bedrock plugin. Only the local-files connection is present. No AWS credentials/account access are available to verify real Bedrock or AgentCore calls.',
    '#### AWS access / current decision\n\nThe user has confirmed that an AWS account exists. However, the current project environment still has no governed AWS connection or AWS/Bedrock plugin, and the user has explicitly chosen to continue without connecting AWS for now. Therefore the Bedrock + AgentCore Memory implementation is deliberately deferred rather than abandoned.'
)
s = s.replace(
    'If secure AWS account access becomes available, implement Bedrock + AgentCore Memory behind the controlled adapters and rerun all existing plus AWS-specific tests before claiming AWS Builder.\n\nIf AWS access remains unavailable, Stage 08 is complete as a controlled decision: retain the stronger verified Stage 07 Alexa+ product, enter Open Source, do **not** claim AWS Builder, and proceed directly to Stage 09 hardening.',
    'If the user later chooses to connect AWS securely to the project environment, implement Bedrock + AgentCore Memory behind the controlled adapters and rerun all existing plus AWS-specific tests before claiming AWS Builder.\n\nFor now, Stage 08 is complete as a controlled decision: retain the verified Stage 07 Alexa+ product, enter Open Source, do **not** claim AWS Builder yet, and proceed directly to Stage 09 hardening.'
)
s = s.replace(
    "Stage 08's decision is recorded above. The next executable action depends only on verified AWS access:\n\n- **AWS access available:** implement the controlled Bedrock + AgentCore Memory design, verify real calls/cost/failure behavior, then continue hardening.\n- **AWS access unavailable:** proceed to Stage 09 hardening with the verified Stage 07 runtime and Open Source mini entry; do not claim AWS Builder.",
    "Stage 08's decision is recorded above. The AWS account exists, but integration is deliberately deferred by the user for now. Proceed to Stage 09 hardening with the verified Stage 07 runtime and Open Source mini entry. Do not claim AWS Builder unless the deferred Bedrock + AgentCore Memory integration is later implemented and verified."
)
p.write_text(s)

# Stage 08 decision document
p = Path('docs/COMPETITION_INTEGRATION_STAGE08.md')
s = p.read_text()
s = s.replace(
    '### Current blocker\n\nA real AWS Builder implementation cannot be verified until AWS account/credential access is available to the project environment.\n\nThis is an external access blocker, not a reason to substitute mocked AWS calls or to claim an integration prematurely.',
    '### Current status\n\nThe user has confirmed that an AWS account exists, but has explicitly chosen to continue without connecting it to the project environment for now. The environment itself still has no governed AWS/Bedrock connection, so no real Bedrock or AgentCore call can currently be verified here.\n\nThe AWS Builder route is therefore **deferred, not rejected**. This is not a reason to substitute mocked AWS calls or claim an integration prematurely.'
)
s = s.replace(
    'If AWS access becomes available, continue with the controlled Bedrock + AgentCore Memory implementation plan above.\n\nIf AWS access is deliberately not supplied, retain the verified Stage 07 Alexa+ build, enter the Open Source mini challenge, and proceed to Stage 09 hardening without claiming AWS Builder.',
    'The user has chosen to defer AWS integration for now. Retain the verified Stage 07 Alexa+ build, enter the Open Source mini challenge, and proceed to Stage 09 hardening without claiming AWS Builder.\n\nIf AWS is connected later, resume the controlled Bedrock + AgentCore Memory implementation plan above before any AWS Builder claim.'
)
p.write_text(s)

# README
p = Path('README.md')
s = p.read_text()
s = s.replace(
    '- **AWS Builder:** not currently claimed. Current research selects Bedrock + AgentCore Memory as the only AWS architecture worth pursuing, but no real AWS account/credential connection is available in this environment, so no AWS runtime integration has been implemented or verified.',
    '- **AWS Builder:** not currently claimed. The user has an AWS account, but has chosen to defer connecting it for now. Bedrock + AgentCore Memory remains the selected future AWS architecture; no AWS runtime integration has yet been implemented or verified.'
)
p.write_text(s)
