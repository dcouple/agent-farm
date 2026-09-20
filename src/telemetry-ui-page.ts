export const telemetryPage=String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent Farm · Sessions</title>
<style>
:root{color-scheme:light;--ink:#202d29;--muted:#67776f;--line:#e1e7e2;--green:#276347;--paper:#fff;--wash:#f4f6f3;--accent:#dcf0df}*{box-sizing:border-box}body{margin:0;font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--wash)}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:default;opacity:.45}button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #51a77c;outline-offset:3px}button,input,select{border:1px solid var(--line);border-radius:7px;background:white;color:inherit;padding:8px 11px}button:hover:not(:disabled){background:#edf4ee}a{color:var(--green)}.topbar{height:60px;background:#192f26;color:#ecf4ed;display:flex;align-items:center;justify-content:space-between;padding:0 25px}.brand{display:flex;align-items:center;gap:12px;font-weight:650;font-size:16px;letter-spacing:-.4px}.logo{display:grid;place-items:center;width:28px;height:28px;background:#a9d5a6;color:#193525;border-radius:7px;font-size:19px}.topbar small{color:#b7cdbf}.shell{display:grid;grid-template-columns:310px minmax(0,1fr);height:calc(100vh - 60px)}.sidebar{display:flex;flex-direction:column;border-right:1px solid var(--line);background:#fafbf9;min-height:0}.sidebar-head{padding:22px 18px 14px;border-bottom:1px solid var(--line)}.sidebar h1{font-size:21px;letter-spacing:-.6px;margin:0 0 14px}.search{width:100%;margin-bottom:10px}.filter-row{display:flex;gap:6px}.filter-row select{width:50%;font-size:12px}.filter-extra{margin-top:8px;font-size:12px}.filter-extra input{width:100%;margin:4px 0}.filter-extra label{display:block}.filter-extra summary{color:var(--muted)}.filter-submit{width:100%;margin-top:8px;background:#eaf2e9}.list-status{font-size:12px;color:var(--muted);margin:12px 0 0}.session-list{overflow:auto;flex:1;padding:10px}.session-link{display:block;text-decoration:none;color:var(--ink);border:1px solid transparent;border-radius:9px;padding:14px 12px;margin-bottom:5px;position:relative}.session-link:hover{background:#eef2ec}.session-link[aria-current=true]{background:#e5eee2;border-color:#c9dcc8;box-shadow:inset 3px 0 var(--green)}.session-title{font-weight:650;display:flex;justify-content:space-between;gap:8px;word-break:break-word}.session-meta{font-size:12px;color:var(--muted);margin-top:5px}.session-path{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:6px}.dot{flex-shrink:0;width:7px;height:7px;border-radius:50%;display:inline-block;margin:7px 2px;background:#819387}.dot.success{background:#438c5b}.dot.failed{background:#c66d58}.dot.unfinished{background:#d2a346}.list-more{margin:0 15px 15px}.detail{overflow:auto;min-width:0}.detail-inner{max-width:1120px;margin:auto;padding:30px 40px 70px}.eyebrow{font:600 11px/1.5 ui-monospace,monospace;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted)}.detail-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:7px 0 12px}.detail-heading h1{font-size:28px;letter-spacing:-1px;line-height:1.25;margin:0;overflow-wrap:anywhere}.actions{display:flex;gap:6px;flex-shrink:0}.actions button{font-size:12px;padding:7px 10px}.subheading{color:var(--muted);font-size:12px;overflow-wrap:anywhere}.badge{display:inline-block;border-radius:4px;padding:2px 7px;background:#e5eee2;color:#376847;font-size:11px;margin-right:8px}.badge.failed{background:#f9e8e1;color:#a54d3b}.badge.unfinished{background:#f8edcf;color:#806b26}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:25px 0;background:white;border:1px solid var(--line);border-radius:10px}.stat{padding:15px 18px;border-right:1px solid var(--line)}.stat:last-child{border:0}.stat-label{display:block;color:var(--muted);font-size:11px}.stat-value{display:block;font-size:21px;font-weight:600;letter-spacing:-.6px}.stat-note{color:var(--muted);font-size:10px}.tabs{display:flex;gap:24px;border-bottom:1px solid var(--line);margin-bottom:22px}.tab{border:0;border-radius:0;background:transparent;padding:10px 0;color:var(--muted);font-size:13px}.tab[aria-selected=true]{color:var(--green);border-bottom:2px solid var(--green);font-weight:650}.notice{font-size:12px;line-height:1.65;border:1px solid #e4ddc8;border-radius:8px;background:#faf6e9;color:#786634;padding:12px 15px;margin:14px 0}.muted{color:var(--muted)}.empty{padding:60px 25px;text-align:center;color:var(--muted)}.empty h2{color:var(--ink);font-weight:550}.turn{border:1px solid var(--line);border-radius:10px;background:var(--paper);margin:14px 0;overflow:hidden}.turn>summary{padding:16px 20px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:center}.turn>summary::-webkit-details-marker{display:none}.turn>summary:before{content:'›';color:var(--muted);font-size:22px}.turn[open]>summary:before{transform:rotate(90deg)}.turn-title{flex:1}.turn-title strong{font-size:14px}.turn-title small{display:block;font-size:11px;color:var(--muted);margin-top:3px}.turn-metrics{font:11px ui-monospace,monospace;color:var(--muted);text-align:right}.turn-body{border-top:1px solid var(--line);padding:22px 24px}.section-label{display:flex;align-items:center;gap:9px;font-size:11px;font-weight:650;letter-spacing:1px;text-transform:uppercase;margin:22px 0 10px;color:var(--muted)}.section-label:first-child{margin-top:0}.section-label .number{font:10px ui-monospace,monospace;border:1px solid var(--line);border-radius:4px;padding:1px 5px}.content-section{border:1px solid var(--line);border-left:3px solid #b9cbb5;border-radius:5px;margin:8px 0;overflow:hidden}.content-section.system,.content-section.developer{border-left-color:#bba4d6;background:#faf8fd}.content-section.assistant{border-left-color:#7bae8d}.content-section.tool{border-left-color:#c1a76e;background:#fdfbf6}.content-section>summary{padding:10px 13px;font-size:12px;cursor:pointer;color:#52615a}.content-section>summary span{float:right;font:10px ui-monospace,monospace;color:var(--muted)}.document{padding:8px 18px 18px;font-size:13px;line-height:1.8;overflow-wrap:anywhere}.document p{white-space:pre-wrap;margin:8px 0}.document h3{font-size:15px;margin:18px 0 8px;line-height:1.5;color:#344d40}.document pre,pre.raw{font:11px/1.7 ui-monospace,SFMono-Regular,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f4f0;border:1px solid var(--line);border-radius:5px;padding:13px;max-height:500px;overflow:auto}.missing{padding:12px 14px;border:1px dashed #d5ddd3;border-radius:6px;font-size:12px;color:var(--muted)}.context-history{margin:10px 0;font-size:12px;color:var(--muted)}.context-history>summary{padding:7px 0;cursor:pointer}.tool-list{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.tool-chip{font:11px ui-monospace,monospace;background:#f2f4ee;border-radius:5px;padding:4px 7px}.usage{display:flex;flex-wrap:wrap;gap:7px;font:10px ui-monospace,monospace;margin:16px 0;color:var(--muted)}.usage span{border:1px solid var(--line);border-radius:4px;padding:4px 7px}.raw-details{margin-top:18px;color:var(--muted);font-size:12px}.raw-details summary{cursor:pointer}.timeline-row{padding:13px 0;border-bottom:1px solid var(--line)}.timeline-name{display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace}.bar{height:5px;border-radius:3px;background:#8bb495;margin-top:9px;min-width:2px;max-width:100%}.warning-list{font-size:11px;color:#8f703c}.metadata{display:grid;grid-template-columns:130px 1fr;gap:12px;font-size:12px}.metadata dt{color:var(--muted)}.metadata dd{margin:0;overflow-wrap:anywhere}#status{position:fixed;bottom:14px;right:20px;background:#213b2d;color:white;border-radius:7px;max-width:500px;padding:10px 16px;font-size:12px;z-index:5}#status:empty{display:none}[hidden]{display:none!important}@media(max-width:1000px){.detail-inner{padding:25px 22px}.shell{grid-template-columns:270px minmax(0,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:0}.stat:nth-child(-n+2){border-bottom:1px solid var(--line)}}@media(max-width:680px){.shell{display:block;height:auto}.sidebar{max-height:42vh;border-bottom:1px solid var(--line)}.session-list{min-height:110px}.sidebar-head{padding:12px 16px}.sidebar h1{display:none}.detail{overflow:visible}.detail-inner{padding:24px 16px}.detail-heading{display:block}.actions{margin-top:13px}.topbar small{display:none}.turn-body{padding:17px 14px}.turn>summary{padding:13px}.topbar{height:52px}}
</style></head><body>
<header class="topbar"><div class="brand"><span class="logo" aria-hidden="true">▦</span>Agent Farm <span style="font-weight:400;color:#91ad9b">/</span> <span style="font-weight:400">Sessions</span></div><small>LOCAL TELEMETRY · READ ONLY</small></header>
<div class="shell"><aside class="sidebar" aria-label="Session navigation"><div class="sidebar-head"><h1>Sessions</h1><form id="filters"><input class="search" id="search" placeholder="Search loaded sessions…" aria-label="Search loaded sessions"><div class="filter-row"><select name="harness" aria-label="Harness"><option value="">All harnesses</option><option>claude</option><option>codex</option></select><select name="status" aria-label="Outcome"><option value="">All outcomes</option><option>success</option><option>failed</option><option>unfinished</option></select></div><details class="filter-extra"><summary>More filters</summary><input name="profile" placeholder="Exact profile" aria-label="Exact profile"><input name="project" placeholder="Project contains" aria-label="Project contains"><label>From (UTC)<input name="from" type="date"></label><label>Through (UTC)<input name="to" type="date"></label></details><button class="filter-submit">Apply filters</button></form><p id="list-status" class="list-status" role="status">Loading sessions…</p></div><nav id="sessions" class="session-list" aria-label="Recorded sessions"></nav><button id="more" class="list-more" hidden>Load more sessions</button></aside><main id="detail" class="detail"><div class="empty"><h2>Your sessions, one conversation at a time.</h2><p>Select a run to explore its context, output, and usage.</p></div></main></div><div id="status" role="status"></div><script src="app.js"></script></body></html>`;

// Serialized after TypeScript compilation; keep all browser dependencies local.
export function telemetryBrowser(){
  type Data=Record<string,any>;
  const $=(id:string)=>document.getElementById(id)!;
  let sessions:Data[]=[],selected='',cursor:string|null=null,filters:Data={},loading=false,generation=0,tab='conversation';
  let sessionData:Data|undefined,conversationData:Data|undefined;
  const number=(value:any)=>typeof value==='number'?value.toLocaleString(undefined,{maximumFractionDigits:0}):'—';
  const money=(value:any)=>typeof value==='number'?'$'+value.toFixed(value<.01?5:4):'Not reported';
  const duration=(value:any)=>typeof value==='number'?(value>=1000?(value/1000).toFixed(2)+'s':value.toFixed(0)+'ms'):'—';
  const date=(value:any)=>value?new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Time not recorded';
  function el(tag:string,text:string,parent:HTMLElement,cls?:string):HTMLElement{const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;parent.append(node);return node;}
  function button(label:string,parent:HTMLElement,action:()=>void){const node=el('button',label,parent) as HTMLButtonElement;node.onclick=action;return node;}
  async function query(name:string,args:Data){const response=await fetch('api/'+name+'?args='+encodeURIComponent(JSON.stringify(args)));const value=await response.json();if(!response.ok)throw Error(value.error??'Query failed');return value;}
  function error(e:unknown){$('status').textContent=e instanceof Error?e.message:String(e);}
  function notify(text:string){$('status').textContent=text;}
  function selectedHash(){return new URLSearchParams(location.hash.slice(1)).get('session')??'';}
  function choose(id:string){location.hash='session='+encodeURIComponent(id);}
  function renderList(){
    const list=$('sessions'),scroll=list.scrollTop;list.replaceChildren();
    const search=($('search') as HTMLInputElement).value.toLowerCase();
    for(const s of sessions.filter(s=>[s.profile,s.model,s.worktree,s.id].some(v=>String(v??'').toLowerCase().includes(search)))){
      const link=el('a','',list,'session-link') as HTMLAnchorElement;link.href='#session='+encodeURIComponent(s.id);link.setAttribute('aria-current',String(s.id===selected));
      const title=el('div','',link,'session-title');el('span',s.profile??'Unnamed session',title);const dot=el('span','',title,'dot '+s.status);dot.title=s.status;
      el('div',(s.harness??'agent')+' · '+(s.model??'unknown model'),link,'session-meta');el('div',date(s.started_at)+' · '+duration(s.duration_ms),link,'session-meta');
      el('div',s.worktree??s.project??'',link,'session-path').title=s.worktree??s.project??'';
    }
    if(!list.children.length)el('p','No matching sessions.',list,'empty');list.scrollTop=scroll;
  }
  async function loadSessions(append=false,quiet=false){
    if(loading)return;loading=true;
    try{
      const data=await query('list_sessions',{...filters,limit:50,...(append&&cursor?{cursor}:{})}),before=JSON.stringify(sessions);
      if(append){const ids=new Set(sessions.map(s=>s.id));sessions.push(...data.items.filter((s:Data)=>!ids.has(s.id)));}else if(quiet){const ids=new Set(data.items.map((s:Data)=>s.id));sessions=[...data.items,...sessions.filter(s=>!ids.has(s.id))];}else sessions=data.items;
      cursor=quiet?cursor:data.next_cursor;($('more') as HTMLButtonElement).hidden=!cursor;
      $('list-status').textContent=data.total_matching+' sessions'+(data.partial?' · partial scan':'')+(data.warnings.length?' · '+data.warnings.join(' '):'');if(!quiet||before!==JSON.stringify(sessions))renderList();
      if(!selectedHash()&&sessions[0]){history.replaceState(null,'','#session='+sessions[0].id);await loadDetail(sessions[0].id);}
    }catch(e){error(e);}finally{loading=false;}
  }
  function documentText(text:string,parent:HTMLElement){
    const root=el('div','',parent,'document');let code:string[]|null=null,paragraph:string[]=[];
    const flush=()=>{if(paragraph.length){el('p',paragraph.join('\n'),root);paragraph=[];}};
    for(const line of text.split('\n')){
      if(line.startsWith('```')){flush();if(code){el('pre',code.join('\n'),root);code=null;}else code=[];continue;}
      if(code){code.push(line);continue;}
      if(/^#{1,6} /.test(line)){flush();el('h3',line.replace(/^#{1,6} /,''),root);}
      else if(line===''){flush();}else paragraph.push(line);
    }
    flush();if(code)el('pre',code.join('\n'),root);
  }
  function section(section:Data,parent:HTMLElement,open=false){
    const node=el('details','',parent,'content-section '+(['system','developer','assistant','tool'].includes(section.role)?section.role:'user')) as HTMLDetailsElement;node.open=open;
    const summary=el('summary',section.title??section.role,node);el('span',number(section.text.length)+' chars'+(section.truncated?' · truncated':''),summary);
    documentText(section.text,node);
  }
  function label(index:string,title:string,parent:HTMLElement){const node=el('div','',parent,'section-label');el('span',index,node,'number');el('span',title,node);}
  function renderTurn(turn:Data,index:number,parent:HTMLElement,open:boolean){
    const card=el('details','',parent,'turn') as HTMLDetailsElement;card.open=open;
    const heading=el('summary','',card),title=el('div','',heading,'turn-title');
    el('strong',(turn.kind==='request'?'Request ':turn.kind==='unlinked'?'Unlinked context ':'Message ')+(index+1),title);
    el('small',(turn.model??'Model not reported')+' · '+date(turn.started_at)+(turn.error?' · error':''),title);
    el('div',duration(turn.duration_ms)+' · '+money(turn.cost_usd),heading,'turn-metrics');
    const body=el('div','',card,'turn-body');
    if(turn.warnings.length)el('p',turn.warnings.join(' '),body,'warning-list');
    label('01','Instructions',body);
    if(turn.instructions.length)for(const s of turn.instructions)section(s,body,false);
    else el('div','Instructions were not captured for this request.',body,'missing');
    label('02','Input & context',body);
    if(turn.input.length){
      const previous=turn.input.slice(0,-1);
      if(previous.length){const history=el('details','',body,'context-history');el('summary',previous.length+' earlier context section'+(previous.length===1?'':'s')+' · expand to inspect',history);for(const s of previous)section(s,history,false);}
      section(turn.input[turn.input.length-1],body,true);
    }else el('div','Input text was not captured. Timing and usage may still be available.',body,'missing');
    if(turn.tools.length){const tools=el('details','',body,'context-history');el('summary',turn.tools.length+' tool definitions in context',tools);const list=el('div','',tools,'tool-list');for(const tool of turn.tools)el('span',tool.name,list,'tool-chip').title=tool.description??'';}
    label('03','Output',body);
    if(turn.output.length)for(const s of turn.output)section(s,body,true);
    else el('div','Output was not captured, or this request has not completed.',body,'missing');
    const usage=el('div','',body,'usage');for(const [label,value] of [['Input',turn.usage.input],['Output',turn.usage.output],['Cache read',turn.usage.cache_read],['Cache write',turn.usage.cache_write]])el('span',label+': '+number(value),usage);
    const evidence=el('details','',body,'raw-details');el('summary','Source & correlation',evidence);el('pre',JSON.stringify({request_id:turn.request_id,native_session:turn.native_session,sources:turn.sources},null,2),evidence,'raw');
  }
  function renderConversation(root:HTMLElement,data:Data,token:number){
    if(data.partial||data.warnings.length)el('p',[data.partial?'Partial telemetry scan.':'',...data.warnings].join(' '),root,'notice');
    if(!data.turns.some((t:Data)=>t.instructions.length||t.input.length||t.output.length)){
      const note=el('div','This session has no captured conversation text. For future sessions, explicitly enable telemetry.capture_content: true. It records sensitive prompts, instructions, outputs, and tool content locally; leave it off where that is inappropriate.',root,'notice');note.setAttribute('role','note');
    }
    let start=Math.max(0,data.total-data.turns.length);
    const earlier=button('Load earlier requests',root,async()=>{
      earlier.disabled=true;try{const next=Math.max(0,start-5),page=await query('conversation',{session_id:selected,cursor:String(next),limit:Math.min(5,start)});if(token!==generation)return;
        const fragment=document.createElement('div');page.turns.slice(0,start-next).forEach((turn:Data,i:number)=>renderTurn(turn,next+i,fragment,false));while(fragment.lastChild)list.prepend(fragment.lastChild);start=next;earlier.hidden=start===0;
      }catch(e){error(e);}finally{earlier.disabled=false;}
    });earlier.hidden=start===0;
    const list=el('div','',root);data.turns.forEach((turn:Data,i:number)=>renderTurn(turn,start+i,list,i===data.turns.length-1));
    if(!data.total)el('div','No model requests have been recorded yet. Use Timeline & events to inspect the available telemetry.',root,'empty');
  }
  async function renderRaw(root:HTMLElement,token:number){
    for(const [name,title] of [['query_spans','Spans'],['query_events','Events']]){
      el('h3',title!,root);const list=el('div','',root);let next:string|undefined;
      const more=button('Load '+title,root,async()=>{more.disabled=true;try{
        const data=await query(name!,{session_id:selected,limit:50,...(next?{cursor:next}:{})});if(token!==generation||tab!=='timeline')return;
        const max=Math.max(1,...data.items.map((row:Data)=>row.duration_ms??0));
        for(const row of data.items){const item=el('div','',list,'timeline-row'),heading=el('div','',item,'timeline-name');el('span',row.name??row.attributes?.['event.name']??row.body?.stringValue??'Event',heading);el('span',duration(row.duration_ms),heading);if(row.duration_ms!==undefined)el('div','',item,'bar').style.width=(100*row.duration_ms/max)+'%';const raw=el('details','',item,'raw-details');el('summary','Raw attributes',raw);el('pre',JSON.stringify(row,null,2),raw,'raw');}
        if(data.warnings.length)el('p',data.warnings.join(' '),list,'notice');next=data.next_cursor??undefined;more.hidden=!next;more.textContent='Load more';
      }catch(e){error(e);}finally{more.disabled=false;}});more.click();
    }
  }
  function renderDetail(token:number){
    if(!sessionData||!conversationData)return;
    const s=sessionData.session,data=conversationData,root=$('detail');root.replaceChildren();const inner=el('div','',root,'detail-inner');
    el('div','SESSION / '+(s.harness??'AGENT'),inner,'eyebrow');const heading=el('div','',inner,'detail-heading');el('h1',s.profile??'Session',heading);const actions=el('div','',heading,'actions');
    const index=sessions.findIndex(row=>row.id===selected);button('← Previous',actions,()=>choose(sessions[index-1]!.id)).disabled=index<=0;button('Next →',actions,()=>choose(sessions[index+1]!.id)).disabled=index<0||index>=sessions.length-1;button('Refresh',actions,()=>loadDetail(selected));
    const sub=el('div','',inner,'subheading');el('span',s.status,sub,'badge '+s.status);el('span',date(s.started_at)+' · '+(s.user??'Unknown user')+' · '+(s.model??'Unknown model'),sub);el('div',s.worktree??s.project??'',inner,'subheading');
    const stats=el('div','',inner,'stats'),summary=data.summary;
    for(const [label,value,note] of [['Duration',duration(s.duration_ms),s.completion_recorded?'Completed session':'Completion not recorded'],['Model requests',number(summary.requests),'Correlated spans & events'],['Output tokens',number(summary.output_tokens),'Input: '+number(summary.input_tokens)+' · cache read: '+number(summary.cache_read_tokens)],['Reported cost',money(summary.cost_usd),summary.cost_complete?'Harness-reported · not an invoice':summary.cost_coverage+'/'+summary.requests+' requests have cost data']]){const stat=el('div','',stats,'stat');el('span',label!,stat,'stat-label');el('span',value!,stat,'stat-value');el('span',note!,stat,'stat-note');}
    const tabs=el('div','',inner,'tabs');tabs.setAttribute('role','tablist');const panel=el('div','',inner);panel.id='session-panel';panel.setAttribute('role','tabpanel');
    for(const [id,title] of [['conversation','Conversation'],['timeline','Timeline & events'],['metadata','Session details']]){const b=button(title!,tabs,()=>{tab=id!;renderDetail(token);});b.className='tab';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(tab===id));b.setAttribute('aria-controls',panel.id);}
    if(tab==='conversation')renderConversation(panel,data,token);
    else if(tab==='timeline')void renderRaw(panel,token);
    else{const meta=el('dl','',panel,'metadata');for(const [key,value] of Object.entries(s).filter(([key])=>key!=='attributes')){el('dt',key.replaceAll('_',' '),meta);el('dd',String(value??'Not recorded'),meta);}const raw=el('details','',panel,'raw-details');el('summary','All recorded launch attributes',raw);el('pre',JSON.stringify(s.attributes,null,2),raw,'raw');}
  }
  async function loadDetail(id:string){
    selected=id;const token=++generation;renderList();notify('Loading session…');
    try{const [session,initial]=await Promise.all([query('get_session',{session_id:id}),query('conversation',{session_id:id})]);
      const data=initial.total>5?await query('conversation',{session_id:id,cursor:String(initial.total-5)}):initial;
      if(token!==generation)return;sessionData=session;conversationData=data;renderDetail(token);notify('');
    }catch(e){if(token===generation){$('detail').replaceChildren();el('div','This session could not be loaded. Choose another session or refresh.', $('detail'),'empty');error(e);}}
  }
  $('filters').onsubmit=e=>{e.preventDefault();filters=Object.fromEntries([...new FormData(e.currentTarget as HTMLFormElement)].filter(([,value])=>value));if(filters.to)filters.to+='T23:59:59.999Z';void loadSessions();};
  $('search').oninput=renderList;$('more').onclick=()=>loadSessions(true);
  window.addEventListener('hashchange',()=>{const id=selectedHash();if(id)void loadDetail(id);});
  void loadSessions();if(selectedHash())void loadDetail(selectedHash());
  setInterval(()=>{if(!document.hidden)void loadSessions(false,true);},5000);
}
