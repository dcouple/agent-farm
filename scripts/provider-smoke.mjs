import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {fileMap,verify} from '../dist/runtime.js';

// Run after pnpm build, with native codex and claude on PATH. No real credentials are used.
const cli=fileURLToPath(new URL('../dist/cli.js',import.meta.url));
const versions=Object.fromEntries(['codex','claude'].map(bin=>{
 const result=spawnSync(bin,['--version'],{encoding:'utf8'});
 assert.equal(result.status,0,`Missing native ${bin}: ${result.stderr ?? result.error?.message}`);
 return [bin,result.stdout.trim()];
}));
const base=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'agent-farm-provider-smoke-')));
const root=path.join(base,'config'),home=path.join(base,'home'),repo=path.join(base,'repo');
for(const dir of [path.join(root,'agents'),home,repo])fs.mkdirSync(dir,{recursive:true});
const requests=[];
const server=http.createServer(async(req,res)=>{
 let raw='';for await(const chunk of req)raw+=chunk;
 const body=raw?JSON.parse(raw):{};
 requests.push({path:req.url,model:body.model,authorized:req.headers.authorization==='Bearer FAKE-LOCAL-PROVIDER-KEY'});
 const event=(type,data)=>res.write(`event: ${type}\ndata: ${JSON.stringify({...data,type})}\n\n`);
 if(req.url.includes('count_tokens')){res.setHeader('content-type','application/json');res.end('{"input_tokens":10}');return;}
 if(req.url.startsWith('/v1/messages')){
  res.setHeader('content-type','text/event-stream');
  const message={id:'msg_provider',type:'message',role:'assistant',model:body.model,content:[],stop_reason:null,stop_sequence:null,usage:{input_tokens:10,output_tokens:0}};
  if(!body.stream){res.setHeader('content-type','application/json');res.end(JSON.stringify({...message,content:[{type:'text',text:'PROVIDER_OK'}],stop_reason:'end_turn'}));return;}
  event('message_start',{message});event('content_block_start',{index:0,content_block:{type:'text',text:''}});
  event('content_block_delta',{index:0,delta:{type:'text_delta',text:'PROVIDER_OK'}});event('content_block_stop',{index:0});
  event('message_delta',{delta:{stop_reason:'end_turn',stop_sequence:null},usage:{output_tokens:3}});event('message_stop',{});res.end();return;
 }
 if(req.url==='/v1/responses'){
  res.setHeader('content-type','text/event-stream');
  const message={id:'msg_provider',type:'message',status:'completed',role:'assistant',content:[{type:'output_text',text:'PROVIDER_OK',annotations:[]}]};
  const response={id:'resp_provider',object:'response',created_at:Math.floor(Date.now()/1000),status:'in_progress',model:body.model,output:[]};
  event('response.created',{response});
  event('response.output_item.added',{output_index:0,item:{...message,status:'in_progress',content:[]}});
  event('response.content_part.added',{item_id:message.id,output_index:0,content_index:0,part:{type:'output_text',text:'',annotations:[]}});
  event('response.output_text.delta',{item_id:message.id,output_index:0,content_index:0,delta:'PROVIDER_OK'});
  event('response.output_text.done',{item_id:message.id,output_index:0,content_index:0,text:'PROVIDER_OK'});
  event('response.content_part.done',{item_id:message.id,output_index:0,content_index:0,part:message.content[0]});
  event('response.output_item.done',{output_index:0,item:message});
  event('response.completed',{response:{...response,status:'completed',output:[message],usage:{input_tokens:10,output_tokens:3,total_tokens:13}}});res.end();return;
 }
 res.setHeader('content-type','application/json');res.end('{"data":[]}');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const endpoint='http://127.0.0.1:'+server.address().port;
fs.writeFileSync(path.join(root,'settings.json'),JSON.stringify({provider:{name:'cliproxy',base_url:endpoint,api_key_env:'CLIPROXY_API_KEY'}}));
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'settings.json'),'utf8')).provider.base_url,endpoint);
const env={HOME:home,PATH:process.env.PATH,CODEX_HOME:path.join(home,'.codex'),AGENT_FARM_NATIVE_CODEX_HOME:path.join(home,'.codex'),CLAUDE_CONFIG_DIR:path.join(home,'.claude'),CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:'1',DISABLE_AUTOUPDATER:'1',LANG:'en_US.UTF-8'};
try {
 for(const [profile,harness,model] of [['implementer','codex','gpt-6-astra'],['planner','claude','claude-fable-5-1']]){
  fs.writeFileSync(path.join(root,'agents',profile+'.yaml'),`harness: ${harness}\nmodel: ${model}\nskills: []\n`);
  const prepared=spawnSync(process.execPath,[cli,'run',profile,'--config-root',root,'--directory',repo,'--print-launch','--message','Say PROVIDER_OK','--',...(harness==='codex'?['exec','--skip-git-repo-check','--json']:['-p','--output-format','json'])],{env,encoding:'utf8'});
  assert.equal(prepared.status,0,prepared.stderr);const launch=JSON.parse(prepared.stdout);
  assert.equal(fs.existsSync(path.join(home,'.codex/auth.json')),false);
  assert.equal(prepared.stdout.includes('FAKE-LOCAL-PROVIDER-KEY'),false);
  verify(launch.bundle);for(const file of Object.keys(fileMap(launch.bundle)))assert.equal(fs.readFileSync(path.join(launch.bundle,file),'utf8').includes('FAKE-LOCAL-PROVIDER-KEY'),false);
  if(harness==='codex')console.log('Codex generated config:\n'+fs.readFileSync(path.join(launch.env.CODEX_HOME,'config.toml'),'utf8'));
  else console.log('Claude printed env: '+JSON.stringify(launch.env));
  const result=await new Promise((resolve,reject)=>{
   const child=spawn(launch.argv[0],launch.argv.slice(1),{cwd:launch.cwd,env:{...env,...launch.env,CLIPROXY_API_KEY:'FAKE-LOCAL-PROVIDER-KEY'}});
   child.stdin.end();
   let stdout='',stderr='';child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
   const timer=setTimeout(()=>child.kill('SIGKILL'),30000);
   child.on('error',error=>{clearTimeout(timer);reject(error);});
   child.on('close',(status,signal)=>{clearTimeout(timer);resolve({status,signal,stdout,stderr});});
  });
  console.log(profile+' result: '+JSON.stringify(result));
  assert.equal(result.status,0);assert.ok(result.stdout.includes('PROVIDER_OK'));
  assert.ok(requests.some(r=>r.model===model&&r.authorized));
  console.log(profile+': verbatim argv completed a native turn through the local provider; key absent from print/bundle; native Codex login absent');
 }
 console.log('Requests: '+JSON.stringify(requests));
 console.log('PASS: native provider smoke ('+versions.codex+' and '+versions.claude+')');
} finally {server.close();fs.rmSync(base,{recursive:true,force:true});}
