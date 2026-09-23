import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build,resolveProfile} from '../dist/compiler.js';
import {command,verify} from '../dist/runtime.js';
import {validatePlugin} from '../dist/plugins.js';

const root=fileURLToPath(new URL('../plugins/greenfield/',import.meta.url));

test('Greenfield compiles a single Astra Low writer with verification and cross-harness review',t=>{
 const target=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'greenfield-profile-')));
 t.after(()=>fs.rmSync(target,{recursive:true,force:true}));
 validatePlugin(root);
 for(const profile of ['implementer','implementer:fast']){
  const resolved=resolveProfile(root,profile),main=resolved.nodes.main;
  assert.deepEqual(Object.keys(main.children).sort(),['frontend-verifier','reviewer','second-reviewer']);
  for(const route of Object.values(main.children))assert.deepEqual(Object.keys(resolved.nodes[route].children),[]);
  const bundle=build(root,profile,target);verify(bundle);
  const launch=command(bundle,'main',{prepare:false});
  assert.equal(launch.argv[launch.argv.indexOf('--model')+1],'gpt-6-astra');
  assert.ok(launch.argv.includes('model_reasoning_effort="low"'));
  assert.ok(launch.argv.includes(profile==='implementer:fast' ? 'service_tier="fast"' : 'service_tier="default"'));
  for(const speed of ['fast','standard']){
   const override=command(bundle,'main',{prepare:false,speed});
   assert.ok(override.argv.includes(speed==='fast' ? 'service_tier="fast"' : 'service_tier="default"'));
   assert.ok(override.argv.includes('model_reasoning_effort="low"'));
  }
  const review=command(bundle,main.children.reviewer,{prepare:false});
  assert.equal(review.argv[review.argv.indexOf('--model')+1],'claude-fable-5-1');
  assert.equal(review.argv[review.argv.indexOf('--effort')+1],'high');
  const frontend=resolved.nodes[main.children['frontend-verifier']];
  assert.equal(frontend.mode,'native');assert.equal(frontend.model,'gpt-5.6-sol');assert.equal(frontend.reasoning_effort,'low');
  assert.equal(fs.existsSync(path.join(bundle,'main/dispatch/worker')),false);
 }
});

test('both planner variants hand off to the same single-writer implementation graph',()=>{
 for(const profile of ['planner','planner:codex']){
  const resolved=resolveProfile(root,profile),entry=resolved.nodes[resolved.nodes.main.children.implementer];
  assert.equal(entry.mode,'process');assert.equal(entry.model,'gpt-6-astra');assert.equal(entry.reasoning_effort,'low');assert.equal(entry.speed,'standard');
  assert.deepEqual(Object.keys(entry.children).sort(),['frontend-verifier','reviewer','second-reviewer']);
 }
});
