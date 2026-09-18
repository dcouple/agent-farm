![Agent Farm — a pixel-art robot tending skill crops beside native terminal huts](docs/assets/agent-farm-banner.png)

# Agent Farm

**Load the right skills for each job. Keep your native terminal.**

Agent Farm is a harness configurator. A harness is the full working setup around
an AI model — instructions, tools, permissions, and checks. Agent Farm lets you
save different setups and switch between them without reinstalling everything
for every conversation.

Pick a setup, point it at a repo, and Agent Farm opens your native Claude Code
or Codex terminal with that configuration loaded.

Think of each setup as a desk prepared for a job. For SEO, you might lay out site
references, search tools, and a skill that walks through researching and improving
a page. For presentations, you bring brand guidelines, slide tools, and a workflow
for turning an outline into a story. Each setup keeps the relevant material close
to the work.

## Install

Requires **Node 22.15+**, macOS or Linux, and the Claude Code and/or Codex CLI
installed and authenticated.

```sh
npm install --global @greenfieldco/agent-farm
```

Or install from source:

```sh
git clone https://github.com/dcouple/agent-farm.git
cd agent-farm
pnpm install --frozen-lockfile && pnpm build
mkdir -p ~/.local/bin
ln -s "$PWD/dist/cli.js" ~/.local/bin/agent-farm
```

Add `~/.local/bin` to your shell's `PATH`, then:

```sh
agent-farm init
```

After pulling updates, run `agent-farm plugin install` to sync new profiles.

It checks your prerequisites, installs the default profiles and skills, explains
how everything fits together, and offers to launch your first session.

## Profiles

Agent Farm ships with profiles for discussion, research, implementation, and
experimentation. Run `agent-farm profiles list` to see all installed profiles.

**Core profiles:**

- `astra-discuss` — discuss work, clarify intent, create tickets and Grain briefs. The default starting point for any new task.
- `astra-researcher` — deep dives, tech research, product comparisons, visual field guides. Outputs to Grain, artifacts, or local files.
- `implementer` — take a ticket through planning, implementation, review, and PR.

**Experimental profiles** — benchmark cheap models against the frontier:

- `exp1-luna-xhigh` — pure Luna XHigh stack on Codex. Proven daily-driver.
- `exp2-deepseek-flash` — DeepSeek V4.1 Flash on Codex via OpenRouter. Highest bench scores among cheap models.
- `exp3-glm-flash` — GLM 5.3 Flash on Codex via OpenRouter. Cheapest per-session.
- `exp6-fable-gauntlet` — Fable 5.1 Gauntlet Loop. Fan-out, harsh critic, blind compare.
- `exp7-astra-manager-loop` — Astra Manager Loop. Phased checklist, parallel workers.
- `exp8-glm-deepseek-loop` — GLM plans, DeepSeek builds, GLM audits. Two cheap models in complementary roles.
- `exp9-meta-orchestrator` — Astra orchestrates and delegates to other profiles across harnesses.
- `exp10-luna-meta-orchestrator` — same as exp9 but on Luna XHigh for cheaper orchestration.

## Using third-party models via OpenRouter

Agent Farm can route profiles with vendor-prefixed model slugs (like
`deepseek/deepseek-v4.1-flash`) through OpenRouter while keeping native
models on their harness. One-time setup:

```sh
export OPENROUTER_API_KEY="sk-or-..."
echo 'export OPENROUTER_API_KEY="sk-or-..."' >> ~/.zshrc

agent-farm provider set openrouter \
  --base-url https://openrouter.ai/api \
  --api-key-env OPENROUTER_API_KEY
```

Then set `"match": "slash-models"` in `~/.config/agent-farm/settings.json`
so native models (gpt-6-astra, claude-fable-5-1) skip the provider:

```json
{
  "provider": {
    "name": "openrouter",
    "base_url": "https://openrouter.ai/api",
    "api_key_env": "OPENROUTER_API_KEY",
    "match": "slash-models"
  }
}
```

