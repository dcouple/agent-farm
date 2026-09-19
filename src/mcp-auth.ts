import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {resolveWorkspace} from './workspaces.js';
import {claudeConnection,codexConnection,connectionName,hash,toml} from './runtime.js';

/** Hand authentication to the native client, using launch-identical server identity. */
export function loginCommand(root: string, directory: string, connection: string, harness: 'claude'|'codex', options: {home?:string;env?:NodeJS.ProcessEnv;noWorkspace?:boolean}={}) {
  const value=resolveWorkspace(root,{directory,home:options.home,noWorkspace:options.noWorkspace}).connections[connection];
  if (!value) throw new Error(`Unknown workspace connection: ${connection}`);
  if (!('url' in value) || value.auth!=='native') throw new Error('Native OAuth login requires a remote MCP connection with auth: native; local servers use their own login');
  const env={...(options.env ?? process.env)},name=connectionName(connection);
  if (harness==='codex') {
    // A login launched from an Agent Farm session must target the original home.
    env.CODEX_HOME=env.AGENT_FARM_NATIVE_CODEX_HOME ?? env.ORCHESTRA_NATIVE_CODEX_HOME ?? env.CODEX_HOME ?? path.join(options.home ?? os.homedir(),'.codex');
    return {argv:['codex','-c',`mcp_servers.${name}=${toml(codexConnection(value))}`,'mcp','login',name],cwd:directory,env};
  }
  // Claude's login subcommand reads project configuration, not --mcp-config.
  // Use a private per-connection directory, without installing a global server.
  const loginDirectory=path.join(options.home ?? os.homedir(),'.cache/agent-farm/mcp-login',hash(JSON.stringify([root,directory,name,value.url])).slice(0,24));
  fs.mkdirSync(loginDirectory,{recursive:true,mode:0o700});
  fs.writeFileSync(path.join(loginDirectory,'.mcp.json'),JSON.stringify({mcpServers:{[name]:claudeConnection(value)}},null,2),{mode:0o600});
  return {argv:['claude','--settings','{"enableAllProjectMcpServers":true}','mcp','login',name],cwd:loginDirectory,env};
}
