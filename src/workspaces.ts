import fs from 'node:fs';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {configurationName} from './config.js';
import {connections} from './connections.js';
import type {Connection} from './runtime.js';

export interface Repository { root:string; common:string }
export interface WorkspaceData {name?:string; instructions:string; connections:Record<string,Connection>}
export function repository(directory:string):Repository|undefined {
  let root=fs.realpathSync(directory);
  if(!fs.statSync(root).isDirectory())throw new Error(`Launch directory is not a directory: ${directory}`);
  for(;;){
    const marker=path.join(root,'.git');
    let stat:fs.Stats|undefined;
    try{stat=fs.lstatSync(marker);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    if(stat){
      let git=marker;
      if(stat.isFile()){
        const match=/^gitdir: (.+)\r?\n?$/.exec(fs.readFileSync(marker,'utf8'));
        if(!match)throw new Error(`Invalid Git directory file: ${marker}`);
        git=path.resolve(root,match[1]!);
      }else if(!stat.isDirectory())throw new Error(`Unsupported Git directory entry: ${marker}`);
      git=fs.realpathSync(git);
      if(!fs.statSync(git).isDirectory())throw new Error(`Invalid Git directory: ${git}`);
      const commonFile=path.join(git,'commondir');
      const common=fs.realpathSync(fs.existsSync(commonFile)?path.resolve(git,fs.readFileSync(commonFile,'utf8').trim()):git);
      return {root,common};
    }
    const parent=path.dirname(root);if(parent===root)return;root=parent;
  }
}
export function repositoryFile(repo:Repository):{file:string;content:string}|undefined {
  const file=path.join(repo.root,'.agent-farm/workspace.yaml');
  let stat:fs.Stats;
  try{stat=fs.lstatSync(file);}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return;throw e;}
  if(stat.isSymbolicLink())throw new Error(`Refusing symlinked workspace file: ${file}`);
  const relative=path.relative(repo.root,fs.realpathSync(file));
  if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw new Error(`Workspace resolves outside repository: ${file}`);
  if(!stat.isFile())throw new Error(`Workspace must be a regular file: ${file}`);
  return {file,content:fs.readFileSync(file,'utf8')};
}
export function mapping(value:unknown):Record<string,unknown>{
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Expected a YAML mapping');
  return value as Record<string,unknown>;
}
export function workspaceDocument(content:string,file:string,kind:'repository'|'user'|'overlay') {
  try{
    const doc=parseDocument(content,{uniqueKeys:true});
    if(doc.errors.length)throw new Error(doc.errors.map(e=>e.message).join('; '));
    const data=mapping(doc.toJS({maxAliasCount:100}));
    const allowed=kind==='overlay'?['connections','instructions']:['name','connections','instructions'];
    for(const key of Object.keys(data))if(!allowed.includes(key))throw new Error(`Unsupported workspace field: ${key}`);
    if(kind==='repository'||data.name!==undefined)configurationName(data.name,'workspace name');
    if(data.instructions!==undefined&&typeof data.instructions!=='string')throw new Error('Workspace instructions must be text');
    if(data.connections!==undefined)mapping(data.connections);
    return data;
  }catch(e){throw new Error(`${file}: ${(e as Error).message}`);}
}
export function validateWorkspace(data:Record<string,unknown>,file:string):WorkspaceData {
  const result:Record<string,Connection>=Object.create(null);
  for(const [key,value] of Object.entries(mapping(data.connections??{}))){
    try{Object.assign(result,connections({[key]:value}));}catch(e){throw new Error(`${file}: connection ${key}: ${(e as Error).message}`);}
  }
  return {name:data.name as string|undefined,instructions:data.instructions as string??'',connections:result};
}
