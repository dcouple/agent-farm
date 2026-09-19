import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {repository,repositoryFile,workspaceDocument,validateWorkspace} from '../dist/workspaces.js';
function fixture(t){
 const base=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'af-workspace-')));
 t.after(()=>fs.rmSync(base,{recursive:true,force:true}));
 const repo=path.join(base,'repo');fs.mkdirSync(repo);execFileSync('git',['init','-q',repo]);
 const put=(p,s)=>{const f=path.join(base,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);return f;};
 return {base,repo,put};
}
test('nearest git checkout and linked worktree share canonical common directory',t=>{
 const f=fixture(t);f.put('repo/file','x');execFileSync('git',['-C',f.repo,'add','.']);execFileSync('git',['-C',f.repo,'-c','user.name=Test','-c','user.email=test@example.com','commit','-qm','initial']);
 const linked=path.join(f.base,'linked');execFileSync('git',['-C',f.repo,'worktree','add','-qb','linked',linked]);
 fs.mkdirSync(path.join(linked,'nested'));
 assert.deepEqual(repository(path.join(linked,'nested')),{root:linked,common:path.join(f.repo,'.git')});
 assert.equal(repository(f.base),undefined);
 const nested=path.join(f.repo,'nested');fs.mkdirSync(nested);execFileSync('git',['init','-q',nested]);assert.equal(repository(nested).root,nested);
});
test('repository schema requires a valid name and rejects unknown fields',()=>{
 for(const text of ['connections: {}','name: Bad','name: okay\nextra: true','name: okay\ninstructions: []'])assert.throws(()=>workspaceDocument(text,'workspace.yaml','repository'),/workspace.yaml/);
 const data=workspaceDocument('name: okay\ninstructions: Shared\nconnections: {}','workspace.yaml','repository');assert.equal(validateWorkspace(data,'workspace.yaml').name,'okay');
 assert.throws(()=>workspaceDocument('name: okay','overlay.yaml','overlay'),/overlay.yaml.*name/);
});
test('workspace symlinks and paths escaping the repository are refused',t=>{
 const f=fixture(t),outside=f.put('outside/workspace.yaml','name: outside');
 fs.mkdirSync(path.join(f.repo,'.agent-farm'));fs.symlinkSync(outside,path.join(f.repo,'.agent-farm/workspace.yaml'));
 assert.throws(()=>repositoryFile(repository(f.repo)),/symlink/);
 fs.unlinkSync(path.join(f.repo,'.agent-farm/workspace.yaml'));fs.rmdirSync(path.join(f.repo,'.agent-farm'));fs.symlinkSync(path.dirname(outside),path.join(f.repo,'.agent-farm'));
 assert.throws(()=>repositoryFile(repository(f.repo)),/outside repository/);
});

