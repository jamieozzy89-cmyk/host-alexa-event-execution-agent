from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"required Stage 09 round-two marker missing in {path}: {old[:100]!r}")
    p.write_text(text.replace(old, new, 1))


# Axe found the scrollable transcript had no keyboard access.
replace_once(
    "web/render.ts",
    '  log.setAttribute("aria-label", "Host conversation");\n',
    '  log.setAttribute("aria-label", "Host conversation");\n  log.tabIndex = 0;\n',
)

# resumeConversation returns a structured error rather than throwing when every stored snapshot is invalid.
# Treat that state as an explicit safe-recovery path and leave the corrupt event snapshots untouched for deliberate deletion.
replace_once(
    "web/main.ts",
    '''      const resumed = await runtime.agent.resumeConversation(conversationId, activeEventId);\n      if (resumed.status === "error") runtime.forgetEvent();\n      applyReply(resumed);\n''',
    '''      const resumed = await runtime.agent.resumeConversation(conversationId, activeEventId);\n      if (resumed.status === "error") {\n        runtime.forgetEvent();\n        state.recoveryNotice = "Host couldn't safely restore the saved plan. The stored snapshot was left untouched so you can clear it deliberately from Data & privacy.";\n        state.transcript.push({\n          id: nextTranscriptId(),\n          role: "assistant",\n          text: state.recoveryNotice,\n        });\n        const welcome = await runtime.agent.handleText(conversationId, "help");\n        applyReply(welcome);\n      } else {\n        applyReply(resumed);\n      }\n''',
)

# Existing visible-content assertions became ambiguous only because Stage 09 adds a separate screen-reader live-status node.
# Scope them to the visible conversation transcript; the behavioral assertions themselves are unchanged.
replace_once(
    "tests/web/host-ui.spec.ts",
    '  await expect(page.getByText(/Updated\\. I kept unaffected work/)).toBeVisible();\n',
    '  await expect(page.getByLabel("Host conversation").getByText(/Updated\\. I kept unaffected work/)).toBeVisible();\n',
)
replace_once(
    "tests/web/host-ui.spec.ts",
    '  await expect(page.getByText(/Welcome back\\. Dinner at home is restored/)).toBeVisible();\n',
    '  await expect(page.getByLabel("Host conversation").getByText(/Welcome back\\. Dinner at home is restored/)).toBeVisible();\n',
)
