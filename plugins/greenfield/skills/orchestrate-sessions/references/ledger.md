# Ledger

`.agent/ledger.json`, kept by the orchestrator. One entry per work item.

```json
{
  "caps": { "concurrent": 3, "spend_usd": null },
  "items": [
    {
      "id": "ENG-123",
      "source": "docs/agent/plans/invoice-pdf/handoff/WP-01.md",
      "urgency": "normal",
      "worktree": "../worktrees/invoice-pdf",
      "branch": "invoice-pdf",
      "profile": "greenfield/implementer",
      "status_file": "../worktrees/invoice-pdf/.agent/status.json",
      "stage": "queued | running | blocked | in review | pr open | done | failed | needs planning",
      "started": "<ISO 8601 time>",
      "last_change": "<ISO 8601 time>",
      "polls_without_change": 0,
      "strikes": 0,
      "cost_usd": null,
      "duration_ms": null,
      "pr": null,
      "blocker": null
    }
  ],
  "decisions": [
    {
      "time": "<ISO 8601 time>",
      "item": "ENG-123",
      "question": "Should the filename use the invoice id or number?",
      "answered_by": "brief | advisor | person",
      "answer": "Invoice id. Brief, Success section."
    }
  ]
}
```
