# Native launch prototype verification

The original Python compatibility checks on 2026-09-15 used Claude Code 2.1.273 and Codex 0.154.0.

- The original 11 Python compiler/runtime tests passed before the TypeScript port.
- Both native TUIs opened concurrently in the same scratch repository and read its instruction marker. Each loaded its separately generated proof skill.
- A generated Claude dispatch script launched the generated Codex child and loaded its selected skill. The headless child's public MCP call required approval and did not complete; unattended tool approval remains unresolved.
- Claude called Keycard's GitHub `get_me` tool using its existing native authentication without another browser login.
- After a separate Codex native OAuth login, a fresh generated Codex runtime connected to `orchestra_keycard` with 57 tools without another browser login. It called `mcp__orchestra_keycard__api_githubcopilot__get_me` successfully. The probe returned only a success indicator, without account details.

The Codex result verifies immediate credential reuse through the prototype's separate runtime home and native credential references. It does not prove token refresh after expiry, reuse on another machine, or access to every upstream service. Existing user-level MCP registrations remain visible in Codex; this prototype does not isolate their tool inventory.

The prototype is not the production launcher. Full profile inheritance, workflow dependency packaging, delegation policies, and production authentication lifecycle handling still require implementation and verification.

## TypeScript port

The native launcher now uses Node 22.15+ on macOS/Linux, TypeScript and pinned YAML parsing. The Python launcher sources were removed; already generated Python bundles retain their copied runtime.

The port has 13 Node tests covering the original contracts plus duplicate YAML keys, symlink rejection, child directory collisions, and real subprocess handoff with literal arguments, cwd, native credential references and exit status. Standalone generated child dispatch runs without importing the CLI package. Both installed Codex workflow profiles compile with the Keycard workspace. Full workflow execution, OAuth renewal and unattended approvals remain unverified.

Live TypeScript CLI smoke check: native Claude and Codex TUIs opened in the scratch repository with the selected models; Codex connected to Keycard and listed 57 tools without a new login. The authenticated GitHub tool-call proof above was performed before the language port.

## Profile/agent split and native roles (2026-09-16)

- Typecheck and 19 tests pass, including whole-model replacement, appended
  profile instructions, legacy commands, connection inheritance, and generated
  native child definitions for Claude and Codex.
- Installed three referencing profiles and eleven agent definitions under the
  local central configuration root. Previous profile files were backed up.
- Compiled planner, Astra planner, and implementer with the Keycard workspace.
- Live Codex 0.154.0 accepted `--strict-config` with generated role registrations
  and reported `socrates`, `pr-preparer`, and `qa` in its native spawn tool schema.
- Live Claude Code accepted the generated CLI agent definitions; Fable 5.1
  reported Socrates in its native Agent tool schema. Result metadata confirmed
  the Fable model and no subagents spawned.
- These were read-only registration checks, not end-to-end child execution,
  child model/effort verification, follow-up/resume, or new MCP call tests.
  Native skill selections are explicit bundled paths in role instructions,
  not isolated skill discovery catalogs. Existing global skills remain visible.

## Markdown instructions and workflow-role audit (2026-09-16)

- 22 tests cover directory definitions, ordered Markdown composition, profile
  append behavior, missing/out-of-root files, ambiguous sources, and bundle
  invalidation when instruction text changes.
- A shipped-profile graph test checks all ten implementation children, their
  exact Luna Max/Sol Medium choices, packaged skills, and generated role files.
- All five current/legacy entry points compiled locally with installed skills
  and Keycard: the two ticket-creator entry points declare Socrates, and both
  implementer entry points declare all ten roles. Claude planner declares its
  native Fable Socrates.
- Audited create-ticket, astra-ticket and installed supporting skill Markdown.
  Added the previously implicit fresh-context cold-reader role. Frontend/browser
  and backend verification belong to Astra's pr-test-automation QA role; the
  separate Orchestra /do verifiers are not part of these workflows.
- No live child execution or external publication was performed for this
  migration. Earlier live registration checks remain documented above.

