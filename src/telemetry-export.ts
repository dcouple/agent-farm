import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {TelemetryStore,type QueryOptions} from './telemetry-query.js';

type Options={bundle:string;sessionIds?:string[];includeContent?:boolean;requireFinished?:boolean};
function regular(file:string){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>1024*1024)throw Error('Expected a regular bundle manifest, at most 1 MiB');}
function directory(parent:string,name:string){const result=path.join(parent,name);try{fs.mkdirSync(result,{mode:0o700});}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;}const s=fs.lstatSync(result);if(!s.isDirectory()||s.isSymbolicLink())throw Error('Artifact directories must not be symlinks');return result;}
function write(file:string,data:string|Buffer){if(fs.existsSync(file)&&(!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink()))throw Error('Artifact files must not be symlinks');const temp=file+'.'+randomUUID()+'.tmp';try{fs.writeFileSync(temp,data,{flag:'wx',mode:0o600});fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}

/** Copy only explicitly associated sessions. Publishing remains the destination's job. */
export function exportTelemetry(storeOptions:QueryOptions,options:Options){
  const bundle=fs.realpathSync(options.bundle);if(!fs.statSync(bundle).isDirectory())throw Error('Bundle must be a directory');
  const manifestFile=path.join(bundle,'bundle.json');regular(manifestFile);
  const lock=path.join(bundle,'.agent-farm-export.lock'),fd=fs.openSync(lock,'wx',0o600);
  try{
    const original=fs.readFileSync(manifestFile,'utf8'),manifest=JSON.parse(original);
    if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))throw Error('Invalid bundle manifest');
    const previous=manifest.telemetry;
    if(previous!==undefined&&(!previous||previous.version!==1||!Array.isArray(previous.session_ids)||previous.session_ids.some((id:unknown)=>typeof id!=='string')))throw Error('Unsupported bundle telemetry metadata');
    const ids=[...new Set<string>([...(previous?.session_ids??[]),...(options.sessionIds??[])].map(id=>id==='current'?storeOptions.currentSession??'':id))];
    const snapshots=new TelemetryStore({...storeOptions,scope:'project'}).exportSnapshot(ids,options.includeContent,options.requireFinished);
    const target=directory(directory(bundle,'evidence'),'telemetry');
    // Validate every destination before replacing any telemetry files.
    for(const s of snapshots){const dir=directory(target,s.id);for(const name of Object.keys(s.files)){const f=path.join(dir,name);if(fs.existsSync(f)&&(!fs.lstatSync(f).isFile()||fs.lstatSync(f).isSymbolicLink()))throw Error('Artifact files must not be symlinks');}}
    if(fs.readFileSync(manifestFile,'utf8')!==original)throw Error('Bundle manifest changed during export; retry');
    const telemetry={version:1,session_ids:ids,exported_session_ids:snapshots.map(s=>s.id),directory:'evidence/telemetry',exported_at:new Date().toISOString(),complete:snapshots.every(s=>s.finished),publication:'pending'};
    // A failed refresh must never leave an earlier "complete" claim over mixed files.
    const pending=JSON.stringify({...manifest,telemetry:{...telemetry,complete:false}},null,2)+'\n';
    write(manifestFile,pending);
    for(const s of snapshots){const dir=path.join(target,s.id);for(const [name,data] of Object.entries(s.files))write(path.join(dir,name),data);}
    if(fs.readFileSync(manifestFile,'utf8')!==pending)throw Error('Bundle manifest changed during export; retry');
    write(manifestFile,JSON.stringify({...manifest,telemetry},null,2)+'\n');
    return {bundle,...telemetry};
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
