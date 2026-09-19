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
workspace.yaml                 Optional personal fallback workspace
overlays/
  my-project.yaml              Personal project settings
instructions/                  Optional shared instruction includes
plugins/
  dcouple/                     Installed plugin namespace
    plugin.yaml
    profiles/ agents/ skills/ instructions/
.plugins/
  dcouple.json                 Install receipt; do not edit
```

The top-level `profiles/`, `agents/`, `skills/`, and `instructions/` directories
are the unnamed local namespace. Each installed plugin has the same four-section
layout under `plugins/<name>/`. A plugin source directory is also a valid config
root, so `agent-farm run planner --config-root /path/to/plugin` remains the
development workflow.

## Plugin and profile names

Use `plugin/profile` to select an installed profile unambiguously, for example
`agent-farm run dcouple/implementer`. Qualified names contain exactly one slash;
both components use lowercase letters, digits, `_`, and `-`, beginning with a
letter. `run`, `inspect`, `load`, and `unload` all accept qualified names.

A bare name searches the local namespace and every installed plugin. It works
when exactly one candidate exists. If several plugins publish the name, Agent
Farm stops and lists all qualified candidates. Set `default_plugin` in
`settings.json` to make a bare name prefer one plugin while leaving explicit
qualified names unchanged:

```json
{
  "default_plugin": "roles"
}
```

`agent-farm profiles list` prints each qualified name, plugin version, and an
ambiguity marker. `inspect`, `--explain`, `--print-launch`, bundle manifests, and
each bundled `agent.json` include plugin/version metadata. The trace identity is
`plugin/profile@version`; local definitions use `local/profile@local`.

## Profiles

Each YAML file selects `agent: <name>` and may optionally save a partial `model`
override and declared launch `args`:

```yaml
agent: implementer
model:
  name: gpt-6-astra
  reasoning: medium
  speed: fast
args:
  mode: fast
```

Only `agent`, `model`, and `args` are accepted. A model preset may contain any
of `name`, `reasoning`, and `speed`; omitted fields keep the agent value. A
profile still cannot override the harness, tools, instructions, skills,
connections, or children. Command-line flags take precedence over the profile
preset, which takes precedence over agent defaults.

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

Agents may also declare launch arguments in frontmatter:

```yaml
args:
  mode:
    values: [standard, fast]
    default: standard
    description: fast makes the lead do every package itself
  review:
    values: [none, final, full]
    default: final
  parent:
    type: path
    description: status file to keep current
  source:
    type: string
```

Each argument is either an enumeration with a nonempty `values` list or a
free-form `type: string`/`type: path`. `default` and `description` are optional;
an enum default must be one of its values. Argument names use the same lowercase
configuration-name rule as agents. Paths are passed through literally and are
not resolved or checked for existence.

## Launch overrides and context

The repeatable `--arg key=value` flag sets declared arguments. `--model`,
`--reasoning`, and `--speed` override only the entry agent's model for that
launch; compiled child models do not change. Reasoning and speed use the same
harness-specific validation as agent frontmatter, and speed is Codex-only.

```bash
agent-farm run implementer \
  --model gpt-6-astra --reasoning medium --speed fast \
  --arg mode=fast --arg review=full