## User-level skill load/unload

- 29 tests pass, including seven user-skill tests exercising shared ownership,
  idempotence, non-destructive collision handling, replaced links, missing source
  files, harness overrides, and original Codex home selection.
- CLI `load`, `loaded`, and `unload` completed successfully in an isolated home.
- Actual user-level skills were not changed during verification. Native discovery
  after a global load has not been exercised against a live model in this change.

## Single-file Markdown agents and entry-only profiles

- 30 tests pass. Tests verify Markdown frontmatter parsing, instruction includes,
  malformed/duplicate metadata rejection, and rejection of behavior in profiles.
- All five installed entry points compile with their expected models, skills,
  Keycard connections, and one or ten native children. Previous installed
  definitions were backed up before migration.
- No new live model or child execution was performed for this format migration.

## Skill metadata naming

- 32 tests pass, including Codex output mapping, Claude omission, byte-preserved
  invocation policy, metadata-sensitive bundle hashes, ambiguous-source
  rejection, and global load/unload with translated native layouts.
- Migrated create-ticket, explain-visually, and pr-test-automation in the local
  central configuration to metadata/codex.yaml with backups and SHA-256
  equality checks. All three pass the skill-creator validator.
- Planner, Astra planner, and implementer compile against the migrated files;
  Codex metadata matches source bytes and Claude output omits it. Live model
  invocation/discovery was not repeated for this filename migration.

## Configuration cleanup and live child checks (2026-09-16)

- 34 tests pass. New coverage requires explicit child launch modes and verifies
  that inspection reports resolved source paths, child models and MCP endpoints
  without generating bundles.
- Added `agent-farm profiles list` and `agent-farm inspect NAME --workspace NAME`.
  Added the explicit `astra-implementer-high` profile; old Codex entry-point
  names remain compatibility aliases. Medium Fast remains `implementer`.
- Archived two obsolete local YAML definitions under central `backups/`.
  Audited and retained 5 checkout bundles and 29 scratch bundle manifests:
  existing sessions can still reference those immutable inputs.
- Live Codex Astra High spawned native Socrates once with fresh context. The
  child rollout `01a0abfb-68cf-78f3-88df-ed15cfc7d2e3` records Luna Max in both
  turn contexts. It read the skill/rubric, completed Keycard GitHub get_me,
  and retained the test marker on the same child's follow-up. The actual tool
  output reports status success and isError false; account contents omitted.
- Live Claude Fable 5.1 spawned Socrates `a7bc00ed9af8b9d98`, read the bundled
  skill/rubric, and resumed that same child with the marker. Its child transcript
  records claude-fable-5-1. Effective reasoning effort is not exposed there;
  the generated role requests High, which is not independent runtime proof.
- Claude's first headless get_me call was blocked by native permissions. A
  separate test allowed only `mcp__orchestra_keycard__api-githubcopilot__get_me`
  via a process-local CLI flag: child `aca730b78229012e1` called it successfully,
  with no permission denials. No saved permission or OAuth settings changed.
- Tests made no repository edits or external writes. Raw test logs and private
  native transcripts remain local; no account response data is published here.

## Standalone Agent Farm extraction

- Agent Farm v0.1.1 builds, typechecks, and passes 36 tests. This includes the
  existing native launcher, skill load/unload, inspection, and metadata-layout
  checks plus plugin integrity and local-edit protection tests.
- The private GitHub CLI dependency installs in dcouple/skills with a pinned
  build allowlist. `pnpm validate` and publish dry run passed.
- The actual publishing command created dcouple/agent-farm PR #1 from committed
  dcouple/skills source; source changes are in dcouple/skills PR #114. Neither
  PR was automatically merged.
- Global `agent-farm` launched Claude planner and Codex Astra planner from a
  newly initialized temporary repository outside the source checkouts. Both
  completed a tool-free READY turn with exit 0. This is a noninteractive runtime
  smoke test; prior native TUI/child/MCP verification is recorded above.
