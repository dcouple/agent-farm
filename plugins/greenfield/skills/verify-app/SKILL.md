---
name: verify-app
description: Use when behaviour must be proven in the running application: journeys, screenshots for visual checks, external effects, or reproducing a bug. Never fixes.
---

# Verify app

Prove what works with evidence, say what you could not determine, and leave a trail someone else can follow. A check you could not run is `undetermined`. It is never a pass.

## Set up

1. Confirm the target: branch or commit, worktree, and the journeys and visual checks you were given, with the design reference.
2. Check tools and sign-ins before starting anything long: browser automation, the dev server or simulator, test accounts, and any connector needed to read back external effects. If something is missing, stop and report it as the reason. Do not improvise around it.
3. Use test-mode keys, test accounts, local containers, and staging-safe endpoints. Never touch production unless the person explicitly asked.
4. Start what you need and note what you started. Do not leave duplicate servers or listeners running.

## Drive the journeys

- Use browser automation. Select elements by what a user sees: labels, button text, placeholders, routes.
- Use a unique marker for anything you create, such as `agent-e2e-<timestamp>`, so it can be found and removed.
- Capture a screenshot at each meaningful step, not only the final page: empty, filled, expanded, modal, validation error, loading, success. Add one narrow viewport when layout could be affected. Name files in journey order, for example `01-open-invoice.png`. Keep them in one folder outside the repository's tracked files, or in a git-ignored `tmp/` folder.
- Record one video per journey when the driver can do it for free. Stills remain the evidence. The video shows continuity.
- For `visual` checks, capture the named screens at the same size and state as the design reference. You capture. The reviewers judge.
- Pace the steps like a person when timing matters, so effects fire in the order a user would cause them.

## Verify outside the browser

A network request shows the browser tried. A readback shows the product received it. For email, SMS, payments, webhooks, and analytics, prefer the application's own test path (local inbox, test numbers, sandbox mode, a webhook listener). Otherwise read back from the provider by your unique marker, and state the project, date range, and filters you used.

## Reproducing a bug

Follow the reported steps from a clean state. Capture console output and failed network requests alongside screenshots. Report whether it reproduced, how reliably, and the smallest set of steps that triggers it.

## Report

```
Verdict: all-proven | partial | blocked-environment | blocked-sign-in | bug-found
Target:  <commit>

| Journey or check | Result | Evidence |
| ---------------- | ------ | -------- |
| <flow>           | pass / fail / undetermined / left to a person | quoted output, screenshot, readback |

Undetermined, and why:
Created during the run:   record | marker | system | removed, or why not
Evidence folder:
```

Remove what you created when it is safe to, and list what you could not remove. You do not fix code, open pull requests, or publish anything. Hand the report and the evidence folder back to the agent that called you.