```

CLI model flags are reported as `override: ad hoc`; a saved model preset is
reported as `override: preset`. Because agent instructions may be tuned for
their configured model, an ad hoc override should be treated as an experiment.

The entry identity always ends with this exact launch-context format, with
declared arguments in declaration order and defaults included:

```text
LAUNCH CONTEXT
headless: true
mode: fast
review: final
parent: ../worktrees/invoice-pdf/.agent/status.json
source: docs/agent/plans/invoice-pdf/handoff/WP-01.md
```

`headless` is `true` for `--exec` and prepared headless launches, and `false`
otherwise. Claude receives the block through `--append-system-prompt`; Codex
receives it through `developer_instructions`. It is present whether or not a
message is supplied. Arguments are context only: there is no templating or
substitution into instructions, skills, or frontmatter.

Launch-specific state is materialized as a separate content-addressed bundle.
Its identifier includes the resolved model, arguments, their sources, and the
headless state. The original compiled bundle remains immutable, both bundles
remain checksum-verified, and launches with different argument values cannot
invalidate one another. The selected route's generated `agent.json` records the
same resolved launch metadata as `--explain` and `--print-launch`.

Within a plugin, bare profile-agent, child-agent, and skill references resolve
only in that plugin, regardless of what else is installed. A child may explicitly
use another plugin (`agent: dcouple/socrates`), and a skill entry may do the same
(`dcouple/review`). Missing dependencies fail validation and launch with the
plugin name; `inspect` records resolved cross-plugin dependencies. Cycles,
connection merging, native-child harness matching, and the one-level native-child
limit apply across namespace boundaries. Instruction paths stay inside the
plugin that owns the agent (or the config root for local agents).

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

## Prepared launches and native arguments

`--print-launch` prints JSON containing `argv` (including `argv[0]`), `cwd`,
`bundle`, `env`, `launch`, effective `telemetry`, profile/plugin/version, trace identity, and
cross-plugin dependencies; `env` contains only Agent Farm's own overrides, never
inherited values. Native arguments go after `--` or through repeatable
`--native-arg` options, precede the message, and replace the default headless
flags when supplied. Consumers spawn the printed `argv` verbatim and must not
assume `argv[0]` is the harness binary.

```bash
agent-farm run my-profile --print-launch --message 'Summarize this project' -- -p --output-format json
```

For the same profile, workspace, and canonical repository directory, Agent Farm
keeps the runtime Codex home and its session files stable across plugin updates,
profile edits, and Agent Farm upgrades, so later launches can resume the same
thread. A different profile, workspace, or directory uses a different home;
process child routes also have separate homes. Bundles remain content-addressed
and integrity-checked, while skill links in the runtime home refresh on launch.

## Local OpenTelemetry collection

Every launched Claude Code or Codex session collects telemetry by default on the
machine running Agent Farm, under `~/.local/state/agent-farm/telemetry/<session-id>/`.
This applies to interactive runs, `--exec`, bundled process children, and commands
spawned from `--print-launch`. Building, explaining, or printing a launch does not
start a receiver or create a session; reusing a printed command creates a new
session each time. Native subagents are represented by their harness's telemetry.

Each directory contains:

- `session.json`: launch metadata, trace/span IDs, running/finished state, and exit
  code or signal. A running record left after a crash or `SIGKILL` is incomplete.
- `traces.jsonl`: native spans and an `agent_farm.session` lifecycle span.
- `logs.jsonl` and `metrics.jsonl`: native events and metrics, when exported.

Each JSONL line is a standard OTLP JSON `ExportTraceServiceRequest`,
`ExportLogsServiceRequest`, or `ExportMetricsServiceRequest`, suitable for later
replay to the corresponding OTLP/HTTP endpoint. No remote export is performed by
Agent Farm. Files use mode `0600` and session directories use `0700`.

Resources carry the harness, agent/profile, plugin/version, model, workspace,
bundle, route, headless mode, OS username/UID, hostname, working directory,
sanitized command arguments, and declared launch arguments. Git repositories also
include worktree path, branch, commit, and the canonical Git common directory as
`agent_farm.project.directory`, shared by linked worktrees. Git remote URLs and
the inherited environment are not recorded. Non-Git directories are supported.

`agent_farm.session.id`, `agent_farm.session.trace_id`, and
`agent_farm.session.span_id` correlate native resources with their launch.
Process children inherit the parent session ID and W3C trace context. Native trace
IDs are preserved: harnesses may start independent traces, particularly interactive
Claude sessions, so use the session attributes to join those traces.

Configure host-local storage in `~/.config/agent-farm/settings.json` (or
`--config-root`). The directory must be absolute:

```json
{
  "telemetry": {
    "enabled": true,
    "directory": "/absolute/path/to/agent-farm-telemetry"
  }
}
```

Set `telemetry.enabled` to `false` to disable collection, or override it for a
launch with `AGENT_FARM_TELEMETRY=off` / `AGENT_FARM_TELEMETRY=on`. Disabling
collection restores direct native execution and leaves native telemetry settings
alone. Process children inherit the host configuration root. Settings are not
embedded in published plugins. Remote exporters such as Langfuse and named
exporter selection are not implemented yet; only local collection is supported.

### Agent access and the local browser

Collection and agent access are separate switches. Collection defaults on;
agent access defaults off. To give every launched profile read-only telemetry
tools, add this to the trusted `.agent-farm/workspace.yaml`:

```yaml
name: my-project
telemetry:
  agent_access:
    enabled: true
    scope: project
