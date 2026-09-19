# Example repository workspace

Copy `.agent-farm/workspace.yaml` to the same relative location at the root of
your own Git repository. It supplies the public documentation MCP connection to
both harnesses. Keep this file tracked and ignore `.agent-farm/generated/`.

Run inside that repository:

```sh
agent-farm workspace trust
agent-farm workspace show
agent-farm run PROFILE --explain
```

This directory illustrates the layout; it is not itself a Git repository.
A personal overlay, if needed, lives at
`~/.config/agent-farm/overlays/public.yaml` outside the repository.
