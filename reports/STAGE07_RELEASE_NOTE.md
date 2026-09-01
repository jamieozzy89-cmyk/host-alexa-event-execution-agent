# Stage 07 Clean Release Rule

The clean Stage 07 release must preserve the verified product, test, package, README, handover, architecture and permanent verification files while excluding temporary Stage 07 verification scaffolding.

Exclude from the final `main` tree:

- `.github/workflows/stage07-build-verify.yml`
- `.github/workflows/stage07-verify.yml`
- `.stage07-apply.py`
- `.stage07-build-trigger`
- `.stage07-verify-trigger`
- `reports/STAGE07_BROWSER_LAST_RUN.txt`

This note is permanent release provenance; it records which diagnostic/control artifacts were intentionally excluded after the final successful Stage 07 gate.