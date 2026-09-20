// Presentation adapter: never read referenced paths or guess a missing transcript.
type RecordData=Record<string,any>;
export interface ContentSection {role:string;title:string;text:string;truncated:boolean}
export interface ConversationTurn {
  id:string;kind:'request'|'message'|'unlinked';model?:string;started_at?:string;duration_ms?:number;
  request_id?:string;prompt_id?:string;native_session?:string;error:boolean;
  trace_id?:string;span_id?:string;finish_reason?:string;
  usage:{input?:number;output?:number;cache_read?:number;cache_write?:number};cost_usd?:number;
  instructions:ContentSection[];input:ContentSection[];output:ContentSection[];
  tools:{name:string;description?:string}[];warnings:string[];sources:string[];
}
const object=(v:unknown):v is RecordData=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown)=>typeof v==='string'?v:undefined;
const number=(v:unknown):number|undefined=>v!==null&&v!==undefined&&v!==''&&(typeof v==='string'||typeof v==='number')&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):undefined;
function parse(v:unknown):any {if(typeof v!=='string')return v;try{return JSON.parse(v);}catch{return v;}}
function visible(v:unknown):boolean{return v!==undefined&&v!==null&&v!==''&&!(typeof v==='string'&&/^\s*(?:<REDACTED>|\[REDACTED\])\s*$/i.test(v));}
function timestamp(row:RecordData):string|undefined {
  const nanos=row.start_time_unix_nano??row.time_unix_nano;
  if(typeof nanos==='string'&&/^\d{1,24}$/.test(nanos)){const date=new Date(Number(BigInt(nanos)/1000000n));if(Number.isFinite(date.getTime()))return date.toISOString();}
  const value=row.attributes?.['event.timestamp'];if(typeof value==='string'&&Number.isFinite(Date.parse(value)))return new Date(value).toISOString();
}
function content(value:unknown):string {
  if(typeof value==='string')return value;
  if(Array.isArray(value))return value.map(block=>{
    if(!object(block))return typeof block==='string'?block:'';
    if(block.type==='thinking'||block.type==='redacted_thinking')return '';
    if(typeof block.text==='string')return block.text;
    if(block.type==='tool_use')return 'Tool call: '+block.name+'\n'+JSON.stringify(block.input,null,2);
    if(block.type==='tool_result')return 'Tool result: '+(block.tool_use_id??'')+'\n'+content(block.content);
    if(block.type==='image'||block.type==='document')return '['+block.type+' attachment; binary content omitted]';
    if(block.content!==undefined)return content(block.content);
    return JSON.stringify(block,null,2);
  }).filter(Boolean).join('\n\n');
  return JSON.stringify(value,null,2)??'';
}

