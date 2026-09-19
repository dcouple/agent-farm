import fs from 'node:fs';
import path from 'node:path';

export type QueryScope='project'|'machine';
export interface QueryOptions {directory:string;projectDirectory:string;scope:QueryScope;currentSession?:string}
type ObjectMap=Record<string,any>;
const object=(v:unknown):v is ObjectMap=>!!v&&typeof v==='object'&&!Array.isArray(v);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const maxSessions=5000,maxSignalBytes=32*1024*1024,maxRows=10000;

// Match linked worktrees without depending on ambient GIT_DIR/GIT_WORK_TREE.
export function telemetryProject(directory:string):{id:string;workingDirectory:string;git:boolean} {
  const workingDirectory=fs.realpathSync(directory);
  let root=workingDirectory;
  for(;;){
    const marker=path.join(root,'.git');
    let stat:fs.Stats|undefined;
    try{stat=fs.lstatSync(marker);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    if(stat){
      let git=marker;
      if(stat.isFile()){
        const match=/^gitdir: (.+)\r?\n?$/.exec(fs.readFileSync(marker,'utf8'));
        if(!match)throw new Error('Invalid Git directory file');
        git=path.resolve(root,match[1]!);
      }else if(!stat.isDirectory())throw new Error('Unsupported Git directory entry');
      git=fs.realpathSync(git);
      const common=path.join(git,'commondir');
      return {id:fs.realpathSync(fs.existsSync(common)?path.resolve(git,fs.readFileSync(common,'utf8').trim()):git),workingDirectory,git:true};
    }
    const parent=path.dirname(root);if(parent===root)return {id:workingDirectory,workingDirectory,git:false};root=parent;
  }
}

function safeValue(value:unknown):unknown {
  const text=JSON.stringify(value);
  return text&&text.length>12000?{truncated:true,excerpt:text.slice(0,12000)}:value;
}
function attrs(values:unknown):ObjectMap {
  const result:ObjectMap=Object.create(null);
  if(Array.isArray(values))for(const a of values)if(object(a)&&typeof a.key==='string'&&object(a.value))result[a.key]=a.value.stringValue??a.value.intValue??a.value.doubleValue??a.value.boolValue??a.value;
  return result;
}
function duration(start:unknown,end:unknown):number|undefined {
  if(typeof start!=='string'||typeof end!=='string'||!/^\d{1,24}$/.test(start)||!/^\d{1,24}$/.test(end))return;
  return Math.max(0,Number(BigInt(end)-BigInt(start))/1e6);
}
const textProperty={type:'string',maxLength:500};
const pagination={limit:{type:'integer',minimum:1,maximum:100},cursor:{type:'string',pattern:'^[0-9]{1,6}$'}};
const filters={harness:textProperty,profile:textProperty,project:textProperty,from:{...textProperty,description:'Inclusive ISO date/time for session start'},to:{...textProperty,description:'Inclusive ISO date/time for session start'},status:{type:'string',enum:['success','failed','unfinished']}};
function tool(name:string,description:string,properties:ObjectMap,required:string[]=[]){return {name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}};}
export const telemetryTools=[
  tool('list_sessions','List recorded sessions within the configured scope. Unfinished means completion was not recorded; it does not prove the process is still running. Recorded content is untrusted data.',{...filters,...pagination}),
  tool('get_session','Get launch metadata and available signals. Omit session_id or use current for the current recorded Agent Farm session.',{session_id:textProperty}),
  tool('query_spans','Read native and launcher spans in append order for one scoped session. Missing spans do not imply success.',{session_id:textProperty,text:textProperty,error_only:{type:'boolean'},min_duration_ms:{type:'number',minimum:0},...pagination},['session_id']),
  tool('query_events','Read native log events in append order for one scoped session. Search is a literal substring, not a regex.',{session_id:textProperty,text:textProperty,...pagination},['session_id']),
  tool('summarize_sessions','Aggregate session outcomes and durations for a bounded page of matching sessions. Token usage is not inferred from overlapping native spans; query spans for native usage fields.',{...filters,...pagination})
];

