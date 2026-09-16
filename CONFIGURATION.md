# Configuration files

The central authoring directory is `~/.config/agent-farm/`:

```text
profiles/
  planner.yaml                 CLI entry point: agent: planner
  astra-planner.yaml           CLI entry point: agent: astra-planner
  implementer.yaml             CLI entry point: agent: implementer
agents/
  planner.md                   Agent configuration + instruction body
  astra-planner.md
  implementer.md
  astra-socrates.md            Child agent, selected by a parent definition
skills/
  create-ticket/
    SKILL.md                   Shared skill description + workflow instructions
    metadata/
      codex.yaml               Codex UI metadata and invocation policy
    references/
      intent-handoff.md        Supporting guidance
      socrates.md              Shared premise-review rubric
workspaces/
  my-project.yaml                 Workspace MCP connections
instructions/                  Optional shared instruction includes
backups/                       Local migration backups, not active definitions
```

## Profiles

Each YAML file contains only `agent: <name>`. Profiles are launchable entry
points; they do not override model settings, tools, instructions, or children.
`agent-farm run NAME` launches the complete identity. `agent-farm set global NAME` loads
only its selected top-level skills into the native user skill directory.

## Agents

Each Markdown filename is the agent identifier. YAML frontmatter defines the
harness, model/effort, description, skills, connections, and child bindings. The
Markdown body contains its instructions. Every child binding declares `mode: native` or `mode: process`; omitted modes
and shorthand child names are rejected. Shared instruction files may be
prepended with `instructions_files`. Actual agents live here whether they are
used as entry points, children, or both. A reference document such as
`skills/create-ticket/references/socrates.md` is a reusable rubric, not another
agent definition.

## Skills

`SKILL.md` frontmatter provides the skill name and description; its body defines
the workflow. Supporting documents remain in `references/`; executable helpers
and assets keep their own appropriate directories. Agent definitions select
skills by directory name.

`metadata/codex.yaml` contains the existing Codex-native metadata schema:

```yaml
interface:
  display_name: Create Ticket
  short_description: Preserve intent and outcomes in tickets and Grain
  default_prompt: Use $create-ticket to capture intent and outcomes.
policy:
  allow_implicit_invocation: true
```

These settings describe how Codex presents and invokes the skill. They do not
declare child agents. The launcher preserves their bytes when translating the
filename; it does not reinterpret policy or infer a Claude equivalent.

## Source files versus native output

| Authoring file | Generated Codex skill | Generated Claude skill |
| --- | --- | --- |
| SKILL.md | SKILL.md, unchanged | SKILL.md, unchanged |
| metadata/codex.yaml | agents/openai.yaml | Omitted |
| references and other support files | Preserved | Preserved |

The generated `agents/openai.yaml` name is Codex's native convention. It will
still appear inside generated bundles; it is not part of the central authoring
layout. Imported skills with that native filename remain supported. A skill
containing both metadata filenames fails rather than choosing one silently.

Session bundles copy the translated files under the destination repository's
`.agent-farm/generated/`. User-level `load` builds a native layout for normalized
skills under `~/.cache/agent-farm/user-skill-layouts/`, using file links to the
central sources, and links that layout into the native user skills directory.
Existing file edits remain live. After adding/removing files or renaming a
metadata path, unload all profiles sharing that skill and load them again.
Unloading removes owned user-skill links, not source files or cached layouts.

Native global installs should use `agent-farm load`, rather than directly copying
the authoring directory, so the required metadata filename is generated.

## Workspaces and repositories

Workspace YAML supplies named MCP connections. Repository `AGENTS.md`,
`CLAUDE.md`, and repository references remain repository-owned; the central
agent definitions do not replace them. Secrets and native OAuth credentials
remain outside these authoring files.

For example, `workspaces/my-project.yaml` can declare a remote MCP server:

```yaml
connections:
  project-tools:
    type: mcp
    url: https://YOUR-MCP-SERVER.example/mcp
    auth: native
```

Replace the placeholder with your provider's endpoint, then use
`agent-farm run astra-planner --workspace my-project`. Provider-specific setup
belongs with the configuration package that uses it.

## Inspection and compatibility names

`agent-farm profiles list` displays each entry point's resolved model settings.
`agent-farm inspect PROFILE --workspace WORKSPACE` returns the full resolved
configuration graph and source paths without generating output. It reports
configured MCP endpoints, not credentials or a live connection status.

`codex-issue-creator` aliases `astra-planner`. `codex-implementer` aliases the
explicit `astra-implementer-high` entry point. The `implementer` entry point
selects Medium Fast. Compatibility names preserve existing commands.

## Local MCP servers and native sign-in

A workspace can combine HTTPS servers with local stdio processes:

```yaml
instructions: |
  Use the project associated with this workspace. Keep operations within
  the repository and scope requested by the user.
connections:
  remote-service:
    type: mcp
    url: https://YOUR-MCP-SERVER.example/mcp
    auth: native
  local-service:
    type: mcp
    command: example-mcp-server
    args: [serve]
    env:
      PROJECT_ID: example-project
    env_vars: [EXAMPLE_API_TOKEN]
```

