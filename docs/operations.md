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

Remote workspace connections use native Claude/Codex authentication. Local stdio
servers use their service CLI or application login. Agent Farm does not
provide its own OAuth credential store. Native credentials stay outside plugin
sources and generated content packages.

Existing installations retain `orchestra_<connection>` MCP registration names
to reuse native OAuth credentials. This is a
registration identifier, not an installed command alias.

Use `agent-farm mcp login CONNECTION [--directory PATH] --harness claude|codex`
for an initial remote OAuth sign-in. The native login owns storage and refresh;
Agent Farm owns only the stable connection definition. On macOS, native Keychain
credentials can be reused across generated runtime homes. Existing Codex file-based
MCP credentials are linked from the original home. Other platforms or new file-store
fallbacks require separate verification; do not assume a successful macOS test proves
every credential backend.

`agent-farm inspect` reports configured connections, not whether they are currently
authenticated or reachable. Use the native harness's MCP view to check connectivity.

## Repository workspace operations

Track `.agent-farm/workspace.yaml` at the repository root, with required `name`
and optional `connections` and text `instructions`. Agent Farm reads this file;
it never creates or modifies it. Launch discovery starts at `--directory PATH`
or the current directory and walks to the nearest `.git` entry, including a
linked worktree's `.git` file.

Selection is `--no-workspace`, then the approved repository workspace plus its
personal overlay, then `<config-root>/workspace.yaml` if no repository workspace
exists, then none. The fallback has optional `name`, no overlay, and no approval.
It is not layered beneath a repository file. This also supports orchestrators
outside repositories; passing another repository as `--directory` selects that
repository's workspace.

`<config-root>/overlays/<name>.yaml` holds personal settings across worktrees.
It accepts `connections` and `instructions`, without `name`. Connection `env`
merges by key with overlay values winning; `env_vars` lists union; other supplied
fields replace shared fields; new connections are added; instructions append.
Validate the merged result, including no `env`/`env_vars` overlap. Conflicts with
agent-defined connections still fail. Overlays need no approval.

```sh
agent-farm workspace trust --directory /path/to/repo
agent-farm workspace show --directory /path/to/repo
agent-farm workspace untrust --directory /path/to/repo
agent-farm workspace load --directory /path/to/repo --harness claude
agent-farm workspace unload --directory /path/to/repo --harness claude
```

Approval records live under `~/.local/state/agent-farm/workspace-trust/`, keyed by
the real Git common directory and SHA-256 of the file. Linked worktrees share
approval for identical content. Trust review shows connections, full commands
and arguments, variable names without values, full instructions, and changes
from the previous approval. `trust --yes` prints the same summary for scripted
setup. `untrust` revokes all versions for the repository. Symlinked files and
workspace paths resolving outside the repository are refused.

Interactive runs ask about untrusted files; declining uses no workspace.
Headless runs, prepared launches, builds, explanations, inspection, login, and
native installation fail with the file path and trust command. Process children
use the parent's snapshot and recheck trust without prompting. If a repository
file changes or approval is revoked, existing dispatchers stop; approve and
rebuild for the new configuration. Changing a file or revoking approval does not
stop an already-running native agent or remove a globally mounted workspace;
use `workspace unload` to remove its owned native configuration.

`workspace show` reviews the merged configuration and field provenance even
before approval. `inspect`, explanations, prepared launches, and manifests
report `workspace_source` with `source`, optional `overlay`, and `trust`.
`set global --directory PATH --harness HARNESS` and `unset global` with the same
options are aliases for workspace load and unload when no profile is supplied.
Ownership and concurrent-change checks protect native configuration and guidance.

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

Generated process-child dispatchers accept `--model`, `--reasoning`, `--speed`,
and repeatable `--arg key=value` alongside the existing launch flags. They
forward only values explicitly supplied to that dispatcher; a child never
inherits its parent's launch overrides or arguments. The child launch validates
against the child's harness and declarations, then writes its own resolved
`LAUNCH CONTEXT` block.

## Launch metadata and bundles

`inspect`, `--explain`, and `--print-launch` report the resolved entry model,
the source of each model field (`agent`, `preset`, or `flag`), resolved launch
arguments, and any profile preset. Model flags are labeled `override: ad hoc`;
saved model presets are labeled `override: preset`. The selected route's
generated `agent.json` contains the same launch metadata for tracing consumers.

Agent Farm first verifies the immutable compiled bundle. When resolved launch
state differs, it creates a second checksum-verified, content-addressed launch
bundle whose identifier includes the model, arguments, sources, and headless
state. This keeps argument data compatible with bundle verification and allows
several argument sets to coexist. Launch arguments are identity context only;
they are never templates for instructions, skills, or configuration files.

## Plugin rollout

The bundled default is `dcouple`; CLI and plugin versions are independent.
Run `agent-farm plugin install` after updating the CLI checkout. Other bundled
folders use `agent-farm plugin install NAME`, and arbitrary sources use a path.
Use `agent-farm plugin list` to audit name, version, source, and profile count.

Installed content is isolated under `plugins/<name>/` and has one receipt at
`.plugins/<name>.json`. Updates hold the shared install lock but compare and
write only that plugin's files and receipt. `plugin uninstall NAME` removes
receipt-owned files only when their hashes still match; modified and missing
paths are reported, and changed files are left in place.

If install detects a legacy flat receipt, it stops without moving or deleting
anything. The error names the receipt and tells the operator to ask an agent to
migrate the configuration into `plugins/<name>/` before retrying. This keeps
legacy cleanup explicit and reviewable instead of guessing which flat files are
still user-owned.

If two plugins publish the same profile, use `plugin/profile` or configure
`default_plugin`. If globally loaded profiles select the same skill directory
name, unload the current owner before loading the other plugin. Collision errors
and `agent-farm loaded` name the owning plugins.

## Verification boundaries

Component tests and native launch/delegation checks are recorded in
[verification history](verification-history.md). A complete ticket-to-PR acceptance
run remains separate. Configuration validation does not establish model availability,
MCP connectivity, or successful execution of every selected skill.

Subscription rotation, automatic cross-harness handoffs, integrated tracing, and
hosted daemon orchestration are not implemented in the current launcher.
