# Agent Farm

A global CLI that opens native Claude Code or Codex in any repository using a
named agent profile, local skills, explicit child definitions, and workspace MCPs.
Node 22.15+ (macOS/Linux), pnpm 11, and the native harnesses are required.

## Install on your machine

```sh
gh repo clone dcouple/agent-farm
cd agent-farm
pnpm install --frozen-lockfile
pnpm build
mkdir -p ~/.local/bin
ln -s "$PWD/dist/cli.js" ~/.local/bin/agent-farm
agent-farm plugin install
```

Put ~/.local/bin on PATH. `plugin install` installs the bundled dcouple plugin
into ~/.config/agent-farm. Repeating it is safe; updates reject modified local
files rather than overwriting them. Resolve conflicts deliberately. Only plugin
content is managed: local workspaces and native credentials remain untouched.

```sh
cd /any/repository
agent-farm profiles list
agent-farm inspect implementer --workspace keycard
agent-farm run astra-planner --workspace keycard
agent-farm run implementer --workspace keycard --directory /another/repository
agent-farm load astra-planner
agent-farm loaded
agent-farm unload astra-planner
```

Without --workspace, no workspace MCPs are added. Native global tools can still
appear. Add --message to begin a turn immediately; otherwise the native TUI waits
for input. `load` installs skills only; `run` launches the complete identity.

Profiles select one agent. Agent Markdown frontmatter declares model, reasoning,
skills, connections, and explicit native/process child modes; its body contains
instructions. [Configuration reference](CONFIGURATION.md) explains source files,
native output, metadata, reference files, and limits.

## Plugins and publishing

`plugins/dcouple/` is a generated versioned snapshot from
[dcouple/skills](https://github.com/dcouple/skills). Edit the root profiles, agents,
skills, and shared instructions in that repository. Its `pnpm publish:plugin`
command validates and opens a PR here. Do not edit the generated plugin directly.
The plugin manifest includes its source commit, compatible CLI major version,
and file hashes. It contains no workspace credentials or local endpoints.

Local skill development can bypass publishing:

```sh
agent-farm run astra-planner --config-root /path/to/skills --directory /path/to/project
agent-farm plugin validate /path/to/skills
agent-farm plugin install /path/to/generated-plugin
```

Publishing copies a static content package; this version does not execute plugin
hooks. CLI releases and plugin versions are independent. Version 0.1.0 is the
first extracted release, based on Orchestra commit eb4b091.

## Workspaces and authentication

Create ~/.config/agent-farm/workspaces/keycard.yaml with a connections mapping
(type: mcp, auth: native, url: your HTTPS MCP endpoint). Credentials stay in the
native Claude/Codex stores. This migration retains `orchestra_<connection>` MCP
registration names solely to reuse existing native OAuth credentials; it does
not install an orchestra command alias.

Generated bundles live in the target repository's .agent-farm/generated/;
exclude that directory from Git. Native configuration/auth files remain linked
from each generated Codex runtime home. They are not an isolation boundary.
Older generated bundles and local configuration backups remain available to
sessions opened before migration.

## Verification

```sh
pnpm typecheck
pnpm test
```

[Verification history](docs/verification-history.md) records component and native-session
checks and their limits. Full ticket-to-PR acceptance testing remains separate.

The first source-publishing integration is reviewable in
[skills PR #114](https://github.com/dcouple/skills/pull/114), and the publish
command's generated update is [Agent Farm PR #1](https://github.com/dcouple/agent-farm/pull/1).
The bundled plugin remains version 0.1.0 until that update is merged; CLI v0.1.1
and plugin versions are independent.