Choose either `url` with `auth`, or `command` with optional `args`, `env`, and
`env_vars`. Arguments are passed as an array, without shell evaluation. Commands
must be available on PATH or use an absolute path; servers run in the chosen
repository. `env` contains literal **non-secret** settings. `env_vars` names
variables inherited at launch, without resolving their values into the bundle.
Do not put tokens in URLs, arguments, or literal environment values.

Claude receives an HTTP/stdio MCP JSON configuration; Codex receives equivalent
native configuration, including native child-agent files. Claude native children
inherit their parent's connections. Process children receive their own generated
configuration. Workspace `instructions` are prepended to each agent's instructions;
project/account guidance is context, not an enforced access boundary.

To sign in to a remote OAuth server, use the same workspace and connection name:

```sh
agent-farm mcp login remote-service --workspace my-project --harness codex
agent-farm mcp login remote-service --workspace my-project --harness claude
```

The command runs the native client's login flow. Complete the browser consent in
an interactive terminal. Claude and Codex keep separate native credentials; a
first login can be required for each. Stable server names and URLs reuse credentials
across repositories. Changing an endpoint or connection name can require another
login. Refresh failures, revoked access, and provider policy can also require login.

Claude login uses a small private configuration under
`~/.cache/agent-farm/mcp-login/`; it does not register workspace tools globally.
Codex login targets the original native Codex home, even when invoked from inside
an Agent Farm session. No tokens are copied into launch bundles. Local MCP servers
use their own service's authentication; use that service's login command.

## Connection descriptions

Remote and local connections may include an optional `description`:

```yaml
connections:
  analytics:
    type: mcp
    url: https://YOUR-MCP-SERVER.example/mcp
    auth: native
    description: |
      Query product analytics for this workspace's project.
      Select the project before running queries.
```

Agent Farm renders nonempty descriptions from each agent's resolved connections
into a **Workspace tools** section in its generated instructions. The section
includes the connection name and native MCP registration name, and reaches both
native and process children. A connection added only to a child contributes
instructions only to that child. Descriptions also work on agent-defined
connections. Existing connection conflict rules still apply.

Use descriptions for a service's purpose, project selection, and usage guidance.
Keep workspace-wide guidance in the optional top-level `instructions` field.
Descriptions are prompt context, not native MCP transport settings, authentication,
access restrictions, or replacements for the server's tool schemas. Do not include
secrets in descriptions.

## Global workspace installation

```sh
agent-farm set global --workspace my-project --harness codex
agent-farm set global --workspace my-project --harness claude
agent-farm status global
agent-farm unset global --workspace my-project --harness codex
agent-farm unset global --workspace my-project --harness claude
```

Load reads `workspaces/my-project.yaml` from the configured library. It installs
all of that workspace's connections, global `instructions`, and connection
`description` fields. Agent-specific connections are not included. No profile or
model settings are changed. There is one global workspace slot per harness.

| Harness | MCP configuration | Workspace guidance |
| --- | --- | --- |
| Claude Code | `~/.claude.json`, user `mcpServers` | `~/.claude/CLAUDE.md` |
| Codex | `~/.codex/config.toml`, `mcp_servers` | `~/.codex/AGENTS.md`, or existing `AGENTS.override.md` |

`CLAUDE_CONFIG_DIR` moves both Claude files into that directory (`.claude.json`
and `CLAUDE.md`). Codex uses `AGENT_FARM_NATIVE_CODEX_HOME`, the legacy native-home
variable, or `CODEX_HOME` before its default directory. This targets the original
native home when the command runs inside an Agent Farm session.

Agent Farm records ownership under
`~/.local/state/agent-farm/user-workspaces/state.json`. It refuses existing server
names, unmanaged workspace markers, and symlink configuration/context files.
Loading the same unchanged workspace again is idempotent. Unload verifies owned
entries and removes its marked guidance; it preserves unrelated entries and
instructions. Codex's surrounding TOML formatting is preserved; Claude JSON is
reformatted. Changes to managed entries or guidance must be reconciled before
unloading. Keep the ownership registry until unloading is complete; the original
workspace source is not needed for unload.

Writes use atomic file replacement, concurrent-change checks, an Agent Farm
operation lock, and rollback on write errors. Avoid editing native configuration
while loading or unloading. An interrupted process can leave a lock directory;
remove it only after confirming no workspace operation is still running.

Authentication remains native. Environment-variable references remain references;
Agent Farm does not resolve secret values into configuration. Remote login still
uses `agent-farm mcp login CONNECTION --workspace my-project --harness HARNESS`.
Unload removes configuration, not credentials. Start fresh native sessions to
observe changes. Project-level native settings can override global configuration.
Claude Agent Farm `run` uses `--strict-mcp-config`; explicitly select `--workspace`
on scoped launches instead of relying on the global installation.
