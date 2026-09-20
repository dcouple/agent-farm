import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeConversation} from '../dist/telemetry-conversation.js';
import {harnessTelemetry} from '../dist/telemetry.js';
import {validateTelemetry,resolveTelemetry,mergeTelemetry} from '../dist/runtime.js';
const event=(name,attributes={},time='1700000000000000000')=>({time_unix_nano:time,attributes:{'event.name':name,'session.id':'native',...attributes}});
const span=(id='request-1')=>({name:'claude_code.llm_request',span_id:'span-1',trace_id:'trace-1',duration_ms:12,start_time_unix_nano:'1700000000000000000',attributes:{'session.id':'native',request_id:id,input_tokens:12,output_tokens:4}});

test('conversation joins request bodies and outputs by exact IDs, deduplicating usage and response text',()=>{
 const request={system:'Instructions\n# Guidelines\nBe concise.',messages:[{role:'user',content:[{type:'text',text:'<system-reminder>Repository context</system-reminder>'},{type:'text',text:'Hello'}]}],tools:[{name:'read_file',description:'Read a file'}]};
 const response={content:[{type:'text',text:'Hello world!'}],usage:{input_tokens:12,output_tokens:4}};
 const result=normalizeConversation([span()],[event('api_request',{request_id:'request-1',input_tokens:12,output_tokens:4,cost_usd:.01}),event('assistant_response',{request_id:'request-1',response:'Hello world!'}),event('api_request_body',{request_body_id:'body-1',body:JSON.stringify(request)}),event('api_response_body',{request_id:'request-1',request_body_id:'body-1',body:JSON.stringify(response)})]);
 assert.equal(result.turns.length,1);assert.equal(result.summary.requests,1);assert.equal(result.summary.input_tokens,12);assert.equal(result.summary.cost_usd,.01);assert.equal(result.summary.cost_complete,true);
 const turn=result.turns[0];assert.equal(turn.instructions[0].text,request.system);assert.equal(turn.input[0].role,'context');assert.equal(turn.input[1].text,'Hello');assert.equal(turn.output.length,1);assert.equal(turn.output[0].text,'Hello world!');assert.equal(turn.tools[0].name,'read_file');
});
test('missing content and prices remain unavailable; unrelated request bodies are never guessed',()=>{
 const result=normalizeConversation([span()],[event('api_request_body',{request_body_id:'unmatched',body:JSON.stringify({system:'Unmatched instructions',messages:[]})}),event('assistant_response',{request_id:'request-1',response:'<REDACTED>'})]);
 assert.equal(result.turns.length,2);assert.equal(result.turns[0].instructions.length,0);assert.equal(result.turns[0].output.length,0);assert.equal(result.summary.cost_usd,null);assert.equal(result.summary.cost_complete,false);assert.equal(result.turns[1].kind,'unlinked');assert.equal(result.summary.requests,1);
});
test('request correlation isolates native sessions, counts distinct requests, and reports partial cost coverage',()=>{
 const second=span();second.span_id='span-2';second.attributes['session.id']='child';
 const result=normalizeConversation([span(),second],[event('api_request',{request_id:'request-1',cost_usd:0})]);assert.equal(result.turns.length,2);assert.equal(result.summary.requests,2);assert.equal(result.summary.cost_usd,0);assert.equal(result.summary.cost_complete,false);assert.equal(result.summary.cost_coverage,1);
});
test('generic gen-AI messages normalize, malformed bodies stay explicit, and content has bounds',()=>{
 const generic={name:'chat',attributes:{'gen_ai.operation.name':'chat','gen_ai.input.messages':JSON.stringify([{role:'system',content:'Rules'},{role:'user',content:'Question'}]),'gen_ai.output.messages':JSON.stringify([{role:'assistant',content:'Answer'}]),'gen_ai.usage.input_tokens':9}};
 const result=normalizeConversation([generic],[event('api_request_body',{body:'{"system":"truncated'}),event('api_request_body',{request_body_id:'large',body:JSON.stringify({system:'x'.repeat(100000),messages:Array.from({length:200},()=>({role:'user',content:'y'.repeat(10000)}))})})]);
 assert.equal(result.turns[0].instructions[0].text,'Rules');assert.equal(result.turns[0].input[0].text,'Question');assert.match(result.turns[1].warnings.join(' '),/not valid JSON/);assert.ok(JSON.stringify(result.turns[2]).length<110000);assert.equal(result.turns[2].instructions[0].truncated,true);assert.ok(result.turns[2].warnings.length);
});
test('content capture is explicit, validates strictly, and keeps all native content gates off by default',()=>{
 assert.deepEqual(validateTelemetry({capture_content:true}),{capture_content:true});assert.throws(()=>validateTelemetry({capture_content:'true'}),/boolean/);
 assert.equal(mergeTelemetry({capture_content:true},{capture_content:false}).capture_content,false);
 assert.equal(resolveTelemetry('/nonexistent-agent-farm-config',{capture_content:true},{},'/tmp').capture_content,true);
 const session={id:'session',traceparent:'parent',endpoint:'http://127.0.0.1:1234/token'};
 for(const enabled of [false,true]){
  const c=harnessTelemetry('claude',['claude'],{OTEL_LOG_ASSISTANT_RESPONSES:'1',OTEL_LOG_RAW_API_BODIES:'file:/unsafe'},session,enabled);
  for(const key of ['OTEL_LOG_USER_PROMPTS','OTEL_LOG_ASSISTANT_RESPONSES','OTEL_LOG_RAW_API_BODIES','OTEL_LOG_TOOL_DETAILS','OTEL_LOG_TOOL_CONTENT'])assert.equal(c.env[key],enabled?'1':'0');
  assert.ok(harnessTelemetry('codex',['codex'],{},session,enabled).argv.includes('otel.log_user_prompt='+enabled));
 }
});

test('large histories preserve the latest user message and reserve space for output',()=>{
 const request={system:'s'.repeat(50000),messages:[...Array.from({length:100},()=>({role:'user',content:'history'.repeat(10000)})),{role:'user',content:'Latest question'}]};
 const result=normalizeConversation([],[event('api_request_body',{request_body_id:'body',body:JSON.stringify(request)}),event('api_response_body',{request_id:'request',request_body_id:'body',body:JSON.stringify({content:[{type:'thinking',thinking:'not displayed'},{type:'text',text:'Actual answer'}]})})]);
 assert.equal(result.turns[0].input.at(-1).text,'Latest question');assert.equal(result.turns[0].output[0].text,'Actual answer');assert.ok(result.turns[0].warnings.length);assert.ok(JSON.stringify(result.turns[0]).length<100000);
});