import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolveWorkspace,resolveInteractiveWorkspace,trustWorkspace,untrustWorkspace,showWorkspace,noWorkspace} from '../dist/workspaces.js';
import {build} from '../dist/compiler.js';
import {command} from '../dist/runtime.js';
import {loginCommand} from '../dist/mcp-auth.js';
import {loadWorkspace,unloadWorkspace} from '../dist/user-workspaces.js';
const cli=fileURLToPath(new URL('../dist/cli.js',import.meta.url));
const shared=`name: project
instructions: Shared project instructions.
connections:
  local:
    type: mcp
    command: node
    args: [serve, 'two words', '$(literal)']
    env:
      PROJECT: team
      ACCOUNT: SHARED_VALUE_HIDDEN
    env_vars: [TOKEN]
  remote:
    type: mcp
    url: https://example.com/mcp
    auth: native
`;
function project(t){
 const f=fixture(t),home=path.join(f.base,'home'),root=path.join(f.base,'config');fs.mkdirSync(home);fs.mkdirSync(root);
 const previous=process.env.HOME;process.env.HOME=home;t.after(()=>{if(previous===undefined)delete process.env.HOME;else process.env.HOME=previous;});
 f.put('config/agents/main.yaml','harness: claude\nmodel: test\nsubagents:\n  child:\n    agent: child\n    mode: process\n');
 f.put('config/agents/child.yaml','harness: claude\nmodel: test\n');
 const file=f.put('repo/.agent-farm/workspace.yaml',shared);
 const run=(args,directory=f.repo)=>spawnSync(process.execPath,[cli,...args,'--config-root',root,'--directory',directory],{encoding:'utf8',env:{...process.env,HOME:home},cwd:f.base});
 return {...f,root,home,file,run};
}
test('fallback applies outside repositories and when repository has no file; opt-out loads nothing',t=>{
 const f=project(t);f.put('config/workspace.yaml','instructions: Personal fallback\nconnections: {}');
 assert.equal(resolveWorkspace(f.root,{directory:f.base}).metadata.source,`user:${f.root}/workspace.yaml`);
 fs.unlinkSync(f.file);assert.equal(resolveWorkspace(f.root,{directory:f.repo}).instructions,'Personal fallback');
 f.put('repo/.agent-farm/workspace.yaml',shared);assert.deepEqual(resolveWorkspace(f.root,{directory:f.repo,noWorkspace:true}),noWorkspace());
 fs.unlinkSync(path.join(f.root,'workspace.yaml'));assert.equal(resolveWorkspace(f.root,{directory:f.base}).metadata.source,'none');
});
test('all noninteractive compilation and inspection modes reject untrusted files without generating output',t=>{
 const f=project(t);f.put('config/workspace.yaml','instructions: Fallback must not apply');
 for(const args of [['run','main','--exec'],['run','main','--print-launch'],['run','main','--explain'],['run','main','--build'],['run','main'],['inspect','main'],['mcp','login','remote','--harness','claude'],['workspace','load','--harness','claude']]){
  const r=f.run(args);assert.equal(r.status,1,JSON.stringify(args)+r.stderr);assert.ok(r.stderr.includes(f.file));assert.match(r.stderr,/agent-farm workspace trust/);assert.doesNotMatch(r.stdout,/Shared project instructions/);
 }
 assert.equal(fs.existsSync(path.join(f.repo,'.agent-farm/generated')),false);
 const ignored=f.run(['run','main','--explain','--no-workspace']);assert.equal(ignored.status,0,ignored.stderr);assert.equal(JSON.parse(ignored.stdout).workspace_source.source,'none');
 for(const args of [['run','main'],['inspect','main'],['mcp','login','remote','--harness','claude']])assert.notEqual(f.run([...args,'--workspace','project']).status,0);
});
test('interactive refusal continues with no workspace and approval shows commands but no environment values',async t=>{
 const f=project(t);let summary;
 const declined=await resolveInteractiveWorkspace(f.root,{directory:f.repo},async text=>{summary=text;return false;});
 assert.equal(declined.metadata.trust,'declined');assert.deepEqual(declined.connections,{});assert.equal(declined.instructions,'');
 for(const text of ['node','serve','two words','$(literal)','ACCOUNT','TOKEN','Shared project instructions.'])assert.ok(summary.includes(text),text);
 assert.ok(!summary.includes('SHARED_VALUE_HIDDEN'));
 const approved=await resolveInteractiveWorkspace(f.root,{directory:f.repo},async()=>true);assert.equal(approved.metadata.trust,'trusted');
 assert.equal(resolveWorkspace(f.root,{directory:f.repo}).connections.local.command,'node');
});
test('approval covers linked worktrees, reports changes, and revocation blocks all versions',async t=>{
 const f=project(t);await trustWorkspace(f.repo,{confirm:async()=>true});
 execFileSync('git',['-C',f.repo,'add','.']);execFileSync('git',['-C',f.repo,'-c','user.name=Test','-c','user.email=test@example.com','commit','-qm','workspace']);
 const linked=path.join(f.base,'linked');execFileSync('git',['-C',f.repo,'worktree','add','-qb','linked',linked]);
 assert.equal(resolveWorkspace(f.root,{directory:linked}).metadata.trust,'trusted');
 const a=f.run(['run','main','--explain']),b=f.run(['run','main','--explain'],linked);assert.equal(a.status,0,a.stderr);assert.equal(b.status,0,b.stderr);
 const identity=r=>JSON.parse(r.stdout).argv[JSON.parse(r.stdout).argv.indexOf('--append-system-prompt')+1].split('Bundled children')[0];assert.equal(identity(a),identity(b));
 f.put('repo/.agent-farm/workspace.yaml',shared.replace('SHARED_VALUE_HIDDEN','NEW_VALUE_HIDDEN'));
 assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),/Untrusted/);
 let summary;await trustWorkspace(f.repo,{confirm:async text=>{summary=text;return true;}});
 assert.match(summary,/connections.local.env.ACCOUNT/);assert.doesNotMatch(summary,/SHARED_VALUE_HIDDEN|NEW_VALUE_HIDDEN/);
 untrustWorkspace(linked);assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),/Untrusted/);assert.throws(()=>resolveWorkspace(f.root,{directory:linked}),/Untrusted/);
});
test('overlay merge preserves shared env, unions inherited names, appends instructions and reports field sources',async t=>{
 const f=project(t);await trustWorkspace(f.repo,{confirm:async()=>true});f.put('config/workspace.yaml','instructions: Wrong fallback');
 const overlay=f.put('config/overlays/project.yaml',`instructions: Personal instructions.
connections:
  local:
    env: {ACCOUNT: personal}
    env_vars: [OTHER, TOKEN]
  added:
    type: mcp
    command: added-server
`);
 const ws=resolveWorkspace(f.root,{directory:f.repo});assert.deepEqual(ws.connections.local.env,{PROJECT:'team',ACCOUNT:'personal'});assert.deepEqual(ws.connections.local.env_vars,['TOKEN','OTHER']);assert.equal(ws.connections.added.command,'added-server');
 assert.equal(ws.instructions,'Shared project instructions.\n\nPersonal instructions.');assert.equal(ws.metadata.overlay,overlay);
 assert.equal(ws.provenance['connections.local.env.PROJECT'],`repository:${f.file}`);assert.equal(ws.provenance['connections.local.env.ACCOUNT'],`overlay:${overlay}`);
 const show=f.run(['workspace','show']);assert.equal(show.status,0,show.stderr);assert.deepEqual(JSON.parse(show.stdout).connections.local.env,ws.connections.local.env);
 const inspect=f.run(['inspect','main']);assert.equal(inspect.status,0,inspect.stderr);assert.equal(JSON.parse(inspect.stdout).workspace_source.overlay,overlay);
 for(const flag of ['--explain','--print-launch']){const r=f.run(['run','main',flag]);assert.equal(r.status,0,r.stderr);const result=JSON.parse(r.stdout);assert.equal(result.workspace_source.overlay,overlay);const manifest=JSON.parse(fs.readFileSync(path.join(result.bundle,'manifest.json')));assert.deepEqual(manifest.workspace_source,result.workspace_source);assert.equal(manifest.workspace,undefined);}
 f.put('config/overlays/project.yaml','connections:\n  local:\n    env: {TOKEN: overlap}');assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),e=>e.message.includes(overlay)&&/local.*overlap/.test(e.message));
 f.put('config/overlays/project.yaml','connections:\n  local:\n    env: wrong');assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),/project.yaml.*local.*env/);
 f.put('config/overlays/project.yaml','connections:\n  local:\n    args: wrong');assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),/project.yaml.*local.*args/);
});
test('merged workspace still conflicts with different agent connections',async t=>{
 const f=project(t);await trustWorkspace(f.repo,{confirm:async()=>true});
 f.put('config/agents/main.yaml','harness: claude\nmodel: test\nconnections:\n  local:\n    type: mcp\n    command: other');
 assert.throws(()=>build(f.root,'main',f.repo),/Conflicting connection local/);
});
test('process children use parent workspace and refuse changed or revoked approval',async t=>{
 const f=project(t);await trustWorkspace(f.repo,{confirm:async()=>true});
 const bundle=build(f.root,'main',f.repo),dispatch=path.join(bundle,'main/dispatch/child');
 const run=()=>spawnSync(process.execPath,[dispatch,'--explain'],{cwd:f.base,encoding:'utf8',env:{...process.env,HOME:f.home}});
 let r=run();assert.equal(r.status,0,r.stderr);const output=JSON.parse(r.stdout);assert.equal(output.workspace_source.source,`repository:${f.file}`);assert.equal(output.cwd,f.repo);assert.ok(output.argv.some(v=>v.includes('Shared project instructions.')));
 fs.appendFileSync(f.file,'\n# edit');r=run();assert.equal(r.status,1);assert.match(r.stderr,/workspace trust/);
 fs.writeFileSync(f.file,shared);untrustWorkspace(f.repo);r=run();assert.equal(r.status,1);assert.match(r.stderr,/workspace trust/);
});
test('login and native mounting use resolved repository or personal fallback and preserve ownership',async t=>{
 const f=project(t);await trustWorkspace(f.repo,{confirm:async()=>true});
 const repoLogin=loginCommand(f.root,f.repo,'remote','claude',{home:f.home});assert.equal(JSON.parse(fs.readFileSync(path.join(repoLogin.cwd,'.mcp.json'))).mcpServers.orchestra_remote.url,'https://example.com/mcp');
 f.put('config/workspace.yaml',shared);const fallback=loginCommand(f.root,f.base,'remote','codex',{home:f.home});assert.ok(fallback.argv.some(v=>v.includes('https://example.com/mcp')));
 const mounted=loadWorkspace(f.root,f.repo,{home:f.home,harness:'claude',env:{}});assert.equal(mounted.workspace,'project');assert.ok(mounted.servers.orchestra_local);
 fs.unlinkSync(f.file);unloadWorkspace(f.repo,{home:f.home,harness:'claude',env:{}});assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.home,'.claude.json'))).mcpServers,{});
});
test('approval refuses changes made while confirmation is pending',async t=>{
 const f=project(t);await assert.rejects(trustWorkspace(f.repo,{confirm:async()=>{fs.appendFileSync(f.file,'\n# changed');return true;}}),/changed during approval/);
 assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),/Untrusted/);
});
test('CLI trust --yes and untrust operate without prompting; generated ignore hint prints once',t=>{
 const f=project(t);const approve=f.run(['workspace','trust','--yes']);assert.equal(approve.status,0,approve.stderr);assert.doesNotMatch(approve.stderr,/SHARED_VALUE_HIDDEN/);
 let r=f.run(['run','main','--explain']);assert.equal(r.status,0,r.stderr);assert.match(r.stderr,/Hint:.*gitignore/);
 f.put('config/agents/main.yaml','harness: claude\nmodel: changed');r=f.run(['run','main','--explain']);assert.equal(r.status,0,r.stderr);assert.doesNotMatch(r.stderr,/Hint:/);
 assert.equal(f.run(['workspace','untrust']).status,0);assert.equal(f.run(['run','main','--build']).status,1);
});
test('directory selection uses the other repository, and personal fallback never receives an overlay',async t=>{
 const f=project(t),other=path.join(f.base,'other');fs.mkdirSync(other);execFileSync('git',['init','-q',other]);
 f.put('other/.agent-farm/workspace.yaml',shared.replace('name: project','name: another').replace('Shared project instructions.','Other repository instructions.'));
 await trustWorkspace(other,{confirm:async()=>true});
 const r=f.run(['run','main','--explain'],other);assert.equal(r.status,0,r.stderr);const output=JSON.parse(r.stdout);assert.equal(output.workspace_source.source,`repository:${other}/.agent-farm/workspace.yaml`);assert.ok(output.argv.some(v=>v.includes('Other repository instructions.')));
 f.put('config/workspace.yaml','name: project\ninstructions: Fallback');f.put('config/overlays/project.yaml','instructions: Overlay');
 const fallback=resolveWorkspace(f.root,{directory:f.base});assert.equal(fallback.instructions,'Fallback');assert.equal(fallback.metadata.overlay,undefined);
});
test('bare repositories use fallback and malformed Git markers fail explicitly',t=>{
 const f=project(t),bare=path.join(f.base,'bare');execFileSync('git',['init','--bare','-q',bare]);f.put('config/workspace.yaml','instructions: Fallback');
 assert.equal(resolveWorkspace(f.root,{directory:bare}).instructions,'Fallback');
 f.put('bad/.git','not a gitdir');assert.throws(()=>repository(path.join(f.base,'bad')),/Invalid Git directory file/);
});
test('show exposes default and merged field provenance without granting trust',t=>{
 const f=project(t);f.put('config/overlays/project.yaml','connections:\n  local:\n    env: {ACCOUNT: personal}\n  added:\n    type: mcp\n    command: extra');
 const preview=showWorkspace(f.root,{directory:f.repo});assert.equal(preview.metadata.trust,'untrusted');assert.deepEqual(preview.provenance['connections.local.env'],[`repository:${f.file}`,`overlay:${f.root}/overlays/project.yaml`]);assert.equal(preview.provenance['connections.added.args'],`overlay:${f.root}/overlays/project.yaml`);
 assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),/Untrusted/);
});

test('formatting-only changes require approval and explain why the content summary is unchanged',async t=>{
 const f=project(t);await trustWorkspace(f.repo,{confirm:async()=>true});fs.appendFileSync(f.file,'\n# comment');
 assert.throws(()=>resolveWorkspace(f.root,{directory:f.repo}),/Untrusted/);
 let summary;await trustWorkspace(f.repo,{confirm:async value=>{summary=value;return false;}});assert.match(summary,/formatting, comments/);
});
