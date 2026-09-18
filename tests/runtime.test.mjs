import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {build} from '../dist/compiler.js';
import {command,fileMap,verify} from '../dist/runtime.js';

const cli=fileURLToPath(new URL('../dist/cli.js',import.meta.url));
const stdout='{"type":"rate_limit_event","status":429}\n{"type":"turn.failed"}\n';
const stderr='HTTP 529\napi_retry: literal $(echo untouched)\n';
function fixture(t,harness='codex') {
 const base=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'agent-farm-launch-')));
 t.after(()=>fs.rmSync(base,{recursive:true,force:true}));
 const root=path.join(base,'config'),target=path.join(base,'repo with spaces'),home=path.join(base,'home'),bin=path.join(base,'bin'),record=path.join(base,'record.json');
 for(const directory of [target,bin,path.join(root,'agents'),path.join(home,'.codex'),path.join(root,'skills/proof')])fs.mkdirSync(directory,{recursive:true});
 fs.writeFileSync(path.join(root,'agents/planner.yaml'),`harness: ${harness}\nmodel: test\nskills: [proof]\n`);
 fs.writeFileSync(path.join(root,'agents/implementer.yaml'),'harness: codex\nmodel: test\nskills: [proof]\n');
 fs.writeFileSync(path.join(root,'skills/proof/SKILL.md'),'Proof skill');
 fs.writeFileSync(path.join(home,'.codex/auth.json'),'AUTH-SECRET-FIXTURE');
 fs.writeFileSync(path.join(home,'.codex/config.toml'),'');
 const script=`#!${process.execPath}\nconst fs=require('node:fs');fs.writeFileSync(process.env.RECORD,JSON.stringify({args:process.argv.slice(2),cwd:process.cwd(),home:process.env.CODEX_HOME,key:process.env.LINEAR_API_KEY}));process.stdout.write(${JSON.stringify(stdout)});process.stderr.write(${JSON.stringify(stderr)});process.exit(7);\n`;
 for(const name of ['codex','claude'])fs.writeFileSync(path.join(bin,name),script,{mode:0o755});
 const env={...process.env,HOME:home,CODEX_HOME:path.join(home,'.codex'),AGENT_FARM_NATIVE_CODEX_HOME:path.join(home,'.codex'),PATH:bin+path.delimiter+process.env.PATH,RECORD:record,LINEAR_API_KEY:'LINEAR-SECRET-FIXTURE',CLIPROXY_API_KEY:'PROXY-SECRET-FIXTURE',GH_TOKEN:'GITHUB-SECRET-FIXTURE'};
 const invoke=(args,profile='planner')=>spawnSync(process.execPath,[cli,'run',profile,'--config-root',root,'--directory',target,...args],{env,encoding:'utf8'});
 return {base,root,target,home,bin,record,env,invoke};
}

test('print-launch prepares Codex bundle and home exactly as exec, without launching or printing inherited secrets',t=>{
 const f=fixture(t),result=f.invoke(['--print-launch']);
 assert.equal(result.status,0,result.stderr);assert.equal(result.stderr,'');
 const launch=JSON.parse(result.stdout);
 assert.deepEqual(Object.keys(launch).sort(),['argv','bundle','cwd','env']);
 assert.equal(launch.cwd,f.target);assert.ok(fs.statSync(launch.bundle).isDirectory());
 assert.ok(fs.statSync(launch.env.CODEX_HOME).isDirectory());
 assert.equal(launch.env.AGENT_FARM_NATIVE_CODEX_HOME,path.join(f.home,'.codex'));
 assert.equal(fs.realpathSync(path.join(launch.env.CODEX_HOME,'auth.json')),path.join(f.home,'.codex/auth.json'));
 assert.equal(fs.readFileSync(path.join(launch.env.CODEX_HOME,'skills/proof/SKILL.md'),'utf8'),'Proof skill');
 const expected=command(launch.bundle,'main',{headless:true,home:f.home,env:f.env});
 assert.deepEqual(launch.argv,expected.argv);assert.deepEqual(launch.env,expected.envOverrides);
 assert.equal(fs.existsSync(f.record),false);verify(launch.bundle);
 for(const secret of ['AUTH-SECRET-FIXTURE','LINEAR-SECRET-FIXTURE','PROXY-SECRET-FIXTURE','GITHUB-SECRET-FIXTURE']) {
  assert.equal(result.stdout.includes(secret),false);
  for(const relative of Object.keys(fileMap(launch.bundle)))assert.equal(fs.readFileSync(path.join(launch.bundle,relative),'utf8').includes(secret),false);
 }
});

