import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {build,resolve} from '../dist/compiler.js';
import {command,codexHome,fileMap} from '../dist/runtime.js';
function setup(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent-farm-mcp-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const d of ['agents','workspaces','one','two'])fs.mkdirSync(path.join(root,d));
 const put=(file,text)=>fs.writeFileSync(path.join(root,file),text);
 put('agents/parent.yaml','harness: codex\nmodel: test\nsubagents:\n  child:\n    agent: child\n    mode: native\n');
 put('agents/child.yaml','harness: codex\nmodel: test\n');
 put('workspaces/test.yaml',`instructions: Use the workspace project.\nconnections:\n  service:\n    type: mcp\n    command: node\n    args: ["a path with spaces", "$(literal)"]\n    env:\n      CLOUDSDK_CORE_PROJECT: example-project\n    env_vars: [MCP_TEST_SECRET]\n  remote:\n    type: mcp\n    url: https://example.com/mcp\n    auth: native\n`);
 return {root,put,build:(dir='one')=>build(root,'parent',path.join(root,dir),'test')};
}
test('workspace stdio configuration reaches Codex parent and native children without resolving secrets',t=>{
 const f=setup(t),b=f.build();const r=command(b,'main',{prepare:false,env:{MCP_TEST_SECRET:'NEVER_PERSIST_ME'}});
 assert.ok(r.argv.some(a=>a.includes('"env_vars" = ["MCP_TEST_SECRET"]')));
 assert.ok(r.argv.some(a=>a.includes('CLOUDSDK_CORE_PROJECT')));
 const child=fs.readFileSync(path.join(b,'main/native-agents/child.toml'),'utf8');
 assert.match(child,/env_vars = \["MCP_TEST_SECRET"\]/);
 assert.match(child,/Use the workspace project/);
 // Have the installed native parser check generated TOML when available.
 const parsed=spawnSync('codex',['-c',r.argv.find(a=>a.startsWith('mcp_servers.orchestra_service=')),'mcp','get','orchestra_service','--json'],{encoding:'utf8'});
 if (!parsed.error) {assert.equal(parsed.status,0,parsed.stderr);assert.equal(JSON.parse(parsed.stdout).transport.command,'node');}
 for(const file of Object.keys(fileMap(b))) assert.ok(!fs.readFileSync(path.join(b,file),'utf8').includes('NEVER_PERSIST_ME'));
});
test('Claude gets stdio env references and identical remote identities in different directories',t=>{
 const f=setup(t);f.put('agents/parent.yaml','harness: claude\nmodel: test\n');
 const a=f.build(),b=f.build('two');
 const config=fs.readFileSync(path.join(a,'main/mcp.json'),'utf8');
 assert.equal(config,fs.readFileSync(path.join(b,'main/mcp.json'),'utf8'));
 const service=JSON.parse(config).mcpServers.orchestra_service;
 assert.equal(service.type,'stdio');assert.deepEqual(service.args,['a path with spaces','$(literal)']);
 assert.equal(service.env.MCP_TEST_SECRET,'${MCP_TEST_SECRET}');
 assert.equal(service.env.CLOUDSDK_CORE_PROJECT,'example-project');
});
test('malformed or mixed MCP transports fail before bundles are written',t=>{
 const f=setup(t);
 for(const connection of [
  'type: mcp\n    command: node\n    url: https://example.com/mcp\n    auth: native',
  'type: mcp\n    command: node\n    args: nope',
  'type: mcp\n    command: node\n    env: {PORT: 42}',
  'type: mcp\n    command: node\n    env_vars: [BAD-NAME]',
  'type: mcp\n    command: node\n    env_vars: [TOKEN, TOKEN]',
  'type: mcp\n    command: node\n    env: {TOKEN: value}\n    env_vars: [TOKEN]',
  'type: mcp\n    args: []',
 ]) {
  f.put('workspaces/test.yaml','connections:\n  service:\n    '+connection+'\n');
  assert.throws(()=>resolve(f.root,'parent','test'));
 }
 assert.equal(fs.existsSync(path.join(f.root,'one/.agent-farm')),false);
});
test('generated Codex homes share existing native credential files across destinations',t=>{
 const f=setup(t),home=path.join(f.root,'home'),native=path.join(home,'.codex');fs.mkdirSync(native,{recursive:true});
 fs.writeFileSync(path.join(native,'.credentials.json'),'{}');fs.writeFileSync(path.join(native,'auth.json'),'{}');
 const a=codexHome(f.build(),'main',{CODEX_HOME:native},home),b=codexHome(f.build('two'),'main',{CODEX_HOME:native},home);
 assert.notEqual(a,b);
 for(const name of ['auth.json','.credentials.json'])assert.equal(fs.realpathSync(path.join(a,name)),fs.realpathSync(path.join(b,name)));
});

test('native login uses launch-identical identities and restores the original Codex home',async t=>{
 const {loginCommand}=await import('../dist/mcp-auth.js');
 const f=setup(t),home=path.join(f.root,'home');
 const env={CODEX_HOME:'/generated-home',AGENT_FARM_NATIVE_CODEX_HOME:'/native-home'};
 const codex=loginCommand(f.root,'test','remote','codex',{home,env});
 assert.equal(codex.env.CODEX_HOME,'/native-home');
 assert.deepEqual(codex.argv.slice(-3),['mcp','login','orchestra_remote']);
 const claude=loginCommand(f.root,'test','remote','claude',{home,env});
 assert.deepEqual(claude.argv.slice(-3),['mcp','login','orchestra_remote']);
 const authConfig=JSON.parse(fs.readFileSync(path.join(claude.cwd,'.mcp.json')));
 f.build();
 f.put('agents/parent.yaml','harness: claude\nmodel: test\n');
 const launchConfig=JSON.parse(fs.readFileSync(path.join(f.build(),'main/mcp.json')));
 assert.deepEqual(authConfig.mcpServers.orchestra_remote,launchConfig.mcpServers.orchestra_remote);
 assert.deepEqual(Object.keys(authConfig.mcpServers),['orchestra_remote']);
 assert.throws(()=>loginCommand(f.root,'test','service','codex',{home,env}),/local servers use their own login/);
 assert.throws(()=>loginCommand(f.root,'test','missing','claude',{home,env}),/Unknown/);
});