```

Optionally restrict access to exact resolved profile names:

```yaml
telemetry:
  agent_access:
    enabled: true
    profiles: [dcouple/implementer, telemetry-analyst]
```

Omitting `profiles` inherits any host/overlay allowlist; if no layer specifies
one, every profile is allowed. `profiles: []` allows none. Lists replace rather
than union across layers. A personal overlay can set `enabled: false` or replace
the list. Plugin profiles require their qualified name (`plugin/profile`). The
entry profile's policy applies to its process children; native subagents inherit
their harness's tools. Rebuild/relaunch after changing workspace policy: already
running harnesses and generated bundles retain their workspace snapshot.

Allowed Claude and Codex launches receive the `agent_farm_telemetry` stdio MCP
server automatically, including prepared launches. No separate profile or skill
is required. Its five read-only tools are `list_sessions`, `get_session`,
`query_spans`, `query_events`, and `summarize_sessions`. `get_session` defaults to
the current recorded session; use `session_id: current` in span/event queries.
When collection is disabled, history remains available but there is no current
session. Inspection and launch explanation report the effective policy and a
`telemetry_access` boolean indicating whether this profile receives the tools.

Project scope includes all linked worktrees of the same canonical Git common
directory. Outside Git it uses the exact canonical launch directory. Agents
cannot change the store path or scope through tool arguments. Only host
`settings.json` may configure `agent_access.scope: "machine"` for automatic
injection; repository and overlay files may only specify `project`. Machine
scope covers all projects in the selected local store, not other stores.

This is a tool-availability policy, **not a filesystem sandbox**: an unrestricted
agent running as your OS user can still read files or invoke commands itself.
Recorded arguments, tool output, and events can contain sensitive or untrusted
text; do not treat telemetry text as instructions.

Open the optional browser UI on demand:

```sh
agent-farm traces
agent-farm traces --project /path/to/repo --no-open
agent-farm traces --directory /path/to/telemetry --scope machine
```

The UI binds only to `127.0.0.1`, uses a random URL token, and validates Host and
Origin. It starts no collection, offers no write endpoints, and stops with
Ctrl-C. It lists and filters sessions, refreshes the list every five seconds, and
shows launch metadata, spans with relative-duration bars, and events. The URL is
a local bearer capability: do not share it. `--port` optionally chooses a port.
The default scope is the current project and the store follows trusted workspace
settings; `--directory` explicitly selects a store without loading the workspace.

For manual MCP configuration use `agent-farm telemetry mcp --project /path/to/repo`
(the same `--directory`, `--scope`, and `--config-root` options are supported).
This explicit command does not apply a profile allowlist; automatic injection
does. Stdout contains only newline-delimited MCP JSON-RPC.

Queries default to 25 results (maximum 100), returning `next_cursor` for more.
Session scans cap at 5,000 directory entries; each signal scan caps at 32 MiB /
10,000 records. Signal pages cap at roughly 128 KiB and oversized records include
truncation notices. Queries report partial or malformed exports; pagination is a
live view and can shift as new sessions arrive. Summaries cover their page only,
not an inferred total. Native token fields are preserved in span attributes but
are not summed across potentially overlapping spans. Missing completion is shown
as `unfinished`, never assumed to mean running or successful. Metrics remain in
the raw OTLP files; metric aggregation is not exposed yet.

### Workspace telemetry settings

The same optional `telemetry` block is accepted in a repository's
`.agent-farm/workspace.yaml`, the personal fallback `<config-root>/workspace.yaml`,
and personal overlays. It supports `enabled` (boolean) and `directory` (absolute
path), with either field omitted to inherit its value. Unknown fields, inline
credentials, and remote endpoint/exporter settings are rejected.

```yaml
# .agent-farm/workspace.yaml
name: my-project
telemetry:
  enabled: true
