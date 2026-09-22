# Preflight

Run before any code changes. Cheap, read-only, a few minutes at most. The goal is to find out now, not after three hours of work, that the result cannot be verified.

| Check | How | If it fails |
| --- | --- | --- |
| `command` checks can run | The script exists in the package manifest, dependencies are installed, the test runner starts | blocked |
| Baseline | Run the narrowest suites the plan names, once. Record failures that exist before your changes | not a blocker. Record them so they are not attributed to you. If the baseline is so broken that the checks mean nothing, blocked |
| App starts | Start the dev server or simulator the journeys need, then stop it | blocked, when the plan has `journey` or `visual` checks |
| Browser automation | The tools `qa` needs are available in this session | blocked, when the plan has `journey` or `visual` checks |
| Test accounts and seed data | Log in with the test identity the journeys use | blocked |
| Design reference | The file or link in the plan opens | blocked, when the plan has `visual` checks |
| External effects | Test-mode keys and listeners for email, payments, webhooks, analytics the plan verifies | blocked for those checks. Say which |
| Push and pull request | `gh auth status`, push access to the branch | blocked |
| Reviewers | The `reviewer` launcher exists and is executable. For a dual review, `second-reviewer` is also listed in your instructions | blocked, unless `review: none` |
| Verification needs | Every item the plan lists under that heading | blocked |

Report preflight as a short table in your first status update: check, result, note.

Blocked is not failed. Blocked means a required decision, permission, or prerequisite is missing and the run can resume when the gap is filled, whether or not implementation has started. Failed means diagnosis and advisor input leave no viable in-scope repair.

If a capability disappears mid-run, for example qa loses its login, mark the affected checks `undetermined`. Diagnose and restore it only when safe and authorized; otherwise report the concrete blocker. Do not work around a missing capability by weakening the check.
