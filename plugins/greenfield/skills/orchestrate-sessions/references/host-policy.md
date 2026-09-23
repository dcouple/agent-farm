# Host coordination policy

The core workflow is portable. Host-injected instructions specify how to operate the environment; an optional `host_policy` path can point to equivalent local guidance for standalone/custom launches. This argument only makes the document available for the agent to read; it does not configure a runtime adapter or install tools.

Prefer already injected instructions; no extra configuration is needed when they are complete. If a supplied document disagrees with injected guidance, apply normal instruction precedence and explicit user choices. If two equally authoritative directions disagree about ownership or launch behavior, resolve that specific conflict before the affected action. Do not combine incompatible launch paths.

Read only relevant host guidance. A useful host policy identifies:

- Supported discovery commands/tools and the correct app instance.
- Workspace/worktree creation and reuse, ownership and association rules.
- How to launch the chosen Greenfield profile, send context, message and resume a worker.
- Worker-to-parent reporting, completion/blocker events, yielding and bounded waits.
- Durable state location, concurrency/usage limits, and cleanup permissions.

Follow those mechanics exactly within authorized scope. Retain Greenfield's division of labor, explicit phase approval, one implementation writer, verification/review requirements and budget limits. The host may impose stricter limits. Do not infer that host tool availability grants permission to take over unrelated work.

For example, a host that owns feature worktrees and requires association with a coordination session must create and associate the workspace before task submission. A host that requests yielding after dispatch should not receive a second Greenfield polling loop. These are capability contracts, not hardcoded app names or commands.