```

Keep machine-specific paths in host settings or a personal overlay:

```yaml
# ~/.config/agent-farm/overlays/my-project.yaml
telemetry:
  directory: /absolute/path/to/my-project-traces
```

Precedence, from lowest to highest: built-in defaults, host `settings.json`, the
selected workspace, its personal overlay, then `AGENT_FARM_TELEMETRY` for the
on/off switch. Telemetry merges field by field; an empty block inherits everything.
The fallback workspace is selected only when there is no repository workspace
file, and never receives an overlay. `--no-workspace` skips workspace telemetry
but still uses host defaults and the environment override.

Repository telemetry appears in the trust review and telemetry-only changes
require approval just like other workspace changes. `workspace show` reports the
merged workspace fields and provenance; `inspect`, `--explain`, and
`--print-launch` report the effective `telemetry` values without starting collection.

The resolved workspace telemetry is saved as `workspace_telemetry` in the bundle
manifest. Process children use that snapshot rather than rediscovering the
workspace or rereading its overlay. A new launch rebuilds when workspace or
overlay telemetry changes; old repository bundles still fail if their approved
workspace bytes change or approval is revoked. Host defaults and the environment
override remain runtime inputs to each dispatch. Already printed commands retain
the effective settings they were prepared with.

Workspace telemetry affects sessions launched through Agent Farm. Global
workspace installation continues to install only connections and instructions;
it does not change telemetry for native CLI sessions launched independently.

### Collection lifecycle and privacy

With collection enabled, a supervisor inherits the terminal and streams, launches
the harness, forwards termination signals, and preserves its exit status. The
harness has a separate PID. A per-session HTTP receiver binds only to `127.0.0.1`
on an ephemeral port with an unguessable URL path; it accepts OTLP/HTTP JSON, with
an 8 MiB request limit. Local storage/listener failures warn without preventing
the harness from running. Completed exports are saved as they arrive, and shutdown
allows up to one second for in-flight requests after the harness exits.

Agent Farm configures [Codex's OTLP exporters](https://developers.openai.com/codex/config-reference/)
and [Claude Code's telemetry and beta tracing](https://code.claude.com/docs/en/monitoring-usage)
for this receiver. Native detail depends on the installed harness version and its
policy; older versions may emit only logs/metrics, and managed Claude settings can
override telemetry configuration. The lifecycle span is independent of native
telemetry support. The adapters avoid editing native config files. Explicit native
Codex telemetry overrides are superseded while collection
is enabled; inherited OTLP destinations/headers are cleared in the child.

Prompt/instruction text and arbitrary native argument values are omitted from
launch telemetry. Declared arguments with secret- or content-related names are
redacted; other declared values are recorded, so do not put secrets in innocently
named arguments. Native prompt/tool-content logging is disabled, but received
native events can still contain sensitive metadata such as tool errors and paths.
The collector preserves those payloads rather than claiming full content
sanitization. No transcripts or stdout/stderr are captured. There is no automatic
retention policy yet; remove completed session directories when no longer needed.

## Host provider target

To route launches through an API gateway, create `settings.json` in
`~/.config/agent-farm/` (or the directory selected by `--config-root`):

```json
{
  "provider": {
    "name": "openrouter",
    "base_url": "https://openrouter.ai/api",
    "api_key_env": "OPENROUTER_API_KEY",

    // "slash-models" — route only vendor-prefixed slugs (e.g. deepseek/deepseek-v4.1-flash)
    //   through the provider. Native models (gpt-6-astra, claude-fable-5-1) use their
    //   harness directly. Use this when you have native subscriptions (Codex, Claude Code)
    //   AND want to use third-party models via OpenRouter without paying the gateway fee
    //   on models you already have access to.
    //
    // "all" — route every launch through the provider, including native models.
    //   Use this for a corporate proxy, a single billing gateway, or when you don't
    //   have native subscriptions and want everything on one API key.
    "match": "slash-models"
  }
}
```

> **Which `match` should I use?**
> - You have a Codex/Claude Code subscription AND use OpenRouter for third-party models → `"slash-models"`
> - Everything goes through one gateway (corporate proxy, single API key) → `"all"`

Supply the named variable in the child's environment. This host setting is read
at launch, stays outside plugins and bundles, and applies to both harnesses.
`match: "all"` routes every launch through the provider and is the default when the field is absent.
`match: "slash-models"` routes only model slugs containing `/` (like `deepseek/deepseek-v4.1-flash` or `z-ai/glm-5.3-flash`) through the provider; models without `/` (like `gpt-6-astra` or `claude-fable-5-1`) use their native harness and login.
The name must start with a lowercase letter, use letters, digits, underscores or hyphens, and
must differ from the built-in `openai` provider. The URL may use HTTP or HTTPS
and must contain no credentials, query, or fragment. `api_key_env` must name an
environment variable that Agent Farm does not override at launch.

Codex receives a generated runtime `config.toml` with `model_provider` and a
provider table containing `base_url`, `wire_api = "responses"`, and `env_key`.
The profile's model still applies. Native configuration is left untouched;
native credentials and other supported files remain linked when present.
A provider launch works without a native Codex home or login. The endpoint
must support the Responses API. Use the gateway root for `base_url`: Codex
adds `/v1` if absent, while Claude adds `/v1/messages` itself.
Native configuration settings are not copied into the generated provider configuration.

Claude receives `ANTHROPIC_BASE_URL` and all four
`ANTHROPIC_DEFAULT_HAIKU_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`,
`ANTHROPIC_DEFAULT_OPUS_MODEL`, and `ANTHROPIC_DEFAULT_FABLE_MODEL` aliases,
each set to the profile's model. The printed `ANTHROPIC_AUTH_TOKEN` is an
environment reference, such as `${GATEWAY_API_KEY}`. Because Claude treats
that variable literally, the printed argv includes a Node prefix that resolves
the reference inside the launched child, then replaces itself with Claude.
Spawn the complete argv verbatim with the inherited environment plus the
printed overrides. No key value is printed or stored in the bundle; strict
MCP mode and native stdio remain intact. The key need not exist during preparation.

Remove the provider setting to restore native launch behavior, including linking
the native Codex configuration on the next launch.

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

Claude and Codex user skill directories are global. Agent Farm therefore refuses
to load a same-named skill from a different plugin instead of renaming or
overwriting it. The error names the skill and both plugin owners. `agent-farm
loaded` shows the owning plugin for every profile and skill. This conservative
rule is portable across the harnesses: Codex documents duplicate frontmatter
names as separate entries, while Claude documents name-based override precedence.

Native global installs should use `agent-farm load`, rather than directly copying
the authoring directory, so the required metadata filename is generated.

## Workspaces and repositories

Track `.agent-farm/workspace.yaml` at the Git repository root to share project
connections and instructions with every teammate and linked worktree:

```yaml
name: my-project
instructions: |
  Use the authenticated gh CLI for GitHub tasks.
