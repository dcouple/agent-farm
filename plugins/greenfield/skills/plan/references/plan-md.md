# PLAN.md

Plain text in the worktree at `docs/agent/plans/{slug}/PLAN.md`. The reader is the implementer lead. Keep the human story in the cover sheet. This file has a short header and then the packages.

```
# Plan: {feature}
Cover sheet: {link}
Source: {brief, bug report, or ticket link}
Decisions locked: {one line each, for example "Scheduling: delayed jobs on the existing queue"}
Constraints: {for example "no new dependencies; no schema change"}
Ask first: {for example "migrations; anything touching production"}
Design reference: {path or link, or none}
Verification needs: {what must exist to prove the result: test accounts, seed data, env vars,
                    test-mode keys, services that must be running, browser automation}

## Journeys to verify
1. {user flow qa will drive after the last package}

## Whole-feature check
{commands and suites}

## Order
WP-01 -> WP-02 -> WP-04
WP-03 can run any time after WP-01

## Bounce to planner if
{conditions that mean the plan, not a package, is wrong}

## WP-01: {title}
...
```