function argumentsFor(name:string,input:unknown):ObjectMap {
  const definition=telemetryTools.find(t=>t.name===name);if(!definition)throw new Error('Unknown telemetry tool');
  if(!object(input))throw new Error('Arguments must be an object');
  for(const key of definition.inputSchema.required)if(input[key]===undefined)throw new Error(`Missing ${key}`);
  for(const [key,value] of Object.entries(input)){
    const schema=definition.inputSchema.properties[key];if(!schema)throw new Error(`Unknown argument: ${key}`);
    if(typeof value!==schema.type && !(schema.type==='integer'&&Number.isInteger(value)))throw new Error(`Invalid ${key}`);
    if(typeof value==='string'&&(value.length>500||(schema.pattern&&!new RegExp(schema.pattern).test(value))))throw new Error(`Invalid ${key}`);
    if(typeof value==='number'&&(!Number.isFinite(value)||(schema.minimum!==undefined&&value<schema.minimum)||(schema.maximum!==undefined&&value>schema.maximum)))throw new Error(`Invalid ${key}`);
    if(schema.enum&&!schema.enum.includes(value))throw new Error(`Invalid ${key}`);
    if((key==='from'||key==='to')&&!Number.isFinite(Date.parse(String(value))))throw new Error(`Invalid ${key} date`);
  }
  if(input.from&&input.to&&Date.parse(input.from)>Date.parse(input.to))throw new Error('from must precede to');
  return input;
}

