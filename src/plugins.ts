import fs from 'node:fs';
import path from 'node:path';
import {parseDocument,stringify} from 'yaml';
import {execFileSync} from 'node:child_process';
import {files,hash} from './runtime.js';
import {listProfiles} from './inspect.js';
const sections=['profiles','agents','skills','instructions'];
interface Plugin { name:string; version:string; cli_major:number; source?:{repository:string;commit:string}; checksums?:Record<string,string> }
function manifest(root:string):Plugin {
 const doc=parseDocument(fs.readFileSync(path.join(root,'plugin.yaml'),'utf8'),{uniqueKeys:true});
 if(doc.errors.length)throw new Error(doc.errors.map(e=>e.message).join('; '));
 const value=doc.toJS();
 if(!value || value.name!=='dcouple' || !/^\d+\.\d+\.\d+$/.test(value.version) || value.cli_major!==0)throw new Error('Expected dcouple plugin, semantic version, and cli_major: 0');
 return value;
}
function inventory(root:string){
 const entries:Record<string,string>={};
 for(const section of sections){
  const folder=path.join(root,section);if(!fs.existsSync(folder))continue;
  for(const file of files(folder))entries[path.relative(root,file)]=hash(fs.readFileSync(file));
 }
 return entries;
}
export function validatePlugin(root:string){
 root=fs.realpathSync(root);const info=manifest(root),checksums=inventory(root);
 if(!Object.keys(checksums).length)throw new Error('Empty plugin');
 const profiles=listProfiles(root);if(!profiles.length)throw new Error('Plugin requires launch profiles');
 if(info.checksums && JSON.stringify(Object.entries(info.checksums).sort())!==JSON.stringify(Object.entries(checksums).sort()))throw new Error('Plugin integrity check failed');
 return {info,checksums,profiles};
}
export function packPlugin(source:string,destination:string){
 source=fs.realpathSync(source);destination=path.resolve(destination);
 const {info,checksums}=validatePlugin(source);
 if(fs.existsSync(destination))throw new Error('Output already exists; choose a fresh output directory');
 const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim();
 fs.mkdirSync(destination,{recursive:true});
 for(const relative of Object.keys(checksums)){
  const target=path.join(destination,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(source,relative),target);
 }
 fs.writeFileSync(path.join(destination,'plugin.yaml'),stringify({...info,source:{repository:'https://github.com/dcouple/skills',commit},checksums}));
 return validatePlugin(destination);
}
export function installPlugin(source:string,root:string){
 const {info,checksums}=validatePlugin(source);root=path.resolve(root);
 fs.mkdirSync(root,{recursive:true});
 const folder=path.join(root,'.plugins');fs.mkdirSync(folder,{recursive:true,mode:0o700});
 const lock=path.join(folder,'install.lock');try{fs.mkdirSync(lock);}catch{throw new Error('Another plugin install is active or left a stale lock');}
 try{
  const receipt=path.join(folder,'dcouple.json');
  const prior:Record<string,string>=fs.existsSync(receipt)?JSON.parse(fs.readFileSync(receipt,'utf8')).checksums:{};
  const changes=new Map<string,Buffer|undefined>();
  for(const relative of new Set([...Object.keys(prior),...Object.keys(checksums)])){
   if(!sections.includes(relative.split(path.sep)[0]!) || relative.split(/[\\/]/).includes('..') || path.isAbsolute(relative))throw new Error('Invalid plugin receipt path');
   const target=path.join(root,relative);
   // Do not follow symlinks in local configuration when installing generated files.
   let cursor=root;for(const part of relative.split(path.sep)){cursor=path.join(cursor,part);try{if(fs.lstatSync(cursor).isSymbolicLink())throw new Error(`Symlink destination: ${cursor}`);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}}
   const current=fs.existsSync(target)?fs.readFileSync(target):undefined;
   const digest=current ? hash(current):undefined;
   if(digest===checksums[relative])continue;
   if(current && digest!==prior[relative])throw new Error(`Local file differs; preserve or reconcile it before updating: ${target}`);
   if(!current && prior[relative])throw new Error(`Locally removed plugin file: ${target}`);
   changes.set(relative,current);
  }
  const priorReceipt=fs.existsSync(receipt)?fs.readFileSync(receipt):undefined;
  try{
   for(const relative of changes.keys()){
    const target=path.join(root,relative);fs.mkdirSync(path.dirname(target),{recursive:true});
    if(checksums[relative])fs.copyFileSync(path.join(source,relative),target);else fs.unlinkSync(target);
   }
   fs.writeFileSync(receipt+'.tmp',JSON.stringify({name:info.name,version:info.version,source:info.source,checksums},null,2),{mode:0o600});fs.renameSync(receipt+'.tmp',receipt);
  }catch(error){
   for(const [relative,old] of changes){const target=path.join(root,relative);if(old)fs.writeFileSync(target,old);else if(fs.existsSync(target))fs.unlinkSync(target);}
   if(priorReceipt)fs.writeFileSync(receipt,priorReceipt);
   throw error;
  }
  return {name:info.name,version:info.version,changed:changes.size};
 }finally{fs.rmdirSync(lock);}
}