- Local configuration was copied to ~/.config/agent-farm. Existing plugin files
  matched the bundled snapshot, so installation changed no authored content.
  There were no global loaded-profile ownership records to migrate. Old
  configuration and generated bundles were retained for existing sessions.
- The orchestra command symlink was removed. Existing MCP registration names
  were retained for native OAuth continuity. No credentials were committed.

## Direct workspace MCPs — 2026-09-16

The direct-connection implementation adds stdio MCP commands, argument arrays,
non-secret environment settings, forwarded environment-variable names, workspace
instructions, and `agent-farm mcp login` delegation to the native clients.

Validation:

- Typecheck and all 42 tests pass. Tests cover mixed-transport rejection, invalid
  argument/environment settings, native child configuration, literal arguments,
  unexpanded secret references, stable connection identities, existing native
  credential-file links, and native-login command generation.
- Real Claude Fable 5.1 High and Codex Astra High sessions each ran in two distinct
  directories with separately generated bundles. All four runs successfully called
  PostHog, Sentry, Google Cloud, and Grain through MCP.
- Evidence came from native tool-call/tool-result logs, not only model summaries.
  Calls were read-only: PostHog project discovery/read, a scoped Sentry issue query,
  Google Cloud project description, and Grain organization workspace listing.
- Initial OAuth was completed separately for PostHog/Sentry in each harness.
  Subsequent generated sessions, including the second directory, needed no login.
- gcloud reused its local credentials with per-process account/project settings;
  the machine's active gcloud configuration remained unchanged. Grain reused the
  installed app's login after its CLI wrapper was repaired.
- GitHub uses the existing authenticated `gh` CLI; no GitHub MCP was installed
  into the workspace. Image generation was left unchanged.

Limits: this proves read access and credential reuse on this Mac with its current
native clients and credential stores. It does not test provider-side token expiry,
revocation, refresh under concurrency, other operating systems, or write access.
PostHog reported that some write-scoped operations were unavailable; the read tests
passed. Raw logs and machine-specific workspace definitions remain local rather
than being committed. New native-login CLI routing is covered by tests; browser
consent was exercised through the underlying native login commands.

## Global workspaces and connection context — 2026-09-16

- Per-connection descriptions are rendered into each resolved agent's instructions,
  including native and process children, without modifying MCP transport settings.
- Typecheck and 54 tests pass. Global workspace tests cover both harnesses,
  idempotent loading, collision refusal, ownership checks, preservation of unrelated
  edits, environment references, source-independent unload, write-failure rollback,
  native-home overrides, symlink refusal, and CLI routing.
- In isolated temporary user homes, each installed native CLI's `mcp get` command
  discovered an Agent Farm-loaded stdio entry and no longer found it after unload.
  Claude identified its scope as user configuration, available across projects.
  This checks native configuration discovery, not MCP protocol connectivity: the
  probe used `echo` as a placeholder command, so Claude reported connection closed.
- Claude's own `mcp add-json --scope user` confirmed the `.claude.json` location
  under a custom `CLAUDE_CONFIG_DIR`. No real user-level tools or skills were loaded
  by these checks. Live remote-service connectivity was tested separately above.

## Global skill ownership and migration — 2026-09-16

Global commands now use `set global`, `unset global`, and `status global` for
profiles and workspaces. Profile launches warn about personal global skills
without blocking or automatically removing them. Ownership requires both the
receipt and an unchanged installed symlink.

Isolated tests cover saving and remounting complete skill folders for Claude and
Codex, executable supporting files, shared user directories, external symlink
target preservation, changed managed links, collisions, rollback after an unmount
failure, CLI syntax, and warnings before a fake native executable is launched.
These tests do not load, remove, or migrate real user skills.

Discovery scope follows the documented personal locations for
[Codex](https://learn.chatgpt.com/docs/build-skills) and
[Claude Code](https://code.claude.com/docs/en/skills), plus the existing Codex
native-home skill directory used by Agent Farm. Account-synced, plugin, system,
and legacy command installations are not migrated.