After that, all profiles route automatically — no switching between runs.
See the [configuration reference](CONFIGURATION.md) for details on `match` modes.

## Four entry points

![A pixel-art farm crossroads with signs for init, interactive, help, and doctor](docs/assets/entry-points-pixel-farm.png)

```sh
agent-farm init         # First-time setup — the starting point
agent-farm              # Interactive — pick a profile, create one, launch
agent-farm help         # Reference — every command, for humans and agents
agent-farm doctor       # Diagnostic — check prerequisites, config, profiles
```

`agent-farm init` is where you start. After that, `agent-farm` is your
everyday launcher. `agent-farm help` is the single discovery point for all
commands. `agent-farm doctor` tells you what's working and what's not.

### For power users

```sh
agent-farm run planner
agent-farm run implementer --workspace my-project --message "Fix the failing tests"
```

Run `agent-farm help run` for all flags.

## How it works

![Pixel-art workflow: choose a profile, assemble a launch bundle with shared skills, child agents, and optional workspace connections, write it to the repository, and open the native terminal](docs/assets/how-it-works-pixel-farm.png)

Choose a profile to select an agent's harness, model, and instructions. Agent Farm
combines that definition with shared skills, child agent definitions, and optional
workspace MCP connections into a launch bundle in `.agent-farm/generated/` in the
target repository, then opens Claude Code or Codex to work there.

- **Profile** — a saved setup. "When I say *planner*, I mean: use this AI, with these skills, at this thinking level." Like choosing which worker to send.
- **Agent** — the worker definition. Which AI brain, what it knows, what instructions it follows, who it can delegate to.
- **Skill** — a playbook. Step-by-step instructions for a kind of task: how to create a ticket, review code, or investigate a bug.
- **Workspace** — the toolbox for a project. Which external tools (Linear, Sentry, databases) an agent can reach when working on that project.

## Configuration

![A pixel-art farm shed organizing profiles, agents, skills, and workspaces into four labeled compartments](docs/assets/configuration-pixel-farm.png)

All config lives in `~/.config/agent-farm/`. The interactive CLI creates
profiles and workspaces for you. To edit by hand:

```text
~/.config/agent-farm/
├── profiles/        # planner.yaml → agent: planner
├── agents/          # planner.md → harness, model, skills, instructions
├── skills/          # Reusable skill directories with SKILL.md
└── workspaces/      # MCP connections per project
```

See the [configuration reference](CONFIGURATION.md) for file formats, child
agents, skill metadata, and workspace connections.

## Releases

### 0.1.2

- Interactive setup, diagnostics, and managed global skills and MCP connections.
- Printable native launches with argument passthrough and stable Codex resume homes.
- Environment-variable bearer authentication for HTTP MCP connections and provider targeting.
- Bundled dcouple plugin 0.1.7 with updated profiles and skills.
- Tag-validated npm publishing with package integrity checks and provenance.

## Releasing

Before the first release, open the package's Settings on npmjs.com, find
Trusted Publisher, and select GitHub Actions. Set the organization to `dcouple`,
repository to `agent-farm`, and workflow filename to `publish.yml`. Leave the
environment name empty and allow direct publishing with `npm publish`.
No npm token or repository secret is required. See the
[npm Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/).

Bump the version in `package.json`, commit it, and push the commit. Then tag
that commit and push the tag:

```sh
git tag vX.Y.Z
git push origin vX.Y.Z
```

The release workflow checks that the tag matches the package version, runs the
tests, builds, and publishes the public package using Trusted Publishing (OIDC).
The workflow pins npm to `11.5.1`; npm automatically generates provenance.

## Documentation

- [Configuration reference](CONFIGURATION.md)
- [Operational notes](docs/operations.md)
- [Verification history](docs/verification-history.md)
- [Example configurations](examples/)
- [Skill and profile sources](https://github.com/dcouple/skills)