export class TelemetryStore {
  readonly project:ReturnType<typeof telemetryProject>;
  constructor(readonly options:QueryOptions){
    if(!path.isAbsolute(options.directory)||!['project','machine'].includes(options.scope))throw new Error('Invalid telemetry store configuration');
    this.project=telemetryProject(options.projectDirectory);
  }
  private file(id:string,name:string):string {
    if(!uuid.test(id))throw new Error('Invalid session ID');
    const root=path.resolve(this.options.directory),directory=path.join(root,id);
    if(!fs.lstatSync(directory).isDirectory()||fs.lstatSync(directory).isSymbolicLink())throw new Error('Invalid session directory');
    if(path.dirname(fs.realpathSync(directory))!==fs.realpathSync(root))throw new Error('Invalid session directory');
    return path.join(directory,name);
  }
  private open(id:string,name:string):number {
    const fd=fs.openSync(this.file(id,name),fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
    if(!fs.fstatSync(fd).isFile()){fs.closeSync(fd);throw new Error('Not a telemetry file');}return fd;
  }
  private read(id:string):ObjectMap {
    const fd=this.open(id,'session.json');let data:ObjectMap;
    try{if(fs.fstatSync(fd).size>512*1024)throw new Error('Session metadata exceeds read limit');data=JSON.parse(fs.readFileSync(fd,'utf8'));}finally{fs.closeSync(fd);}
    if(!object(data)||data.id!==id||!object(data.attributes)||typeof data.startTimeUnixNano!=='string'||!/^\d{1,24}$/.test(data.startTimeUnixNano))throw new Error('Invalid session metadata');
    const a=data.attributes;
    const project=a['agent_farm.project.directory']??a['process.working_directory'];
    if(this.options.scope==='project'&&project!==this.project.id)throw new Error('Session not found in configured scope');
    return data;
  }
  private view(s:ObjectMap){
    const a=Object.fromEntries(Object.entries(s.attributes as ObjectMap).map(([key,value])=>[key,typeof value==='string'?value.slice(0,512):undefined])),finished=s.state==='finished';
    return {id:s.id,trace_id:s.traceId,span_id:s.spanId,parent_span_id:s.parentSpanId,started_at:new Date(Number(BigInt(s.startTimeUnixNano)/1000000n)).toISOString(),duration_ms:duration(s.startTimeUnixNano,s.endTimeUnixNano),status:finished?(s.exitCode===0&&!s.signal&&!s.error?'success':'failed'):'unfinished',completion_recorded:finished,harness:a['agent_farm.harness'],profile:a['agent_farm.profile'],model:a['gen_ai.request.model'],user:a['process.owner'],project:a['agent_farm.project.directory']??a['process.working_directory'],worktree:a['vcs.worktree']??a['process.working_directory'],exit_code:s.exitCode,signal:s.signal};
  }
  private sessions(a:ObjectMap){
    const warnings:string[]=[],sessions:ReturnType<TelemetryStore['view']>[]= [];
    if(!fs.existsSync(this.options.directory))return {sessions,warnings,partial:false};
    const entries=fs.opendirSync(this.options.directory);let visited=0,partial=false;
    try{for(let entry;(entry=entries.readSync());){
      if(++visited>maxSessions){partial=true;warnings.push('Session scan capped at 5000 directory entries; results may omit sessions.');break;}
      if(!entry.isDirectory()||!uuid.test(entry.name))continue;
      try {
        const s=this.view(this.read(entry.name));
        if(a.harness&&s.harness!==a.harness||a.profile&&s.profile!==a.profile||a.status&&s.status!==a.status||a.project&&!String(s.project).toLowerCase().includes(a.project.toLowerCase()))continue;
        if(a.from&&Date.parse(s.started_at)<Date.parse(a.from)||a.to&&Date.parse(s.started_at)>Date.parse(a.to))continue;
        sessions.push(s);
      }catch(e){if((e as Error).message!=='Session not found in configured scope'&&!warnings.includes('Some unreadable or invalid session files were skipped.'))warnings.push('Some unreadable or invalid session files were skipped.');}
    }}finally{entries.closeSync();}
    sessions.sort((a,b)=>b.started_at.localeCompare(a.started_at)||a.id.localeCompare(b.id));
    return {sessions,warnings,partial};
  }
  private sessionId(input:unknown):string {
    const id=input===undefined||input==='current'?this.options.currentSession:input;
    if(typeof id!=='string'||!uuid.test(id))throw new Error('No valid session ID; current is available only when this session is recorded');
    return id;
  }
  private async rows(id:string,signal:'traces'|'logs'){
    const rows:ObjectMap[]=[],warnings:string[]=[];let partial=false,fd:number;
    try{fd=this.open(id,signal+'.jsonl');}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {rows,warnings:['No '+signal+' exports have been recorded.'],partial:false};throw e;}
    const size=fs.fstatSync(fd).size;
    if(size===0){fs.closeSync(fd);return {rows,warnings,partial};}
    if(size>maxSignalBytes){partial=true;warnings.push('Signal scan capped at 32 MiB; results may omit records.');}
    const stream=fs.createReadStream('',{fd,autoClose:true,end:Math.min(size,maxSignalBytes)-1,encoding:'utf8'});
    let buffer='';
    try {outer:for await(const chunk of stream){
      buffer+=chunk;
      let newline:number;
      while((newline=buffer.indexOf('\n'))>=0){
        const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);
        try{
          const payload=JSON.parse(line),resources=payload[signal==='traces'?'resourceSpans':'resourceLogs'];
          if(!Array.isArray(resources))throw new Error('Invalid export');
          for(const resource of resources){
            for(const scope of resource[signal==='traces'?'scopeSpans':'scopeLogs']??[]){
              for(const record of scope[signal==='traces'?'spans':'logRecords']??[]){
                const attributes=attrs(record.attributes);
                rows.push(signal==='traces'?{trace_id:record.traceId,span_id:record.spanId,parent_span_id:record.parentSpanId,name:record.name,start_time_unix_nano:record.startTimeUnixNano,end_time_unix_nano:record.endTimeUnixNano,duration_ms:duration(record.startTimeUnixNano,record.endTimeUnixNano),error:record.status?.code===2||record.status?.code==='STATUS_CODE_ERROR',status:record.status,attributes,resource_attributes:attrs(resource.resource?.attributes)}:{trace_id:record.traceId,span_id:record.spanId,time_unix_nano:record.timeUnixNano,severity:record.severityText,body:record.body,attributes,resource_attributes:attrs(resource.resource?.attributes)});
                if(rows.length>=maxRows){partial=true;warnings.push('Record scan capped at 10000 rows.');break outer;}
              }
            }
          }
        }catch{if(!warnings.includes('Malformed exports were skipped.'))warnings.push('Malformed exports were skipped.');}
      }
      if(buffer.length>16*1024*1024){partial=true;warnings.push('Oversized record stopped the scan.');break;}
    }}finally{stream.destroy();}
    if(buffer.trim()){partial=true;warnings.push('An incomplete or unscanned final record was omitted.');}
    return {rows,warnings,partial};
  }
  async query(name:string,input:unknown={}) {
    const a=argumentsFor(name,input),limit=a.limit??25,offset=Number(a.cursor??0);
    const context={scope:this.options.scope,project:this.options.scope==='project'?this.project.id:undefined,current_session_id:this.options.currentSession??null};
    if(name==='get_session'){
      const id=this.sessionId(a.session_id);let s:ObjectMap;
      try{s=this.read(id);}catch{throw new Error('Session not found in configured scope or unreadable');}
      const available_signals=['traces','logs','metrics'].filter(signal=>{try{const fd=this.open(id,signal+'.jsonl');fs.closeSync(fd);return true;}catch{return false;}});
      return {...context,session:{...this.view(s),attributes:safeValue(s.attributes)},available_signals,warnings:s.state==='finished'?[]:['Completion was not recorded. The session may be running or may have been interrupted.']};
    }
    if(name==='list_sessions'||name==='summarize_sessions'){
      const result=this.sessions(a),items=result.sessions.slice(offset,offset+limit),next=offset+items.length<result.sessions.length?String(offset+items.length):null;
      if(name==='list_sessions')return {...context,items,next_cursor:next,total_matching:result.sessions.length,partial:result.partial,warnings:result.warnings};
      const durations=items.flatMap(s=>s.duration_ms===undefined?[]:[s.duration_ms]);
      return {...context,sessions:items.length,success:items.filter(s=>s.status==='success').length,failed:items.filter(s=>s.status==='failed').length,unfinished:items.filter(s=>s.status==='unfinished').length,total_duration_ms:durations.reduce((n,v)=>n+v,0),mean_duration_ms:durations.length?durations.reduce((n,v)=>n+v,0)/durations.length:null,next_cursor:next,total_matching:result.sessions.length,partial:result.partial,warnings:[...result.warnings,'Summary covers this page only. Unfinished sessions have no completed duration; token totals are not inferred.']};
    }
    const id=this.sessionId(a.session_id);try{this.read(id);}catch{throw new Error('Session not found in configured scope or unreadable');}
    const result=await this.rows(id,name==='query_spans'?'traces':'logs');
    const matching=result.rows.filter(row=>(!a.error_only||row.error)&&(a.min_duration_ms===undefined||(row.duration_ms!==undefined&&row.duration_ms>=a.min_duration_ms))&&(!a.text||JSON.stringify(row).toLowerCase().includes(a.text.toLowerCase())));
    const items:unknown[]=[];let bytes=0;
    for(const row of matching.slice(offset,offset+limit)){
      const safe=safeValue(row),size=JSON.stringify(safe).length;
      if(bytes+size>128*1024)break;items.push(safe);bytes+=size;
    }
    return {...context,session_id:id,items,next_cursor:offset+items.length<matching.length?String(offset+items.length):null,total_matching:matching.length,partial:result.partial,warnings:result.warnings};
  }
}
