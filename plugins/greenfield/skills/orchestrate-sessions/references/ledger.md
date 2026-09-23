# Ledger

Use host durable state when available; otherwise `.agent/ledger.json`. Keep one entry per work item. Host IDs are opaque and distinct from `status_file`; do not infer associations.

```json
{
  "caps": { "concurrent": 3, "spend_usd": null },
  "items": [
    {
      "id": "ENG-123",
      "source": "/absolute/bundle/cover-sheet.html",
      "urgency": "normal",
      "worktree": "../worktrees/invoice-pdf",
      "branch": "invoice-pdf",
      "profile": "greenfield/implementer",
      "status_file": "../worktrees/invoice-pdf/.agent/status.json",
      "stage": "queued | running | blocked | in review | pr open | done | failed | needs planning",
      "started": "<ISO 8601 time>",
      "last_change": "<ISO 8601 time>",
      "host_workspace_id": null,
      "host_worker_id": null,
      "owning_session_id": null,
      "last_event_id": null,
      "phase": "planning | awaiting approval | implementing | complete",
      "source_revision": null,
      "implementation_approval": null,
      "host_policy": "injected or explicit document path",
      "bundle": null,
      "post_mortem": null,
      "trace": null,
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