export function normalizeConversation(spans:RecordData[],events:RecordData[]){
  const turns:ConversationTurn[]=[],requests=new Map<string,ConversationTurn>(),spanIndex=new Map<string,ConversationTurn>(),bodies=new Map<string,RecordData>();
  const scope=(row:RecordData)=>String(row.attributes?.['session.id']??row.attributes?.['conversation.id']??'');
  const key=(row:RecordData,id:string)=>scope(row)+'|'+id;
  const spanKey=(row:RecordData)=>String(row.trace_id??'')+'|'+String(row.span_id??'');
  const requestId=(a:RecordData)=>text(a.request_id??a['gen_ai.response.id']);
  function create(row:RecordData,kind:ConversationTurn['kind']='request'){
    const a=row.attributes??{},id=requestId(a);
    const turn:ConversationTurn={id:'turn-'+turns.length,kind,request_id:id,prompt_id:text(a['prompt.id']??a['turn.id']),native_session:text(a['session.id']??a['conversation.id']),model:text(a['gen_ai.request.model']??a.model),started_at:timestamp(row),duration_ms:number(row.duration_ms??a.duration_ms),error:row.error===true||a.success===false||a.success==='false',usage:{},instructions:[],input:[],output:[],tools:[],warnings:[],sources:[]};
    turns.push(turn);if(id)requests.set(key(row,id),turn);return turn;
  }
  function find(row:RecordData):ConversationTurn|undefined {
    const id=requestId(row.attributes??{});
    return (id?requests.get(key(row,id)):undefined)??(row.span_id?spanIndex.get(spanKey(row)):undefined);
  }
  function usage(turn:ConversationTurn,a:RecordData){
    for(const [field,keys] of Object.entries({input:['gen_ai.usage.input_tokens','input_tokens'],output:['gen_ai.usage.output_tokens','output_tokens'],cache_read:['cache_read_tokens','cache_read_input_tokens','gen_ai.usage.cache_read.input_tokens'],cache_write:['cache_creation_tokens','cache_creation_input_tokens','gen_ai.usage.cache_creation.input_tokens']})){
      const value=keys.map(k=>number(a[k])).find(v=>v!==undefined);if(value!==undefined)(turn.usage as RecordData)[field]=value;
    }
    turn.cost_usd=number(a.cost_usd)??turn.cost_usd;
    turn.model=text(a['gen_ai.request.model']??a.model)??turn.model;
    turn.prompt_id=text(a['prompt.id']??a['turn.id'])??turn.prompt_id;
  }
  const budget=new Map<ConversationTurn,number>();
  function section(turn:ConversationTurn,where:'instructions'|'input'|'output',role:string,title:string,value:unknown){
    if(!visible(value))return;
    const raw=content(value),remaining=Math.min(96000-(budget.get(turn)??0),(where==='input'?48000:24000)-turn[where].reduce((n,s)=>n+s.text.length,0)),size=Math.min(24000,remaining);
    if(size<=0){const warning=where+' content exceeds its display limit; some sections were omitted.';if(!turn.warnings.includes(warning))turn.warnings.push(warning);return;}
    if(turn[where].some(s=>s.role===role&&s.text===raw))return;
    turn[where].push({role,title,text:raw.slice(0,size),truncated:raw.length>size||raw.includes('[TRUNCATED')});budget.set(turn,(budget.get(turn)??0)+Math.min(raw.length,size));
  }
  function input(turn:ConversationTurn,payload:unknown){
    const data=parse(payload);
    if(!object(data)){turn.warnings.push('Request body is truncated or is not valid JSON; exact context could not be reconstructed.');section(turn,'input','context','Unparsed request body',data);return;}
    section(turn,'instructions','system','System instructions',data.system??data.instructions);
    const messages=Array.isArray(data.messages)?data.messages:Array.isArray(data.input)?data.input:[];
    if(messages.length>64)turn.warnings.push('Only the last 64 input messages are shown.');
    const inputStart=turn.input.length;
    for(const message of messages.slice(-64).reverse())if(object(message)){
      const role=text(message.role)??'context',where=role==='system'||role==='developer'?'instructions':'input';
      const blocks=Array.isArray(message.content)?message.content:[message.content??message.text];
      for(const block of [...blocks].reverse()){const isContext=object(block)&&typeof block.text==='string'&&block.text.trimStart().startsWith('<system-reminder>');
        section(turn,where,isContext?'context':role,isContext?'Harness context (in user message)':role==='user'?'User message':role==='assistant'?'Previous assistant message':role==='tool'?'Tool result':role,object(block)?[block]:block);
      }
    }
    turn.input.push(...turn.input.splice(inputStart).reverse());
    if(typeof data.input==='string')section(turn,'input','user','User message',data.input);
    if(Array.isArray(data.tools))turn.tools=data.tools.slice(0,100).filter(object).map(t=>({name:String(t.name??t.function?.name??'tool').slice(0,200),description:text(t.description??t.function?.description)?.slice(0,500)}));
  }
  // Spans define requests; logs enrich those requests instead of double-counting.
  for(const row of spans){
    const a=row.attributes??{},name=String(row.name??'');
    if(!(a['span.type']==='llm_request'||name==='claude_code.llm_request'||a['gen_ai.operation.name']==='chat'||a['gen_ai.operation.name']==='generate_content'))continue;
    let turn=find(row);if(!turn)turn=create(row);
    if(row.span_id){spanIndex.set(spanKey(row),turn);turn.span_id=text(row.span_id);turn.trace_id=text(row.trace_id);}turn.finish_reason=text(a.stop_reason);usage(turn,a);turn.sources.push('span');
    for(const field of ['system_prompt','user_system_prompt','gen_ai.system_instructions'])if(visible(a[field]))section(turn,'instructions','system',field==='user_system_prompt'?'User instructions':'System instructions',parse(a[field]));
    const messages=parse(a['gen_ai.input.messages']);if(Array.isArray(messages))input(turn,{messages});
    section(turn,'input','context','New context',parse(a.new_context));
    section(turn,'output','assistant','Assistant output',parse(a['gen_ai.output.messages']??a.response));
  }
  const ordered=[...events].sort((a,b)=>(timestamp(a)??'').localeCompare(timestamp(b)??''));
  const eventName=(row:RecordData)=>String(row.attributes?.['event.name']??row.body?.stringValue??'').replace(/^claude_code\./,'');
  for(const row of ordered){
    const a=row.attributes??{},name=eventName(row);
    if(name==='api_request'||name==='codex.api_request'){
      const turn=find(row)??create(row);usage(turn,a);turn.sources.push('request event');
    }
    if(name==='api_request_body'&&typeof a.request_body_id==='string')bodies.set(key(row,a.request_body_id),row);
  }
  const usedBodies=new Set<RecordData>();
  for(const row of ordered){
    const a=row.attributes??{},name=eventName(row);
    if(name==='api_response_body'){
      const turn=find(row)??create(row);const body=parse(a.body);const request=typeof a.request_body_id==='string'?bodies.get(key(row,a.request_body_id)):undefined;
      if(request){input(turn,request.attributes.body);usedBodies.add(request);}
      if(object(body)){budget.set(turn,Math.max(0,(budget.get(turn)??0)-turn.output.reduce((n,s)=>n+s.text.length,0)));turn.output=[];section(turn,'output','assistant','Assistant output',body.content??body.output);usage(turn,body.usage??{});turn.finish_reason=text(body.stop_reason)??turn.finish_reason;}
      else section(turn,'output','assistant','Unparsed response body',body);
      turn.sources.push('response body');if(a.body_truncated===true||a.body_truncated==='true')turn.warnings.push('The harness truncated the response body.');
      if(a.body_ref)turn.warnings.push('File-referenced bodies are not loaded by this viewer.');
    }
  }
  for(const row of ordered){
    const a=row.attributes??{},name=eventName(row);
    if(name==='assistant_response'){
      const turn=find(row)??create(row,'message');if(turn.output.length===0)section(turn,'output','assistant','Assistant output',a.response);turn.sources.push('assistant response');
    }
    if(name==='api_request_body'&&!usedBodies.has(row)){
      const turn=find(row)??create(row,'unlinked');input(turn,a.body);turn.sources.push('request body');
      if(turn.kind==='unlinked')turn.warnings.push('This captured input has no exact response correlation; it is not counted as an additional model request.');
      if(a.body_ref)turn.warnings.push('File-referenced bodies are not loaded by this viewer.');
    }
    if(name==='user_prompt'||name==='codex.user_prompt'){
      const candidates=turns.filter(t=>t.native_session===text(a['session.id']??a['conversation.id'])&&t.prompt_id===text(a['prompt.id']??a['turn.id'])&&t.prompt_id!==undefined);
      if(candidates.length){for(const turn of candidates)if(turn.input.length===0)section(turn,'input','user','User prompt (not full context)',a.prompt);}
      else if(visible(a.prompt)){const turn=create(row,'message');section(turn,'input','user','User prompt',a.prompt);turn.sources.push('user prompt');}
    }
  }
  turns.sort((a,b)=>(a.started_at??'').localeCompare(b.started_at??''));
  const requestsOnly=turns.filter(t=>t.kind==='request'),withCost=requestsOnly.filter(t=>t.cost_usd!==undefined);
  return {turns,summary:{requests:requestsOnly.length,cost_usd:withCost.length?withCost.reduce((sum,t)=>sum+t.cost_usd!,0):null,cost_coverage:withCost.length,cost_complete:requestsOnly.length>0&&withCost.length===requestsOnly.length,input_tokens:requestsOnly.some(t=>t.usage.input!==undefined)?requestsOnly.reduce((sum,t)=>sum+(t.usage.input??0),0):null,output_tokens:requestsOnly.some(t=>t.usage.output!==undefined)?requestsOnly.reduce((sum,t)=>sum+(t.usage.output??0),0):null,cache_read_tokens:requestsOnly.reduce((sum,t)=>sum+(t.usage.cache_read??0),0),cache_write_tokens:requestsOnly.reduce((sum,t)=>sum+(t.usage.cache_write??0),0)}};
}
