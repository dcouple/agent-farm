export interface Flag {
  name: string;
  description: string;
  type: 'string' | 'boolean';
  default?: string;
}

export interface Command {
  name: string;
  usage: string;
  group: 'start' | 'launch' | 'inspect' | 'configure' | 'plugins';
  description: string;
  flags?: Flag[];
  examples?: string[];
}

export const commands: Command[] = [
  {
    name: 'run',
    usage: 'agent-farm run NAME [options]',
    group: 'launch',
    description: 'Launch a profile in the native Claude Code or Codex terminal.',
    flags: [
      {name: 'workspace', description: 'Add MCP connections from a workspace', type: 'string'},
      {name: 'directory', description: 'Repository to open', type: 'string', default: 'cwd'},
      {name: 'message', description: 'Send an initial message after launch', type: 'string'},
      {name: 'build', description: 'Generate the bundle and print its path (no launch)', type: 'boolean'},
      {name: 'explain', description: 'Print the resolved launch command as JSON (no launch)', type: 'boolean'},
      {name: 'exec', description: 'Headless execution (no interactive terminal)', type: 'boolean'},
      {name: 'config-root', description: 'Configuration directory', type: 'string', default: '~/.config/agent-farm'},
    ],
    examples: [
      'agent-farm run planner',
      'agent-farm run implementer --directory ~/repos/my-app',
      'agent-farm run astra-planner --workspace my-project --message "Plan issue #42"',
    ],
  },
  {
    name: 'init',
    usage: 'agent-farm init [--full]',
    group: 'start',
    description: 'First-time setup. Checks prerequisites, installs the default plugin, and walks through available profiles.',
    flags: [
      {name: 'full', description: 'Show everything at once (no step-by-step prompts)', type: 'boolean'},
    ],
    examples: [
      'agent-farm init',
      'agent-farm init --full',
    ],
  },
  {
    name: 'profiles list',
    usage: 'agent-farm profiles list',
    group: 'inspect',
    description: 'List all installed profiles with their agent, harness, and model.',
    flags: [
      {name: 'config-root', description: 'Configuration directory', type: 'string', default: '~/.config/agent-farm'},
    ],
    examples: [
      'agent-farm profiles list',
    ],
  },
  {
    name: 'inspect',
    usage: 'agent-farm inspect NAME [--workspace NAME]',
    group: 'inspect',
    description: 'Show the resolved agent graph for a profile: model, skills, children, connections, and source files. Output is JSON.',
    flags: [
      {name: 'workspace', description: 'Include workspace connections in the resolved graph', type: 'string'},
      {name: 'config-root', description: 'Configuration directory', type: 'string', default: '~/.config/agent-farm'},
    ],
    examples: [
      'agent-farm inspect planner',
      'agent-farm inspect astra-planner --workspace my-project',
    ],
  },
  {
    name: 'status global',
    usage: 'agent-farm status global [--harness claude|codex]',
    group: 'inspect',
    description: 'Show all global skills: managed (by Agent Farm), unmanaged (pre-existing), or changed (modified managed links).',
    flags: [
      {name: 'harness', description: 'Filter to one harness', type: 'string'},
    ],
    examples: [
      'agent-farm status global',
      'agent-farm status global --harness claude',
    ],
  },
  {
    name: 'set global',
    usage: 'agent-farm set global PROFILE [--harness claude|codex]',
    group: 'configure',
    description: "Install a profile's skills into the native user skill directory so they are available in every repository. Only skills are mounted — not the model, identity, or sub-agents.",
    flags: [
      {name: 'harness', description: 'Target harness (default: profile harness)', type: 'string'},
      {name: 'workspace', description: 'Mount a workspace globally instead of a profile', type: 'string'},
      {name: 'config-root', description: 'Configuration directory', type: 'string', default: '~/.config/agent-farm'},
    ],
    examples: [
      'agent-farm set global planner --harness claude',
      'agent-farm set global --workspace my-project --harness codex',
    ],
  },
  {
    name: 'unset global',
    usage: 'agent-farm unset global PROFILE [--harness claude|codex]',
    group: 'configure',
    description: "Remove a profile's managed skills from the native user directory.",
    flags: [
      {name: 'harness', description: 'Target harness', type: 'string'},
      {name: 'workspace', description: 'Unmount a workspace instead of a profile', type: 'string'},
      {name: 'save', description: 'Save pre-existing unmanaged skills as a new profile before removing', type: 'string'},
      {name: 'model', description: 'Model ID for the saved profile (required with --save)', type: 'string'},
      {name: 'config-root', description: 'Configuration directory', type: 'string', default: '~/.config/agent-farm'},
    ],
    examples: [
      'agent-farm unset global planner --harness claude',
      'agent-farm unset global --save my-old-skills --harness codex --model gpt-6-astra',
    ],
  },
  {
    name: 'mcp login',
    usage: 'agent-farm mcp login CONNECTION --workspace NAME --harness claude|codex',
    group: 'configure',
    description: "Sign in to a remote MCP connection using the native harness's OAuth flow. Run once per connection per harness. After login, launch with --workspace to use the connection.",
    examples: [
      '# Authenticate each MCP connection once per harness:',
      'agent-farm mcp login linear --workspace bloomtext --harness codex',
      'agent-farm mcp login sentry --workspace bloomtext --harness codex',
      'agent-farm mcp login posthog --workspace bloomtext --harness claude',
      '',
      '# Then launch with the workspace:',
      'agent-farm run astra-planner --workspace bloomtext',
    ],
  },
  {
    name: 'plugin install',
    usage: 'agent-farm plugin install [SOURCE]',
    group: 'plugins',
    description: 'Install or update the bundled plugin (or a custom source) into ~/.config/agent-farm/. Local modifications produce conflicts rather than being overwritten.',
    examples: [
      'agent-farm plugin install',
      'agent-farm plugin install /path/to/config',
    ],
  },
  {
    name: 'plugin validate',
    usage: 'agent-farm plugin validate SOURCE',
    group: 'plugins',
    description: 'Validate a configuration directory: check all profiles resolve, skills exist, and agent definitions parse.',
    examples: [
      'agent-farm plugin validate /path/to/config',
    ],
  },
  {
    name: 'doctor',
    usage: 'agent-farm doctor',
    group: 'inspect',
    description: 'Check your setup: prerequisites, config directory, profiles, workspaces, and global skills.',
    examples: [
      'agent-farm doctor',
    ],
  },
  {
    name: 'help',
    usage: 'agent-farm help [COMMAND]',
    group: 'start',
    description: 'Show command reference. With a command name, show details for that command.',
    examples: [
      'agent-farm help',
      'agent-farm help run',
    ],
  },
];

export function findCommand(name: string): Command | undefined {
  return commands.find(c => c.name === name);
}

export const groupLabels: Record<string, string> = {
  start: 'Getting started',
  launch: 'Launch',
  inspect: 'Inspect',
  configure: 'Configure',
  plugins: 'Plugins',
};

export const groupOrder = ['start', 'launch', 'inspect', 'configure', 'plugins'];
