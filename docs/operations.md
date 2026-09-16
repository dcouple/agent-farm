# Operational notes

## Launch permissions

New launches use Codex `--yolo` and Claude `--dangerously-skip-permissions` by
default, including headless runs and generated process children. Codex bypasses
approval prompts and sandboxing; Claude bypasses permission checks. Agent Farm
does not modify native global permission settings.

Existing sessions and previously generated standalone child launchers retain
their original configuration. Launch again through Agent Farm to generate a
bundle with the updated defaults.

## Authentication and MCP connections

Workspace connections use native Claude/Codex authentication. Agent Farm does not
provide its own OAuth credential store. Native credentials stay outside plugin
sources and generated content packages.

Existing installations retain `orchestra_<connection>` MCP registration names
to reuse native OAuth credentials. This is a
registration identifier, not an installed command alias.

`agent-farm inspect` reports configured connections, not whether they are currently
authenticated or reachable. Use the native harness's MCP view to check connectivity.

## Generated files and shared configuration

Launch bundles live in the destination repository's `.agent-farm/generated/`.
Exclude this directory from Git. Keep bundles needed by running sessions.

Generated Codex runtime homes link native configuration and authentication files.
Native global skills and tools may remain visible. Bundles allow distinct agent
configurations to operate in the same directory; they do not isolate filesystem
changes, credentials, or native global configuration. Use separate worktrees when
concurrent agents should make independent code changes.

Older bundles and migration backups may remain for sessions opened before the
Agent Farm extraction.

## Child agents

Child bindings explicitly use `native` or `process`. Native delegation follows the
chosen harness's capabilities; process delegation launches a separately generated
agent configuration. Cross-harness children use process mode.

Native child declarations support one level; nested native child declarations are
rejected. Instructions asking a child not to delegate are not a security boundary.
See the verification history for the native behaviors that have been exercised.

## Plugin rollout

The bundled plugin is `dcouple` 0.1.3, including the SEO profile. The source
migration merged in [skills PR #114](https://github.com/dcouple/skills/pull/114),
and the generated package merged in
[Agent Farm PR #3](https://github.com/dcouple/agent-farm/pull/3).
Run `agent-farm plugin install` after updating the CLI checkout to apply the
bundled configuration. CLI v0.1.1 and plugin versions are independent.

## Verification boundaries

Component tests and native launch/delegation checks are recorded in
[verification history](verification-history.md). A complete ticket-to-PR acceptance
run remains separate. Configuration validation does not establish model availability,
MCP connectivity, or successful execution of every selected skill.

Subscription rotation, automatic cross-harness handoffs, integrated tracing, and
hosted daemon orchestration are not implemented in the current launcher.
