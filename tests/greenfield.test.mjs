import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
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

test('orchestrator accepts host guidance and planners accept coordinated handoffs',t=>{
 const target=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'greenfield-host-')));
 t.after(()=>fs.rmSync(target,{recursive:true,force:true}));
 const policy=path.join(target,'host.md'),source=path.join(target,'brief.html'),parent=path.join(target,'status.json');
 fs.writeFileSync(policy,'Use the host workspace and event tools.');
 fs.writeFileSync(source,'<h1>Task brief</h1>');
 for(const [profile,args] of [['orchestrator',[`host_policy=${policy}`]],['planner',[`source=${source}`,`parent=${parent}`]],['planner:codex',[`source=${source}`,`parent=${parent}`]]]){
  const bundle=build(root,profile,target);verify(bundle);
  const launch=command(bundle,'main',{prepare:false,args});
  assert.ok(launch.argv.length>0);
  for(const arg of args){const split=arg.indexOf("=");assert.equal(launch.launch.arguments[arg.slice(0,split)],arg.slice(split+1));}
  assert.throws(()=>command(bundle,'main',{prepare:false,args:['undeclared=bad']}),/undeclared|Unknown|unknown/);
 }
});


test('planners retain small-fix skills and the removed one-shot route cannot resolve',()=>{
 for(const profile of ['planner','planner:codex']){
  const main=resolveProfile(root,profile).nodes.main;
  for(const skill of ['tdd','codebase-design','verify-app','open-pr','session-trace'])assert.ok(main.skills.includes(skill),`${profile}: ${skill}`);
 }
 assert.equal(fs.existsSync(path.join(root,'profiles/one-shot.yaml')),false);
 assert.equal(fs.existsSync(path.join(root,'agents/one-shot.md')),false);
 assert.throws(()=>resolveProfile(root,'one-shot'));
});


test('Greenfield CLI arguments reach both harnesses and reject invalid profile inputs',t=>{
 const target=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'greenfield-cli-args-')));
 t.after(()=>fs.rmSync(target,{recursive:true,force:true}));
 const home=path.join(target,'home');fs.mkdirSync(home);
 const cli=fileURLToPath(new URL('../dist/cli.js',import.meta.url));
 const source='https://example.test/plan?revision=3&mode=review';
 const parent=path.join(target,'status files','task.json'),policy=path.join(target,'host guidance.md');
 const invoke=(profile,args)=>spawnSync(process.execPath,[cli,'run',profile,'--config-root',root,'--directory',target,'--no-workspace','--explain',...args.flatMap(a=>['--arg',a])],{encoding:'utf8',env:{...process.env,HOME:home,AGENT_FARM_TELEMETRY:'off'}});
 for(const [profile,args] of [['planner',[`source=${source}`,`parent=${parent}`]],['planner:codex',[`source=${source}`,`parent=${parent}`]],['orchestrator',[`host_policy=${policy}`]],['implementer',[`source=${source}`,`parent=${parent}`]],['implementer:fast',[`source=${source}`]]]){
  const result=invoke(profile,args);assert.equal(result.status,0,result.stderr);
  const launch=JSON.parse(result.stdout);
  const codex=launch.argv.find(v=>v.startsWith('developer_instructions='));
  const instructions=codex ? JSON.parse(codex.slice('developer_instructions='.length)) : launch.argv[launch.argv.indexOf('--append-system-prompt')+1];
  for(const pair of args){const i=pair.indexOf('='),key=pair.slice(0,i),value=pair.slice(i+1);assert.equal(launch.launch.arguments[key],value);assert.ok(instructions.includes(`${key}: ${value}`));}
  if(profile.startsWith('implementer')){
   assert.equal(launch.launch.arguments.review,'single');
   assert.equal(launch.launch.arguments.priority,profile==='implementer:fast'?'speed':'usage');
  }
 }
 for(const [profile,args,pattern] of [['planner',['review=single'],/does not declare argument review/],['orchestrator',['host_policy'],/malformed/],['implementer',['review=triple'],/invalid/]]){
  const result=invoke(profile,args);assert.equal(result.status,1);assert.match(result.stderr,pattern);
 }
});