connections:
  project-tools:
    type: mcp
    url: https://YOUR-MCP-SERVER.example/mcp
    auth: native
  gcloud:
    type: mcp
    command: example-cloud-mcp
    env:
      CLOUDSDK_CORE_PROJECT: shared-project
    env_vars: [CLOUD_TOKEN]
```

Only `name`, `connections`, `instructions`, and `telemetry` are accepted. The
optional [telemetry block](#workspace-telemetry-settings) configures local collection.
`name` is required
and uses the configuration-name rule: a lowercase letter followed by up to 63
lowercase letters, digits, underscores, or hyphens. Instructions must be text.
Agent Farm never writes this file. Repository `AGENTS.md`, `CLAUDE.md`, and
references remain repository-owned. Secrets and native OAuth credentials stay
outside authoring files; environment-variable references stay references.

Selection uses `--directory PATH`, or the current directory, in this order:

1. `--no-workspace` selects none.
2. The nearest enclosing Git repository's approved `.agent-farm/workspace.yaml`,
   with its personal overlay.
3. `<config-root>/workspace.yaml`, if there is no repository workspace file.
4. None.

The user fallback uses the same schema, with optional `name`. It needs no
approval, receives no overlay, and is never layered under a repository file.
An untrusted repository file blocks noninteractive use; it does not select the
fallback. An orchestrator can run `agent-farm run PROFILE --directory /other/repo`
to use that project's workspace automatically.

Discovery walks up to the nearest `.git` directory or linked-worktree `.git`
file. A bare repository has no working-tree workspace; absent an enclosing
working tree, it uses the fallback. Malformed Git directory entries fail with an
error. Symlinked workspace files and workspace paths resolving outside the
repository are refused.

### Personal overlays

Put personal settings in `<config-root>/overlays/<name>.yaml`, where `name` is
from the repository file. The overlay accepts `connections`, `instructions`, and `telemetry`,
without a `name` field, and needs no approval. It stays available across worktrees
because it lives outside the repository.

```yaml
# ~/.config/agent-farm/overlays/my-project.yaml
instructions: Use my selected cloud account.
connections:
  gcloud:
    env:
      CLOUDSDK_CORE_ACCOUNT: me@example.com
