import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parse} from 'smol-toml';
import {workspaceConfiguration} from './compiler.js';
import {canonical,claudeConnection,codexConnection,connectionName,toml} from './runtime.js';

type Harness='claude'|'codex';
export interface WorkspaceOptions {home?:string;env?:NodeJS.ProcessEnv;harness?:string}
interface LoadedWorkspace {
  workspace:string;harness:Harness;root:string;config:string;instructions:string;
  servers:Record<string,unknown>;configBlock?:string;instructionBlock:string;
}
const configStart='# agent-farm workspace: begin';
const instructionStart='<!-- agent-farm workspace: begin -->';
function read(file:string):string|undefined {
  try {
    if(fs.lstatSync(file).isSymbolicLink())throw new Error(`Refusing to modify a symlink: ${file}`);
    return fs.readFileSync(file,'utf8');
  } catch(e) {if((e as NodeJS.ErrnoException).code==='ENOENT')return undefined;throw e;}
}
function write(file:string,text:string) {
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const temp=file+'.agent-farm-'+process.pid;
  try {fs.writeFileSync(temp,text,{mode:0o600,flag:'wx'});fs.renameSync(temp,file);}
  finally {if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
function object(value:unknown):Record<string,unknown> {
  if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('Expected native MCP configuration to be a mapping');
  return value as Record<string,unknown>;
}
function native(text:string|undefined,harness:Harness) {
  const data=object(harness==='claude' ? JSON.parse(text ?? '{}') : parse(text ?? ''));
  const field=harness==='claude'?'mcpServers':'mcp_servers';
  return {data,field,servers:object(data[field] ?? {})};
}
function withRegistry<T>(options:WorkspaceOptions,action:(file:string,entries:LoadedWorkspace[])=>T):T {
  const dir=path.join(options.home ?? os.homedir(),'.local/state/agent-farm/user-workspaces');
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  const lock=path.join(dir,'lock');
  try {fs.mkdirSync(lock);}catch(e){if((e as NodeJS.ErrnoException).code==='EEXIST')throw new Error(`Another workspace operation is active (or left a stale lock): ${lock}`);throw e;}
  try {
    const file=path.join(dir,'state.json'),raw=read(file),state=raw ? JSON.parse(raw) : {version:1,workspaces:[]};
    if(state.version!==1 || !Array.isArray(state.workspaces))throw new Error('Invalid workspace ownership registry');
    return action(file,state.workspaces);
  } finally {fs.rmdirSync(lock);}
}
function transaction(changes:{file:string;before:string|undefined;after:string}[]) {
  const written:typeof changes=[];
  try {
    for(const change of changes){
      if(read(change.file)!==change.before)throw new Error(`Configuration changed during workspace operation: ${change.file}`);
      write(change.file,change.after);written.push(change);
    }
  }catch(error){
    for(const change of written.reverse()){
      // Never roll back over a concurrent native-client/user edit.
      if(read(change.file)!==change.after)continue;
      if(change.before===undefined)fs.unlinkSync(change.file);else write(change.file,change.before);
    }
    throw error;
  }
}
function validateOwned(entry:LoadedWorkspace,configText:string|undefined,instructionsText:string|undefined) {
  const current=native(configText,entry.harness);
  for(const [key,value] of Object.entries(entry.servers))if(canonical(current.servers[key])!==canonical(value))throw new Error(`Managed connection changed or disappeared; preserving it: ${key}`);
  if(entry.configBlock && !(configText ?? '').includes(entry.configBlock))throw new Error('Managed Codex block changed; preserving native configuration');
  if(!(instructionsText ?? '').includes(entry.instructionBlock))throw new Error('Managed workspace instructions changed; preserving them');
}
export function loadedWorkspaces(options:WorkspaceOptions={}):LoadedWorkspace[] {
  return withRegistry(options,(_,entries)=>entries);
}
export function loadWorkspace(root:string,workspace:string,options:WorkspaceOptions={}):LoadedWorkspace {
  if(options.harness!=='claude' && options.harness!=='codex')throw new Error('Workspace load requires --harness claude|codex');
  const harness=options.harness,home=options.home ?? os.homedir(),env=options.env ?? process.env;
  root=fs.realpathSync(root);
  const ws=workspaceConfiguration(root,workspace);
  const nativeHome=harness==='codex' ? env.AGENT_FARM_NATIVE_CODEX_HOME ?? env.ORCHESTRA_NATIVE_CODEX_HOME ?? env.CODEX_HOME ?? path.join(home,'.codex') : env.CLAUDE_CONFIG_DIR ?? path.join(home,'.claude');
  const config=path.resolve(harness==='codex' ? path.join(nativeHome,'config.toml') : env.CLAUDE_CONFIG_DIR ? path.join(nativeHome,'.claude.json') : path.join(home,'.claude.json'));
  const instructions=path.resolve(nativeHome,harness==='claude'?'CLAUDE.md':fs.existsSync(path.join(nativeHome,'AGENTS.override.md'))?'AGENTS.override.md':'AGENTS.md');
  const servers=Object.fromEntries(Object.entries(ws.connections).map(([k,v])=>[connectionName(k),harness==='claude'?claudeConnection(v):codexConnection(v)]));
  const descriptions=Object.entries(ws.connections).filter(([,v])=>v.description).map(([k,v])=>`### ${k} (${connectionName(k)})\n${v.description}`);
  const instructionBlock='\n\n'+instructionStart+`\n## Workspace: ${workspace}\n\n`+[ws.instructions,...descriptions].filter(Boolean).join('\n\n')+'\n<!-- agent-farm workspace: end -->\n';
  const configBlock=harness==='codex' ? '\n\n'+configStart+'\n'+Object.entries(servers).map(([k,v])=>`[mcp_servers.${k}]\n`+Object.entries(v as Record<string,unknown>).map(([f,s])=>`${f} = ${toml(s)}`).join('\n')).join('\n\n')+'\n# agent-farm workspace: end\n' : undefined;
  const item:LoadedWorkspace={workspace,harness,root,config,instructions,servers,...(configBlock===undefined?{}:{configBlock}),instructionBlock};
  return withRegistry(options,(registry,entries)=>{
    const before=read(config),context=read(instructions),existing=entries.find(e=>e.harness===harness);
    if(existing){
      if(canonical(existing)!==canonical(item))throw new Error(`Unload the current ${harness} workspace (${existing.workspace}) before changing it`);
      validateOwned(existing,before,context);return existing;
    }
    const parsed=native(before,harness);
    for(const name of Object.keys(servers))if(Object.hasOwn(parsed.servers,name))throw new Error(`Existing MCP connection will not be overwritten or adopted: ${name}`);
    if((before ?? '').includes(configStart)||(context ?? '').includes(instructionStart))throw new Error('Existing workspace markers are unmanaged; refusing to overwrite');
    const after=harness==='codex' ? (before ?? '')+configBlock : JSON.stringify({...parsed.data,[parsed.field]:{...parsed.servers,...servers}},null,2)+'\n';
    native(after,harness); // Validate before changing any files (including inline TOML tables).
    transaction([
      {file:config,before,after},
      {file:instructions,before:context,after:(context ?? '')+instructionBlock},
      {file:registry,before:read(registry),after:JSON.stringify({version:1,workspaces:[...entries,item]},null,2)+'\n'},
    ]);
    return item;
  });
}
export function unloadWorkspace(workspace:string,options:WorkspaceOptions={}):LoadedWorkspace {
  if(options.harness!=='claude'&&options.harness!=='codex')throw new Error('Workspace unload requires --harness claude|codex');
  return withRegistry(options,(registry,entries)=>{
    const item=entries.find(e=>e.workspace===workspace&&e.harness===options.harness);
    if(!item)throw new Error('Workspace is not loaded for this harness');
    const before=read(item.config),context=read(item.instructions);
    validateOwned(item,before,context);
    const parsed=native(before,item.harness);
    for(const key of Object.keys(item.servers))delete parsed.servers[key];
    const after=item.harness==='codex' ? before!.replace(item.configBlock!,'') : JSON.stringify({...parsed.data,[parsed.field]:parsed.servers},null,2)+'\n';
    native(after,item.harness);
    transaction([
      {file:item.config,before,after},
      {file:item.instructions,before:context,after:context!.replace(item.instructionBlock,'')},
      {file:registry,before:read(registry),after:JSON.stringify({version:1,workspaces:entries.filter(e=>e!==item)},null,2)+'\n'},
    ]);
    return item;
  });
}
