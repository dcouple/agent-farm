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