test('explain keeps runtime home unprepared',t=>{
 const f=fixture(t),result=f.invoke(['--explain']);
 assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).env,undefined);
 assert.equal(fs.existsSync(path.join(f.home,'.cache/agent-farm/native-proof')),false);
 assert.equal(fs.existsSync(f.record),false);
});

test('Claude passthrough keeps strict MCP and caller streaming, resume, hooks and limits before the literal message',t=>{
 const f=fixture(t,'claude'),message='$(touch NEVER) `echo no`\n"quoted"';
 const native=['-p','--output-format','stream-json','--verbose','--resume','session id','--settings','hooks with spaces.json','--max-turns','3','--max-budget-usd','2'];
 const result=f.invoke(['--print-launch','--message',message,'--',...native]);
 assert.equal(result.status,0,result.stderr);const launch=JSON.parse(result.stdout);
 assert.deepEqual(launch.env,{});assert.ok(launch.argv.includes('--strict-mcp-config'));
 assert.deepEqual(launch.argv.slice(-native.length-2),[...native,'--',message]);
 assert.equal(launch.argv.filter(a=>a==='--output-format').length,1);assert.equal(launch.argv.includes('--print'),false);
 assert.equal(fs.existsSync(f.record),false);
 const execution=f.invoke(['--exec','--message',message,'--',...native]);
 assert.equal(execution.status,7,execution.stderr);assert.equal(execution.stdout,stdout);assert.ok(execution.stderr.endsWith(stderr));
 assert.deepEqual(JSON.parse(fs.readFileSync(f.record)).args,launch.argv.slice(1));
});

test('printed Codex resume argv spawns unchanged with caller-owned streams and environment',t=>{
 const f=fixture(t),message='Continue ENG-123\n$(literal)',native=['exec','resume','thread with spaces','--json'];
 const result=f.invoke(['--print-launch','--message',message,'--',...native],'implementer');
 assert.equal(result.status,0,result.stderr);const launch=JSON.parse(result.stdout);
 assert.deepEqual(launch.argv.slice(-native.length-2),[...native,'--',message]);
 assert.equal(launch.argv.filter(a=>a==='exec').length,1);
 assert.equal(fs.existsSync(f.record),false);
 const execution=spawnSync(launch.argv[0],launch.argv.slice(1),{cwd:launch.cwd,env:{...f.env,...launch.env},encoding:'utf8'});
 assert.equal(execution.status,7);assert.equal(execution.stdout,stdout);assert.equal(execution.stderr,stderr);
 const record=JSON.parse(fs.readFileSync(f.record));
 assert.deepEqual(record.args,launch.argv.slice(1));assert.equal(record.cwd,launch.cwd);
 assert.equal(record.home,launch.env.CODEX_HOME);assert.equal(record.key,f.env.LINEAR_API_KEY);
});

test('repeatable native arguments precede terminator arguments and native help bypasses Agent Farm help',t=>{
 const f=fixture(t),result=f.invoke(['--print-launch','--message=--help','--native-arg=exec','--native-arg=--json','--','resume','thread','--help']);
 assert.equal(result.status,0,result.stderr);
 assert.deepEqual(JSON.parse(result.stdout).argv.slice(-7),['exec','--json','resume','thread','--help','--','--help']);
 const repeated=f.invoke(['--print-launch','--native-arg=exec','--native-arg=--help']);
 assert.equal(repeated.status,0,repeated.stderr);assert.deepEqual(JSON.parse(repeated.stdout).argv.slice(-2),['exec','--help']);
});

test('standalone bundled dispatch supports prepared prints and both passthrough forms',t=>{
 const f=fixture(t,'claude');
 fs.appendFileSync(path.join(f.root,'agents/planner.yaml'),'subagents: {worker: {agent: implementer, mode: process}}\n');
 const bundle=build(f.root,'planner',f.target),dispatch=path.join(bundle,'main/dispatch/worker');
 const result=spawnSync(dispatch,['--print-launch','--message','Continue','--native-arg=exec','--','resume','thread','--json'],{env:f.env,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);const launch=JSON.parse(result.stdout);
 assert.deepEqual(launch.argv.slice(-6),['exec','resume','thread','--json','--','Continue']);
 assert.ok(fs.statSync(launch.env.CODEX_HOME).isDirectory());assert.equal(fs.existsSync(f.record),false);
});

test('conflicting modes and non-launch passthrough fail before generation',t=>{
 const f=fixture(t);
 for(const mode of ['--exec','--explain','--build']) {
  const result=f.invoke(['--print-launch',mode]);assert.equal(result.status,1);assert.match(result.stderr,/Choose only one/);
 }
 const result=spawnSync(process.execPath,[cli,'profiles','list','--config-root',f.root,'--print-launch'],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stderr,/require run or agent/);
 assert.equal(fs.existsSync(path.join(f.target,'.agent-farm')),false);
});
