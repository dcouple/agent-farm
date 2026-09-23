> Legacy format, kept so existing plans can still be read. New Greenfield plans use `cover-sheet.md`. When reading an old plan, take its requirements and checks; the single implementer chooses its own files and coding details.

# Handoff card

The whole of one implementer session's context. Cut one per package from PLAN.md and save it at `docs/agent/plans/{slug}/handoff/WP-nn.md`. An orchestrator passes this file by path.

The card repeats the plan header lines an implementer needs, so it never has to open the cover sheet or the planning conversation.

```
Source:           docs/agent/plans/invoice-pdf/PLAN.md#WP-04
Decisions locked: Scheduling: delayed jobs on the existing queue
Constraints:      no new dependencies; no schema change
Ask first:        migrations; anything touching production
Review:           {copied from the plan header}
Level:            {copied from the package, with its why}
Files allowed:    lib/pdf/invoice.ts, app/invoices/[id]/page.tsx, tests/invoices/*
Context to read:  {copied from the package}
Steps:            {copied from the package}
Done when:        {copied from the package, with check kinds}
Escalate if:      {copied from the package}
Forbidden:        {copied from the package}

Instruction: Complete WP-04 completely. Stop when its done-when checks pass.
Do not expand scope.
```
