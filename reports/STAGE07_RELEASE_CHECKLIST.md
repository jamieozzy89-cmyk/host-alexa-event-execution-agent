# Stage 07 Release Checklist

Before publication to `main`:

1. Remove all temporary Stage 07 workflows, triggers, transformation script and raw browser diagnostic.
2. Preserve verified product/test/package blobs unchanged.
3. Run `npm ci`, `npm test`, `npm run build:web` on the clean candidate.
4. Run the complete 14-case Chromium acceptance suite on the clean product candidate.
5. Confirm no direct domain-engine imports in `web/` and no unresolved TODO/FIXME/HACK markers in product/browser-test source.
6. Read permanent Stage 07 documentation and handover back from the candidate.
7. Publish one clean Stage 07 release commit directly on the current Stage 06 `main` parent only after all checks pass.