```

Connections merge field by field: `env` merges by key with the overlay winning;
`env_vars` lists are unioned; every other supplied field replaces its shared
value. Overlay-only connections are added. Overlay instructions follow shared
instructions. For example, shared `env: {PROJECT: team, ACCOUNT: shared}` plus
overlay `env: {ACCOUNT: personal}` yields `{PROJECT: team, ACCOUNT: personal}`.
Telemetry merges field by field with overlay values winning, and reports
per-field provenance. The complete result must pass connection validation, including no overlap between
`env` and `env_vars`. Different definitions in an agent's own connections still
produce a conflict.

### Trust and review

Repository workspaces can launch commands and inject instructions into agents
that bypass native permission prompts. Approve the exact file before using it:

```sh
agent-farm workspace trust --directory /path/to/repo
agent-farm workspace trust --directory /path/to/repo --yes  # scripted approval
agent-farm workspace show --directory /path/to/repo
agent-farm workspace untrust --directory /path/to/repo
```

`trust` shows every connection's type, URL or full command and arguments,
environment variable names without their values, and full instructions. If a
previous version was approved, it shows that version and changed field paths.
`--yes` still prints the summary. Approval is stored under
`~/.local/state/agent-farm/workspace-trust/`, keyed by the real Git common directory
and SHA-256 of the workspace bytes. Identical files in linked worktrees share
approval. Changed content needs approval; `untrust` revokes all approved versions
for that repository. Personal overlays and the user fallback are user-owned.

An interactive `run` asks about an untrusted file. Declining launches without any
workspace and says so. `--exec`, `--print-launch`, `--build`, `--explain`, `inspect`,
noninteractive runs, MCP login, and native workspace installation never prompt;
they fail with the file path and the `workspace trust` command. `workspace show`
is an explicit review operation: it displays the merged workspace, per-field
sources, overlay path, and trust state even before approval, without launching
anything. Its output includes literal non-secret environment settings.

Process children retain their parent's resolved workspace snapshot and launch
directory. Dispatch checks approval again and refuses a changed, missing, or
revoked repository workspace; rebuild through `run` after approving a new version.
Overlay edits affect subsequent builds, not existing child snapshots.

`inspect`, `--explain`, `--print-launch`, and bundle manifests report
`workspace_source`: its `source` is `repository:<path>`, `user:<path>`, or `none`,
with an overlay path when present and a trust state. Generated bundles stay under
`.agent-farm/generated/` in the launch directory. Ignore that generated directory
in Git; Agent Farm prints a one-time hint if it is not ignored.

## Inspection and compatibility names

`agent-farm profiles list` displays each entry point's qualified name, plugin and
version, ambiguity status, and resolved model settings.
`agent-farm inspect PROFILE --directory PATH` returns the full resolved
configuration graph and source paths without generating output. It reports
configured MCP endpoints, not credentials or a live connection status. It also
reports the preset, resolved arguments, resolved model, and the agent/preset
source of each model field. `--explain` and `--print-launch` add the actual
launch metadata, including any flag sources and `ad hoc` override marker.

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

For an HTTPS server that accepts an API-key bearer, name the child environment
variable instead of storing the token:

```yaml
connections:
  api:
    type: mcp
    url: https://mcp.example.com/mcp
    auth: bearer_env
    env_var: SERVICE_TOKEN
