import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export type Connection =
  | { type: 'mcp'; description?: string; url: string; auth: 'native' | 'none' }
  | { type: 'mcp'; description?: string; url: string; auth: 'bearer_env'; env_var: string }
  | { type: 'mcp'; description?: string; command: string; args: string[]; env: Record<string,string>; env_vars: string[] };
// Keep registration names stable across repositories and generated runtime homes.
export const connectionName = (name: string): string => 'orchestra_'+name;
export function claudeConnection(value: Connection) {
  // Claude expands header references from its child environment at launch.
  if ('url' in value) return {type:'http',url:value.url,
    ...(value.auth==='bearer_env' ? {headers:{Authorization:'Bearer ${'+value.env_var+'}'}} : {})};
  return {type:'stdio',command:value.command,args:value.args,
    env:{...Object.fromEntries(value.env_vars.map(key=>[key,'${'+key+'}'])),...value.env}};
}
export function codexConnection(value: Connection): Record<string,unknown> {
  return 'url' in value ? {url:value.url,
    ...(value.auth==='bearer_env' ? {bearer_token_env_var:value.env_var} : {})}
    : {command:value.command,args:value.args,env:value.env,env_vars:value.env_vars};
}
// TOML values, including quoted environment-map keys; never expand secrets here.
export function toml(value: unknown): string {
  if (Array.isArray(value)) return '['+value.map(toml).join(', ')+']';
  if (value && typeof value==='object') return '{ '+Object.entries(value).map(([k,v])=>JSON.stringify(k)+' = '+toml(v)).join(', ')+' }';
  return JSON.stringify(value);
}
export interface Agent {
  source_file?: string; name: string; description?: string; mode?: 'native' | 'process'; harness: 'claude' | 'codex'; model: string;
  speed?: 'fast' | 'standard'; reasoning_effort?: string; instructions?: string; skills: string[];
  connections: Record<string, Connection>; children: Record<string, string>;
  argument_definitions?: Record<string, ArgumentDefinition>; launch?: LaunchMetadata;
}
export interface Manifest { profile: string; directory: string; workspace?: string; nodes: Record<string, Agent> }
export interface ArgumentDefinition { values?: string[]; type?: 'string' | 'path'; default?: string; description?: string }
export type ModelSource = 'agent' | 'preset' | 'flag';
export interface LaunchMetadata {
  model: {name: string; reasoning?: string; speed?: 'fast' | 'standard'; sources: {name: ModelSource; reasoning: ModelSource | null; speed: ModelSource | null}};
  arguments: Record<string,string>; preset?: string; override?: 'ad hoc' | 'preset'; headless: boolean;
}
export interface ModelInput { name?: unknown; reasoning?: unknown; speed?: unknown }
export const reasoningValues = (harness: Agent['harness']): string[] => harness==='claude' ? ['low','medium','high','xhigh','max'] : ['minimal','low','medium','high','xhigh','max'];
export function validateModel(harness: Agent['harness'], input: ModelInput, agent='agent', requireName=true): {name?: string;reasoning?: string;speed?: 'fast'|'standard'} {
  const result: {name?: string;reasoning?: string;speed?: 'fast'|'standard'}={};
  if (input.name!==undefined) {
    if (typeof input.name!=='string' || !input.name.trim()) throw new Error(`Agent ${agent} requires a nonempty model name`);
    result.name=input.name;
  } else if (requireName) throw new Error(`Agent ${agent} requires a model name`);
  if (input.reasoning!==undefined) {
    const accepted=reasoningValues(harness);
    if (typeof input.reasoning!=='string' || !accepted.includes(input.reasoning)) throw new Error(`Agent ${agent} reasoning value ${JSON.stringify(input.reasoning)} is invalid for ${harness}; accepted: ${accepted.join(', ')}`);
    result.reasoning=input.reasoning;
  }
  if (input.speed!==undefined) {
    if (harness!=='codex') throw new Error('model.speed supports fast or standard for Codex only');
    if (input.speed!=='fast' && input.speed!=='standard') throw new Error(`Agent ${agent} speed value ${JSON.stringify(input.speed)} is invalid for codex; accepted: fast, standard`);
    result.speed=input.speed;
  }
  return result;
}
export const hash = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex');
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).filter(([,v]) => v !== undefined).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => JSON.stringify(k)+':'+canonical(v)).join(',') + '}';
  return JSON.stringify(value);
}
export function files(root: string): string[] {
  const result: string[] = [];
  function visit(folder: string) {
    for (const entry of fs.readdirSync(folder, {withFileTypes: true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      const p = path.join(folder, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not supported in bundle inputs: ${p}`);
      if (entry.isDirectory()) visit(p);
      else if (entry.isFile()) result.push(p);
      else throw new Error(`Unsupported file type: ${p}`);
    }
  }
  if (fs.lstatSync(root).isSymbolicLink()) throw new Error(`Symlink directory: ${root}`);
  visit(root); return result;
}
export function fileMap(root: string): Record<string,string> {
  return Object.fromEntries(files(root).filter(p=>p!==path.join(root,'checksums.json')).map(p=>[path.relative(root,p),hash(fs.readFileSync(p))]));
}
export function verify(bundle: string): void {
  const expected = JSON.parse(fs.readFileSync(path.join(bundle,'checksums.json'),'utf8'));
  if (canonical(fileMap(bundle)) !== canonical(expected)) throw new Error('Bundle integrity check failed; refusing modified bundle');
}
function acceptedArguments(agent: Agent): string {
  const entries=Object.entries(agent.argument_definitions ?? {}).map(([key,item])=>item.values ? `${key} (${item.values.join('|')})` : `${key} (${item.type})`);
  return entries.length ? entries.join(', ') : 'none';
}
function resolveLaunch(agent: Agent, options: Pick<LaunchOptions,'headless'|'model'|'reasoning'|'speed'|'args'>): LaunchMetadata {
  const base=agent.launch ?? {model:{name:agent.model,reasoning:agent.reasoning_effort,speed:agent.speed,sources:{name:'agent',reasoning:agent.reasoning_effort?'agent':null,speed:agent.speed?'agent':null}},arguments:{},headless:false};
  const flags={name:options.model,reasoning:options.reasoning,speed:options.speed};
  const model=validateModel(agent.harness,{name:flags.name ?? base.model.name,reasoning:flags.reasoning ?? base.model.reasoning,speed:flags.speed ?? base.model.speed},agent.name);
  const sources={...base.model.sources};
  if (flags.name!==undefined) sources.name='flag';
  if (flags.reasoning!==undefined) sources.reasoning='flag';
  if (flags.speed!==undefined) sources.speed='flag';
  const arguments_: Record<string,string>={...base.arguments};
  for (const pair of options.args ?? []) {
    const separator=pair.indexOf('=');
    if (separator<1) throw new Error(`Agent ${agent.name} argument ${JSON.stringify(pair)} is malformed; use key=value. Accepted arguments: ${acceptedArguments(agent)}`);
    const key=pair.slice(0,separator),value=pair.slice(separator+1),definition=agent.argument_definitions?.[key];
    if (!definition) throw new Error(`Agent ${agent.name} does not declare argument ${key}; accepted arguments: ${acceptedArguments(agent)}`);
    if (definition.values && !definition.values.includes(value)) throw new Error(`Agent ${agent.name} argument ${key} value ${JSON.stringify(value)} is invalid; accepted: ${definition.values.join(', ')}. Accepted arguments: ${acceptedArguments(agent)}`);
    arguments_[key]=value;
  }
  const adHoc=flags.name!==undefined || flags.reasoning!==undefined || flags.speed!==undefined;
  const orderedArguments=Object.fromEntries(Object.keys(agent.argument_definitions ?? {}).flatMap(key=>Object.hasOwn(arguments_,key)?[[key,arguments_[key]!]]:[]));
  return {model:{name:model.name!,reasoning:model.reasoning,speed:model.speed,sources},arguments:orderedArguments,...(base.preset?{preset:base.preset}:{}),...(adHoc?{override:'ad hoc' as const}:base.override?{override:base.override}:{}),headless:!!options.headless};
}
function materializeLaunch(bundle: string, route: string, launch: LaunchMetadata): string {
  const manifest: Manifest=JSON.parse(fs.readFileSync(path.join(bundle,'manifest.json'),'utf8'));
  const current=manifest.nodes[route]; if (!current) throw new Error('Unknown bundled child');
  if (canonical(current.launch)===canonical(launch)) return bundle;
  const digest=hash(canonical({source:path.basename(bundle),route,launch})).slice(0,20);
  const destination=path.join(path.dirname(bundle),path.basename(bundle)+'-launch-'+digest);
  if (fs.existsSync(destination)) { verify(destination); return destination; }
  const staging=fs.mkdtempSync(path.join(path.dirname(bundle),'.launching-'));
  try {
    fs.cpSync(bundle,staging,{recursive:true});
    const selected=manifest.nodes[route]!;
    selected.model=launch.model.name; selected.reasoning_effort=launch.model.reasoning; selected.speed=launch.model.speed; selected.launch=launch;
    fs.writeFileSync(path.join(staging,'manifest.json'),JSON.stringify(manifest,null,2));
    fs.writeFileSync(path.join(staging,route,'agent.json'),JSON.stringify(selected,null,2));
    fs.writeFileSync(path.join(staging,'checksums.json'),JSON.stringify(fileMap(staging),null,2));
    try { fs.renameSync(staging,destination); } catch (error) {
      if (!fs.existsSync(destination)) throw error;
      verify(destination);
      if (canonical(fileMap(destination))!==canonical(fileMap(staging))) throw error;
    }
  } finally { fs.rmSync(staging,{recursive:true,force:true}); }
  return destination;
}
function link(source: string, destination: string): void {
  if (!fs.existsSync(source)) return;
  let current: fs.Stats | undefined;
  try { current = fs.lstatSync(destination); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  if (current) {
    if (!current.isSymbolicLink() || fs.realpathSync(destination) !== fs.realpathSync(source)) throw new Error(`Conflicting runtime path: ${destination}`);
  } else fs.symlinkSync(source,destination);
}
export interface Provider { name: string; base_url: string; api_key_env: string; match?: 'all' | 'slash-models' }
export function loadProvider(root: string): Provider | undefined {
  const file=path.join(root,'settings.json');
  let text: string;
  try { text=fs.readFileSync(file,'utf8'); } catch (e) {
    if ((e as NodeJS.ErrnoException).code==='ENOENT') return;
    throw e;
  }
  let settings: unknown;
  try { settings=JSON.parse(text); } catch { throw new Error('Host settings must be valid JSON'); }
  const mapping=(v: unknown): v is Record<string,unknown>=>!!v && typeof v==='object' && !Array.isArray(v);
  if (!mapping(settings) || Object.keys(settings).some(k=>k!=='provider')) throw new Error('Host settings support only provider');
  if (settings.provider===undefined) return;
  const value=settings.provider;
  if (!mapping(value) || Object.keys(value).some(k=>!['name','base_url','api_key_env','match'].includes(k))) throw new Error('Provider supports only name, base_url, api_key_env, and match');
  if (value.match!==undefined && value.match!=='all' && value.match!=='slash-models') throw new Error('Provider match must be "all" or "slash-models"');
  if (typeof value.name!=='string' || !/^[a-z][a-z0-9_-]{0,63}$/.test(value.name) || value.name==='openai') throw new Error('Provider name must be a lowercase configuration name other than openai');
  if (typeof value.api_key_env!=='string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(value.api_key_env)) throw new Error('Provider api_key_env must name an environment variable');
  if (['CODEX_HOME','AGENT_FARM_NATIVE_CODEX_HOME','AGENT_FARM_CONFIG_ROOT','ANTHROPIC_BASE_URL','ANTHROPIC_AUTH_TOKEN',...['HAIKU','SONNET','OPUS','FABLE'].map(alias=>`ANTHROPIC_DEFAULT_${alias}_MODEL`)].includes(value.api_key_env)) throw new Error('Provider api_key_env must not name a launch override');
  if (typeof value.base_url!=='string' || /[\s\\?#\0]/.test(value.base_url)) throw new Error('Provider base_url must be an HTTP(S) endpoint without credentials or query parameters');
  let url: URL;
  try { url=new URL(value.base_url); } catch { throw new Error('Provider base_url must be an HTTP(S) endpoint'); }
  if (!['http:','https:'].includes(url.protocol) || !url.hostname || url.username || url.password || url.search || url.hash) throw new Error('Provider base_url must be an HTTP(S) endpoint without credentials or query parameters');
  return {name:value.name,base_url:value.base_url,api_key_env:value.api_key_env,...(value.match===undefined ? {} : {match:value.match})};
}
const providerConfigMarker='# Agent Farm generated provider configuration\n';
function codexConfig(original: string, runtime: string, provider?: Provider): void {
  const destination=path.join(runtime,'config.toml');
  let current: fs.Stats | undefined;
  try { current=fs.lstatSync(destination); } catch (e) { if ((e as NodeJS.ErrnoException).code!=='ENOENT') throw e; }
  if (current && !current.isSymbolicLink() && (!current.isFile() || !fs.readFileSync(destination,'utf8').startsWith(providerConfigMarker))) throw new Error(`Conflicting runtime path: ${destination}`);
  if (!provider) {
    if (current && !current.isSymbolicLink()) fs.unlinkSync(destination);
    link(path.join(original,'config.toml'),destination);
    return;
  }
  if (current?.isSymbolicLink() && path.resolve(runtime,fs.readlinkSync(destination))!==path.join(original,'config.toml')) throw new Error(`Conflicting runtime path: ${destination}`);
  const content=providerConfigMarker+[
    `model_provider = ${toml(provider.name)}`,
    `[model_providers.${provider.name}]`,
    `name = ${toml(provider.name)}`,
    // Claude adds /v1/messages itself; Codex adds only /responses.
    `base_url = ${toml(provider.base_url.replace(/\/$/,'').replace(/\/v1$/,'')+'/v1')}`,
    'wire_api = "responses"',
    `env_key = ${toml(provider.api_key_env)}`
  ].join('\n')+'\n';
  // Atomic replacement also replaces a native-config symlink without following it.
  const temporary=destination+'.'+process.pid+'.tmp';
  fs.writeFileSync(temporary,content,{mode:0o600,flag:'wx'});
  try { fs.renameSync(temporary,destination); } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
export function codexHome(bundle: string, route: string, env: NodeJS.ProcessEnv, home = os.homedir(), provider?: Provider): string {
  const manifest: Manifest=JSON.parse(fs.readFileSync(path.join(bundle,'manifest.json'),'utf8'));
  const native=env.AGENT_FARM_NATIVE_CODEX_HOME ?? env.ORCHESTRA_NATIVE_CODEX_HOME ?? env.CODEX_HOME ?? path.join(home,'.codex');
  const original = provider && !fs.existsSync(native) ? path.resolve(native) : fs.realpathSync(native);
  // Resume identity must survive bundle rebuilds and changes to the selected agent.
  const identity={profile:manifest.profile,workspace:manifest.workspace ?? null,directory:manifest.directory,route};
  const runtime = path.join(home,'.cache/agent-farm/native-proof',hash(canonical(identity)).slice(0,24));
  fs.mkdirSync(runtime,{recursive:true,mode:0o700});
  codexConfig(original,runtime,provider);
  for (const item of ['auth.json','.credentials.json','AGENTS.md','AGENTS.override.md','rules','plugins','mcp-oauth-locks']) link(path.join(original,item),path.join(runtime,item));
  const skills = path.join(runtime,'skills'); fs.mkdirSync(skills,{recursive:true});
  const selected = path.join(bundle,route,'skills');
  const names = fs.existsSync(selected) ? fs.readdirSync(selected) : [];
  const desired = new Map<string,string>();
  if (fs.existsSync(path.join(original,'skills'))) for (const name of fs.readdirSync(path.join(original,'skills'))) {
    desired.set(name,path.join(original,'skills',name));
  }
  for (const name of names) desired.set(name,path.join(selected,name));
  // This private directory owns skill links, not session data. Refresh changed
  // targets (including dangling links) and remove skills no longer selected.
  for (const name of fs.readdirSync(skills)) {
    const destination=path.join(skills,name);
    if (!fs.lstatSync(destination).isSymbolicLink()) throw new Error(`Conflicting runtime path: ${destination}`);
    if (path.resolve(skills,fs.readlinkSync(destination))!==desired.get(name)) fs.unlinkSync(destination);
  }
  for (const [name,source] of desired) link(source,path.join(skills,name));
  env.CODEX_HOME=runtime; env.AGENT_FARM_NATIVE_CODEX_HOME=original; return runtime;
}
export interface LaunchOptions { headless?: boolean; nativeArgs?: string[]; message?: string; prepare?: boolean; env?: NodeJS.ProcessEnv; home?: string; configRoot?: string; model?: string; reasoning?: string; speed?: string; args?: string[] }
export function command(bundle: string, route: string, options: LaunchOptions = {}) {
  const manifest: Manifest=JSON.parse(fs.readFileSync(path.join(bundle,'manifest.json'),'utf8'));
  const agent=manifest.nodes[route]; if (!agent) throw new Error('Unknown bundled child');
  const launch=resolveLaunch(agent,options);
  const directory=path.join(bundle,route); const env={...(options.env ?? process.env)};
  const envOverrides: Record<string,string>={};
  const configRoot=path.resolve(options.configRoot ?? env.AGENT_FARM_CONFIG_ROOT ?? path.join(options.home ?? os.homedir(),'.config/agent-farm'));
  const providerConfig=loadProvider(configRoot);
  // Hosts can opt into slash-only routing (e.g. deepseek/deepseek-v4.1-flash).
  const provider=providerConfig && (providerConfig.match!=='slash-models' || launch.model.name.includes('/')) ? providerConfig : undefined;
  // Process children must read the same host settings even when this model skips routing.
  if (providerConfig) envOverrides.AGENT_FARM_CONFIG_ROOT=configRoot;
  const nativeArgs=options.nativeArgs ?? [];
  // Explicit native arguments own the mode and output format, including resume.
  const defaultHeadless=options.headless && nativeArgs.length===0;
  let instructions=agent.instructions ?? '';
  if (Object.keys(agent.children).length) {
    instructions+='\nBundled children (use native delegation for native roles; process launchers accept --message, --model, --reasoning, --speed, and --arg; do not regenerate config):\n';
    instructions+=Object.entries(agent.children).map(([alias,childRoute])=>manifest.nodes[childRoute]!.mode==='native' ? `${alias}: native subagent (${manifest.nodes[childRoute]!.description ?? alias}). Use native delegation and follow-up tools.` : `${alias}: ${path.join(directory,'dispatch',alias)}`).join('\n');
  }
  const context=['LAUNCH CONTEXT',`headless: ${launch.headless}`,...Object.entries(launch.arguments).map(([key,value])=>`${key}: ${value}`)].join('\n');
  instructions=[instructions,context].filter(Boolean).join('\n\n');
  let argv: string[];
  if (agent.harness==='claude') {
    if (provider) {
      envOverrides.ANTHROPIC_BASE_URL=provider.base_url;
      envOverrides.ANTHROPIC_AUTH_TOKEN='${'+provider.api_key_env+'}';
      for (const alias of ['HAIKU','SONNET','OPUS','FABLE']) envOverrides[`ANTHROPIC_DEFAULT_${alias}_MODEL`]=launch.model.name;
    }
    argv=['claude','--dangerously-skip-permissions','--model',launch.model.name,'--plugin-dir',directory,'--mcp-config',path.join(directory,'mcp.json'),'--strict-mcp-config'];
    const native=Object.fromEntries(Object.entries(agent.children).filter(([,r])=>manifest.nodes[r]!.mode==='native').map(([alias])=>[alias,JSON.parse(fs.readFileSync(path.join(directory,'native-agents',alias+'.json'),'utf8'))]));
    if (Object.keys(native).length) argv.push('--agents',JSON.stringify(native));
    if (launch.model.reasoning) argv.push('--effort',launch.model.reasoning);
    if (instructions) argv.push('--append-system-prompt',instructions);
    if (defaultHeadless) argv.push('--print','--output-format','json');
  } else {
    if (options.prepare!==false) {
      codexHome(bundle,route,env,options.home,provider);
      envOverrides.CODEX_HOME=env.CODEX_HOME!;
      envOverrides.AGENT_FARM_NATIVE_CODEX_HOME=env.AGENT_FARM_NATIVE_CODEX_HOME!;
    }
    argv=['codex',...(defaultHeadless ? ['exec','--skip-git-repo-check','--json'] : []),'--yolo','--cd',manifest.directory,'--model',launch.model.name];
    if (instructions) argv.push('-c','developer_instructions='+JSON.stringify(instructions));
    if (launch.model.reasoning) argv.push('-c','model_reasoning_effort='+JSON.stringify(launch.model.reasoning));
    for (const [alias,childRoute] of Object.entries(agent.children)) if (manifest.nodes[childRoute]!.mode==='native') {
      argv.push('-c',`agents.${alias}.description=${JSON.stringify(manifest.nodes[childRoute]!.description ?? alias)}`,'-c',`agents.${alias}.config_file=${JSON.stringify(path.join(directory,'native-agents',alias+'.toml'))}`);
    }
    if (launch.model.speed) argv.push('-c','service_tier='+JSON.stringify(launch.model.speed==='fast' ? 'fast' : 'default'));
    for (const [key,value] of Object.entries(agent.connections)) argv.push('-c',`mcp_servers.${connectionName(key)}=${toml(codexConnection(value))}`);
  }
  argv.push(...nativeArgs);
  if (options.message!==undefined) argv.push('--',options.message);
  Object.assign(env,envOverrides);
  if (provider && agent.harness==='claude') {
    // Claude treats AUTH_TOKEN literally. Resolve only inside the launched child,
    // then replace the prefix so the caller still owns signals and untouched stdio.
    const script=`import {execute} from ${JSON.stringify(pathToFileURL(path.join(bundle,'runtime.mjs')).href)}; const key=process.env[${JSON.stringify(provider.api_key_env)}]; if (!key) throw new Error("Provider environment variable is unavailable"); execute(process.argv.slice(1),process.cwd(),{...process.env,ANTHROPIC_AUTH_TOKEN:key});`;
    argv=[process.execPath,'--input-type=module','--eval',script,'--',...argv];
  }
  return {argv,env,envOverrides,cwd:manifest.directory,launch};
}
export function execute(argv: string[], cwd: string, environment: NodeJS.ProcessEnv): never {
  if (process.platform==='win32' || !process.execve) throw new Error('Native launch requires Node 22.15+ on macOS or Linux');
  const name=argv[0]!;
  const executable=(environment.PATH ?? '').split(path.delimiter).map(p=>path.resolve(p,name)).find(p=>{
    try { fs.accessSync(p,fs.constants.X_OK); return fs.statSync(p).isFile(); } catch { return false; }
  });
  if (!executable) throw new Error(`Missing native harness: ${name}`);
  const env=Object.fromEntries(Object.entries(environment).filter((pair): pair is [string,string]=>pair[1]!==undefined));
  process.chdir(cwd);
  // Replace this process: native terminal, signals, and exit status pass through.
  process.execve(executable,argv,env);
  throw new Error('Native exec unexpectedly returned');
}
export function run(bundle: string, route: string, args: string[], launchCommand: typeof command = command, configRoot?: string): void {
  const {values,tokens}=parseArgs({args,options:{exec:{type:'boolean'},message:{type:'string'},explain:{type:'boolean'},'print-launch':{type:'boolean'},'native-arg':{type:'string',multiple:true},model:{type:'string'},reasoning:{type:'string'},speed:{type:'string'},arg:{type:'string',multiple:true}},strict:true,allowPositionals:true,tokens:true});
  const separator=tokens.find(t=>t.kind==='option-terminator')?.index ?? args.length;
  if (tokens.some(t=>t.kind==='positional' && t.index<separator)) throw new Error('Native arguments must follow -- or use --native-arg');
  if (values.explain && values['print-launch']) throw new Error('Choose only one of --explain or --print-launch');
  verify(bundle);
  const requested={headless:values.exec || values['print-launch'],model:values.model,reasoning:values.reasoning,speed:values.speed,args:values.arg};
  const manifest: Manifest=JSON.parse(fs.readFileSync(path.join(bundle,'manifest.json'),'utf8'));
  const selected=manifest.nodes[route]; if (!selected) throw new Error('Unknown bundled child');
  bundle=materializeLaunch(bundle,route,resolveLaunch(selected,requested));
  const launch=launchCommand(bundle,route,{...requested,nativeArgs:[...(values['native-arg'] ?? []),...args.slice(separator+1)],message:values.message,prepare:!values.explain,configRoot});
  if (values.explain) console.log(JSON.stringify({argv:launch.argv,cwd:launch.cwd,bundle,launch:launch.launch},null,2));
  else if (values['print-launch']) console.log(JSON.stringify({argv:launch.argv,cwd:launch.cwd,bundle,env:launch.envOverrides,launch:launch.launch},null,2));
  else execute(launch.argv,launch.cwd,launch.env);
}
