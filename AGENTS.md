# Agent Farm

Native Claude/Codex CLI launcher. Node 22.15+, pnpm 11, TypeScript.

Run `pnpm typecheck` and `pnpm test` before committing runtime changes.
`plugins/dcouple/` is generated from dcouple/skills; update it through that repository’s publish command. Never put credentials or local workspace connections in a plugin.
Use HTTPS for git. Do not commit tmp/, dist/, node_modules/, or .DS_Store.