```

Supply `SERVICE_TOKEN` in the native client's environment at launch. Claude
receives `Authorization: Bearer ${SERVICE_TOKEN}` and expands the reference
when it loads the MCP configuration. Codex receives
`bearer_token_env_var = "SERVICE_TOKEN"`, including in native child-agent files.
The bundle and launch arguments contain only the variable name, never its value.
`env_var` is required for `bearer_env` and is invalid for `native` or `none`.
Bearer connections do not use the OAuth login command. Claude continues to use
strict MCP mode with workspace and agent connections in the same configuration.

Claude receives an HTTP/stdio MCP JSON configuration; Codex receives equivalent
native configuration, including native child-agent files. Claude native children
inherit their parent's connections. Process children receive their own generated
configuration. Workspace `instructions` are prepended to each agent's instructions;
project/account guidance is context, not an enforced access boundary.

To sign in to a remote OAuth server, use the same workspace and connection name:

```sh
agent-farm mcp login remote-service --directory /path/to/repo --harness codex
agent-farm mcp login remote-service --directory /path/to/repo --harness claude
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

Omit the profile to mount a workspace with `set global`. The equivalent explicit
commands are `workspace load`, `workspace unload`, and `workspace loaded`.

```sh
agent-farm workspace load --directory /path/to/repo --harness codex
agent-farm workspace unload --directory /path/to/repo --harness codex
agent-farm set global --directory /path/to/repo --harness codex
agent-farm set global --directory /path/to/repo --harness claude
agent-farm status global
agent-farm unset global --directory /path/to/repo --harness codex
agent-farm unset global --directory /path/to/repo --harness claude
```

Load resolves the approved repository workspace and overlay, or the user fallback,
from `--directory PATH` (default: current directory). It installs
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
uses `agent-farm mcp login CONNECTION --directory /path/to/repo --harness HARNESS`.
Unload removes configuration, not credentials. Start fresh native sessions to
observe changes. Project-level native settings can override global configuration.
Claude Agent Farm `run` uses `--strict-mcp-config`; scoped launches use their
automatically resolved workspace and agent connections. Global installation is
for native sessions started outside Agent Farm.
