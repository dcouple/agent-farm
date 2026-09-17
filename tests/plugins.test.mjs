import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {installPlugin,validatePlugin} from '../dist/plugins.js';
const plugin=fileURLToPath(new URL('../plugins/dcouple',import.meta.url));
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent-farm-plugin-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
test('bundled plugin installs, validates all profiles and preserves local workspace files',t=>{
 const root=fixture(t);fs.mkdirSync(path.join(root,'workspaces'));fs.writeFileSync(path.join(root,'workspaces/private.yaml'),'LOCAL');
 assert.equal(validatePlugin(plugin).profiles.length,13);assert.ok(installPlugin(plugin,root).changed>0);assert.equal(installPlugin(plugin,root).changed,0);
 assert.equal(fs.readFileSync(path.join(root,'workspaces/private.yaml'),'utf8'),'LOCAL');
 fs.appendFileSync(path.join(root,'agents/planner.md'),'\nLOCAL EDIT');assert.throws(()=>installPlugin(plugin,root),/Local file differs/);
 assert.match(fs.readFileSync(path.join(root,'agents/planner.md'),'utf8'),/LOCAL EDIT/);
});
test('plugin tampering and symlink destinations are rejected before installation',t=>{
 const root=fixture(t),copy=path.join(root,'plugin');fs.cpSync(plugin,copy,{recursive:true});fs.appendFileSync(path.join(copy,'agents/planner.md'),'tampered');
 assert.throws(()=>validatePlugin(copy),/integrity/);
 const target=path.join(root,'target');fs.mkdirSync(target);fs.symlinkSync(path.join(root,'missing'),path.join(target,'agents'));
 assert.throws(()=>installPlugin(plugin,target),/Symlink/);
});
