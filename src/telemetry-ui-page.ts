export const telemetryPage=String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent Farm · Sessions</title>
<style>
:root{color-scheme:light;--ink:#202d29;--muted:#67776f;--line:#e1e7e2;--green:#276347;--paper:#fff;--wash:#f4f6f3;--accent:#dcf0df}*{box-sizing:border-box}body{margin:0;font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--wash)}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:default;opacity:.45}button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #51a77c;outline-offset:3px}button,input,select{border:1px solid var(--line);border-radius:7px;background:white;color:inherit;padding:8px 11px}button:hover:not(:disabled){background:#edf4ee}a{color:var(--green)}.topbar{height:60px;background:#192f26;color:#ecf4ed;display:flex;align-items:center;justify-content:space-between;padding:0 25px}.brand{display:flex;align-items:center;gap:12px;font-weight:650;font-size:16px;letter-spacing:-.4px}.logo{display:grid;place-items:center;width:28px;height:28px;background:#a9d5a6;color:#193525;border-radius:7px;font-size:19px}.topbar small{color:#b7cdbf}.shell{display:grid;grid-template-columns:310px minmax(0,1fr);height:calc(100vh - 60px)}.sidebar{display:flex;flex-direction:column;border-right:1px solid var(--line);background:#fafbf9;min-height:0}.sidebar-head{padding:22px 18px 14px;border-bottom:1px solid var(--line)}.sidebar h1{font-size:21px;letter-spacing:-.6px;margin:0 0 14px}.search{width:100%;margin-bottom:10px}.filter-row{display:flex;gap:6px}.filter-row select{width:50%;font-size:12px}.filter-extra{margin-top:8px;font-size:12px}.filter-extra input{width:100%;margin:4px 0}.filter-extra label{display:block}.filter-extra summary{color:var(--muted)}.filter-submit{width:100%;margin-top:8px;background:#eaf2e9}.list-status{font-size:12px;color:var(--muted);margin:12px 0 0}.session-list{overflow:auto;flex:1;padding:10px}.session-link{display:block;text-decoration:none;color:var(--ink);border:1px solid transparent;border-radius:9px;padding:14px 12px;margin-bottom:5px;position:relative}.session-link:hover{background:#eef2ec}.session-link[aria-current=true]{background:#e5eee2;border-color:#c9dcc8;box-shadow:inset 3px 0 var(--green)}.session-title{font-weight:650;display:flex;justify-content:space-between;gap:8px;word-break:break-word}.session-meta{font-size:12px;color:var(--muted);margin-top:5px}.session-path{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:6px}.dot{flex-shrink:0;width:7px;height:7px;border-radius:50%;display:inline-block;margin:7px 2px;background:#819387}.dot.success{background:#438c5b}.dot.failed{background:#c66d58}.dot.unfinished{background:#d2a346}.list-more{margin:0 15px 15px}.detail{overflow:auto;min-width:0}.detail-inner{max-width:1120px;margin:auto;padding:30px 40px 70px}.eyebrow{font:600 11px/1.5 ui-monospace,monospace;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted)}.detail-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:7px 0 12px}.detail-heading h1{font-size:28px;letter-spacing:-1px;line-height:1.25;margin:0;overflow-wrap:anywhere}.actions{display:flex;gap:6px;flex-shrink:0}.actions button{font-size:12px;padding:7px 10px}.subheading{color:var(--muted);font-size:12px;overflow-wrap:anywhere}.badge{display:inline-block;border-radius:4px;padding:2px 7px;background:#e5eee2;color:#376847;font-size:11px;margin-right:8px}.badge.failed{background:#f9e8e1;color:#a54d3b}.badge.unfinished{background:#f8edcf;color:#806b26}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:25px 0;background:white;border:1px solid var(--line);border-radius:10px}.stat{padding:15px 18px;border-right:1px solid var(--line)}.stat:last-child{border:0}.stat-label{display:block;color:var(--muted);font-size:11px}.stat-value{display:block;font-size:21px;font-weight:600;letter-spacing:-.6px}.stat-note{color:var(--muted);font-size:10px}.tabs{display:flex;gap:24px;border-bottom:1px solid var(--line);margin-bottom:22px}.tab{border:0;border-radius:0;background:transparent;padding:10px 0;color:var(--muted);font-size:13px}.tab[aria-selected=true]{color:var(--green);border-bottom:2px solid var(--green);font-weight:650}.notice{font-size:12px;line-height:1.65;border:1px solid #e4ddc8;border-radius:8px;background:#faf6e9;color:#786634;padding:12px 15px;margin:14px 0}.muted{color:var(--muted)}.empty{padding:60px 25px;text-align:center;color:var(--muted)}.empty h2{color:var(--ink);font-weight:550}.turn{border:1px solid var(--line);border-radius:10px;background:var(--paper);margin:14px 0;overflow:hidden}.turn>summary{padding:16px 20px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:center}.turn>summary::-webkit-details-marker{display:none}.turn>summary:before{content:'›';color:var(--muted);font-size:22px}.turn[open]>summary:before{transform:rotate(90deg)}.turn-title{flex:1}.turn-title strong{font-size:14px}.turn-title small{display:block;font-size:11px;color:var(--muted);margin-top:3px}.turn-metrics{font:11px ui-monospace,monospace;color:var(--muted);text-align:right}.turn-body{border-top:1px solid var(--line);padding:22px 24px}.section-label{display:flex;align-items:center;gap:9px;font-size:11px;font-weight:650;letter-spacing:1px;text-transform:uppercase;margin:22px 0 10px;color:var(--muted)}.section-label:first-child{margin-top:0}.section-label .number{font:10px ui-monospace,monospace;border:1px solid var(--line);border-radius:4px;padding:1px 5px}.content-section{border:1px solid var(--line);border-left:3px solid #b9cbb5;border-radius:5px;margin:8px 0;overflow:hidden}.content-section.system,.content-section.developer{border-left-color:#bba4d6;background:#faf8fd}.content-section.assistant{border-left-color:#7bae8d}.content-section.tool{border-left-color:#c1a76e;background:#fdfbf6}.content-section>summary{padding:10px 13px;font-size:12px;cursor:pointer;color:#52615a}.content-section>summary span{float:right;font:10px ui-monospace,monospace;color:var(--muted)}.document{padding:8px 18px 18px;font-size:13px;line-height:1.8;overflow-wrap:anywhere}.document p{white-space:pre-wrap;margin:8px 0}.document h3{font-size:15px;margin:18px 0 8px;line-height:1.5;color:#344d40}.document pre,pre.raw{font:11px/1.7 ui-monospace,SFMono-Regular,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f4f0;border:1px solid var(--line);border-radius:5px;padding:13px;max-height:500px;overflow:auto}.missing{padding:12px 14px;border:1px dashed #d5ddd3;border-radius:6px;font-size:12px;color:var(--muted)}.context-history{margin:10px 0;font-size:12px;color:var(--muted)}.context-history>summary{padding:7px 0;cursor:pointer}.tool-list{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.tool-chip{font:11px ui-monospace,monospace;background:#f2f4ee;border-radius:5px;padding:4px 7px}.usage{display:flex;flex-wrap:wrap;gap:7px;font:10px ui-monospace,monospace;margin:16px 0;color:var(--muted)}.usage span{border:1px solid var(--line);border-radius:4px;padding:4px 7px}.raw-details{margin-top:18px;color:var(--muted);font-size:12px}.raw-details summary{cursor:pointer}.timeline-row{padding:13px 0;border-bottom:1px solid var(--line)}.timeline-name{display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace}.bar{height:5px;border-radius:3px;background:#8bb495;margin-top:9px;min-width:2px;max-width:100%}.warning-list{font-size:11px;color:#8f703c}.metadata{display:grid;grid-template-columns:130px 1fr;gap:12px;font-size:12px}.metadata dt{color:var(--muted)}.metadata dd{margin:0;overflow-wrap:anywhere}#status{position:fixed;bottom:14px;right:20px;background:#213b2d;color:white;border-radius:7px;max-width:500px;padding:10px 16px;font-size:12px;z-index:5}#status:empty{display:none}[hidden]{display:none!important}@media(max-width:1000px){.detail-inner{padding:25px 22px}.shell{grid-template-columns:270px minmax(0,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:0}.stat:nth-child(-n+2){border-bottom:1px solid var(--line)}}@media(max-width:680px){.shell{display:block;height:auto}.sidebar{max-height:42vh;border-bottom:1px solid var(--line)}.session-list{min-height:110px}.sidebar-head{padding:12px 16px}.sidebar h1{display:none}.detail{overflow:visible}.detail-inner{padding:24px 16px}.detail-heading{display:block}.actions{margin-top:13px}.topbar small{display:none}.turn-body{padding:17px 14px}.turn>summary{padding:13px}.topbar{height:52px}}
.session-list{padding:6px}.session-link{padding:8px 10px;margin-bottom:2px;border-radius:6px}.session-title{font-size:13px;align-items:center}.session-title>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.session-title .dot{margin:0 2px}.session-meta{display:flex;justify-content:space-between;gap:8px;font-size:11px;margin-top:2px}.session-meta>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.session-meta>span:last-child{flex-shrink:0;font-variant-numeric:tabular-nums}.sidebar-head{padding:14px 12px 10px}.sidebar h1{font-size:18px;margin-bottom:10px}.sidebar input,.sidebar select,.sidebar button{padding:6px 8px}.list-status{margin-top:8px}@media(min-width:681px){.shell{grid-template-columns:280px minmax(0,1fr)}}
.detail-inner{max-width:none;padding:0}.explorer-layout{display:grid;grid-template-columns:230px minmax(0,1fr);min-height:100%}.structure{padding:18px 10px;background:#fafbf9;border-right:1px solid var(--line);min-width:0}.structure h2{font-size:13px;margin:0 8px 12px}.structure details{margin:0 0 0 10px;border-left:1px solid var(--line);padding-left:5px}.structure summary{cursor:pointer;font-size:11px;color:var(--muted)}.tree-link{display:block;padding:6px 7px;border-radius:5px;text-decoration:none;font-size:12px;overflow-wrap:anywhere}.tree-link[aria-current=true]{background:#e5eee2;color:#204b32;font-weight:650}.tree-link small{display:block;color:var(--muted);font-size:10px}.reader{padding:24px 28px 60px;min-width:0;max-width:1200px;width:100%;margin:auto}.breadcrumbs{display:flex;flex-wrap:wrap;gap:7px;font-size:11px;margin-bottom:20px}.reader h1{font-size:25px;letter-spacing:-.7px;margin:6px 0}.reader .stats{margin:18px 0}.reader .stat{padding:10px 13px}.reader .stat-value{font-size:18px}.reader .document{padding:8px 16px}.reader .section-label{margin-top:18px}.activity-list{border:1px solid var(--line);background:white;border-radius:8px;overflow:hidden}.activity-row{display:grid;grid-template-columns:minmax(140px,1fr) minmax(130px,2fr) 65px;gap:12px;align-items:center;padding:9px 12px;border-bottom:1px solid var(--line);font-size:12px}.activity-row:last-child{border:0}.activity-row a{overflow-wrap:anywhere}.activity-track{position:relative;height:20px;background:repeating-linear-gradient(to right,#f2f5f1 0,#f2f5f1 calc(25% - 1px),#e1e7e2 calc(25% - 1px),#e1e7e2 25%);border-radius:3px}.activity-bar{position:absolute;top:5px;height:10px;border-radius:3px;background:#72a485;min-width:2px}.activity-bar.agent{background:#9b83cf}.activity-bar.tool{background:#c69a59}.activity-bar.request{background:#6c9fcb}.activity-bar.failed{background:#bd6556}.ruler{display:flex;justify-content:space-between;font:10px ui-monospace,monospace;color:var(--muted);margin:8px 0}.turn-link{display:block;padding:14px 16px;background:white;border:1px solid var(--line);border-radius:7px;margin:8px 0;text-decoration:none}.turn-link small{display:block;color:var(--muted);margin-top:4px}.reader .notice{margin:10px 0;font-size:11px}.back-link{display:inline-block;font-size:12px;margin-bottom:10px}.reader .turn{margin:8px 0}.reader .turn>summary{padding:10px 14px}.reader .turn-body{padding:15px}.reader .tabs{gap:18px}.reader .empty{padding:24px 10px}@media(max-width:1150px){.explorer-layout{grid-template-columns:190px minmax(0,1fr)}.reader{padding:20px 18px}.shell{grid-template-columns:240px minmax(0,1fr)}}@media(max-width:900px){.explorer-layout{display:block}.structure{border-right:0;border-bottom:1px solid var(--line);max-height:230px;overflow:auto}.activity-row{grid-template-columns:minmax(110px,1fr) minmax(70px,1fr) 50px;gap:6px}}@media(max-width:680px){.reader{padding:18px 14px}.activity-row{font-size:11px}.structure{max-height:180px}}
.reader{margin:0 auto;align-self:start}.reader .detail-heading{flex-wrap:wrap}.activity-track small{font-size:10px}.structure summary{padding:3px 0}
.worktree-group{margin-bottom:8px}.worktree-group>summary{cursor:pointer;padding:9px 5px;font-size:12px;font-weight:650;display:flex;align-items:center;gap:6px}.worktree-group>summary:before{content:'›';color:var(--muted)}.worktree-group[open]>summary:before{transform:rotate(90deg)}.worktree-group>summary::-webkit-details-marker{display:none}.worktree-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}.worktree-count{font-size:10px;color:var(--muted);background:var(--wash);border:1px solid var(--line);border-radius:4px;padding:0 5px}.worktree-path{font-size:10px;color:var(--muted);padding:0 8px 7px;overflow-wrap:anywhere}.worktree-sessions{margin-left:8px;border-left:1px solid var(--line);padding-left:4px}.session-profile{display:inline-block;font-size:10px;padding:1px 5px;border:1px solid var(--line);border-radius:4px;background:var(--accent);margin:4px 0 1px;max-width:100%;overflow-wrap:anywhere}
.explorer-layout.timeline-layout{display:block}.timeline-layout .reader{max-width:none}.trace-waterfall .activity-row{grid-template-columns:minmax(180px,25%) minmax(180px,1fr) 72px;min-height:52px;gap:16px}.trace-waterfall .activity-track{height:32px;background:repeating-linear-gradient(to right,var(--wash) 0,var(--wash) calc(25% - 1px),var(--line) calc(25% - 1px),var(--line) 25%)}.trace-waterfall .activity-bar{height:16px;top:8px;border-radius:4px}.trace-waterfall .activity-row small{display:block;font-size:10px}.timeline-axis{background:var(--wash);font-size:11px;font-weight:600;color:var(--muted)}.timeline-ticks{display:flex;justify-content:space-between;font:10px ui-monospace,monospace}.tabs{flex-wrap:wrap}@media(max-width:800px){.trace-waterfall{overflow-x:auto}.trace-waterfall .activity-row{min-width:550px}}
</style></head><body>
<header class="topbar"><div class="brand"><span class="logo" aria-hidden="true">▦</span>Agent Farm <span style="font-weight:400;color:#91ad9b">/</span> <span style="font-weight:400">Sessions</span></div><small>LOCAL TELEMETRY · READ ONLY</small></header>
<div class="shell"><aside class="sidebar" aria-label="Session navigation"><div class="sidebar-head"><h1>Sessions</h1><form id="filters"><input class="search" id="search" placeholder="Search loaded sessions…" aria-label="Search loaded sessions"><div class="filter-row"><select name="harness" aria-label="Harness"><option value="">All harnesses</option><option>claude</option><option>codex</option></select><select name="status" aria-label="Outcome"><option value="">All outcomes</option><option>success</option><option>failed</option><option>unfinished</option></select></div><details class="filter-extra"><summary>More filters</summary><input name="profile" placeholder="Exact profile" aria-label="Exact profile"><input name="project" placeholder="Project contains" aria-label="Project contains"><label>From (UTC)<input name="from" type="date"></label><label>Through (UTC)<input name="to" type="date"></label></details><button class="filter-submit">Apply filters</button></form><p id="list-status" class="list-status" role="status">Loading sessions…</p></div><nav id="sessions" class="session-list" aria-label="Recorded sessions"></nav><button id="more" class="list-more" hidden>Load more sessions</button></aside><main id="detail" class="detail"><div class="empty"><h2>Your sessions, one conversation at a time.</h2><p>Select a run to explore its context, output, and usage.</p></div></main></div><div id="status" role="status"></div><script src="app.js"></script></body></html>`;

/** Preserve newest-first input order, grouping by full path rather than basename. */
export function groupSessionsByWorktree<T extends {worktree?:unknown;project?:unknown}>(sessions:T[]){
  const groups=new Map<string,{path:string;label:string;sessions:T[]}>();
  for(const session of sessions){const path=typeof session.worktree==='string'&&session.worktree?session.worktree:typeof session.project==='string'?session.project:'';let group=groups.get(path);if(!group){group={path,label:path?path.replace(/\\/g,'/').split('/').filter(Boolean).pop()??path:'Unknown worktree',sessions:[]};groups.set(path,group);}group.sessions.push(session);}
  return [...groups.values()];
}

// Serialized after TypeScript compilation; helper is explicitly injected by the server.
export function telemetryBrowser(groupWorktrees=groupSessionsByWorktree){
  type Data=Record<string,any>;
  const $=(id:string)=>document.getElementById(id)!;
  let sessions:Data[]=[],selected='',cursor:string|null=null,filters:Data={},loading=false,generation=0,tab='timeline';
  let explorerData:Data|undefined;
  const positions=new Map<string,number>();
  const worktreeExpanded=new Map<string,boolean>();
  const number=(value:any)=>typeof value==='number'?value.toLocaleString(undefined,{maximumFractionDigits:0}):'—';
  const money=(value:any)=>typeof value==='number'?'$'+value.toFixed(value<.01?5:4):'Not reported';
  const duration=(value:any)=>typeof value==='number'?(value>=60000?Math.floor(value/60000)+'m '+Math.floor(value%60000/1000)+'s':value>=1000?(value/1000).toFixed(2)+'s':value.toFixed(0)+'ms'):'—';
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
    const matching=sessions.filter(s=>[s.profile,s.model,s.worktree,s.project,s.id].some(v=>String(v??'').toLowerCase().includes(search)));
    for(const group of groupWorktrees(matching)){
      const box=el('details','',list,'worktree-group') as HTMLDetailsElement;box.open=search.length>0||(worktreeExpanded.get(group.path)??true);
      const summary=el('summary','',box);summary.title=group.path||'No worktree was recorded';el('span',group.label,summary,'worktree-name');el('small',String(group.sessions.length),summary,'worktree-count');
      el('div',group.path||'No path recorded',box,'worktree-path');
      box.ontoggle=()=>{if(box.isConnected&&!search)worktreeExpanded.set(group.path,box.open);};
      const items=el('div','',box,'worktree-sessions');
      for(const s of group.sessions){
      const link=el('a','',items,'session-link') as HTMLAnchorElement;link.href='#session='+encodeURIComponent(s.id);link.setAttribute('aria-current',String(s.id===selected));
      const title=el('div','',link,'session-title');el('span',date(s.started_at)+' · '+String(s.id).slice(0,6),title);const dot=el('span','',title,'dot '+s.status);dot.title=s.status;
      el('span','Profile: '+(s.profile??'Not recorded'),link,'session-profile');
      const metadata=(s.harness??'agent')+' · '+(s.model??'unknown model');
      const meta=el('div','',link,'session-meta');el('span',metadata,meta);el('span',duration(s.duration_ms),meta);
      const started=date(s.started_at);if(s.child_sessions)el('div','+'+s.child_sessions+' linked agent sessions',link,'session-meta');
      link.title=[s.profile??'Unnamed session',s.status,metadata,started,s.worktree??s.project??''].join(' · ');
      link.setAttribute('aria-label',link.title);
      }
    }
    if(!list.children.length)el('p','No matching sessions.',list,'empty');list.scrollTop=scroll;
  }
  async function loadSessions(append=false,quiet=false){
    if(loading)return;loading=true;
    try{
      const data=await query('runs',{...filters,limit:50,...(append&&cursor?{cursor}:{})}),before=JSON.stringify(sessions);
      if(append){const ids=new Set(sessions.map(s=>s.id));sessions.push(...data.items.filter((s:Data)=>!ids.has(s.id)));}else sessions=data.items;
      cursor=data.next_cursor;($('more') as HTMLButtonElement).hidden=!cursor;
      $('list-status').textContent=data.total_matching+' profile session'+(data.total_matching===1?'':'s')+(data.partial?' · partial scan':'')+(data.warnings.length?' · '+data.warnings.join(' '):'');if(!quiet||before!==JSON.stringify(sessions))renderList();
      if(!selectedHash()&&new URLSearchParams(location.hash.slice(1)).get('view')!=='profiles'&&sessions[0]){history.replaceState(null,'','#session='+sessions[0].id);await loadDetail(sessions[0].id);}
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
  async function renderRaw(root:HTMLElement,token:number){
    for(const [name,title] of [['query_spans','Spans'],['query_events','Events']]){
      el('h3',title!,root);const list=el('div','',root);let next:string|undefined;
      const more=button('Load '+title,root,async()=>{more.disabled=true;try{
        const selectedTab=tab,data=await query(name!,{session_id:explorerData?.node.session_id??selected,limit:50,...(next?{cursor:next}:{})});if(token!==generation||tab!==selectedTab)return;
        const max=Math.max(1,...data.items.map((row:Data)=>row.duration_ms??0));
        for(const row of data.items){const item=el('div','',list,'timeline-row'),heading=el('div','',item,'timeline-name');el('span',row.name??row.attributes?.['event.name']??row.body?.stringValue??'Event',heading);el('span',duration(row.duration_ms),heading);if(row.duration_ms!==undefined)el('div','',item,'bar').style.width=(100*row.duration_ms/max)+'%';const raw=el('details','',item,'raw-details');el('summary','Raw attributes',raw);el('pre',JSON.stringify(row,null,2),raw,'raw');}
        if(data.warnings.length)el('p',data.warnings.join(' '),list,'notice');next=data.next_cursor??undefined;more.hidden=!next;more.textContent='Load more';
      }catch(e){error(e);}finally{more.disabled=false;}});more.click();
    }
  }
  function activityLink(n:Data,parent:HTMLElement,title=n.name,cls='tree-link'){
    const link=el('a',title,parent,cls) as HTMLAnchorElement;
    link.href='#'+new URLSearchParams({session:selected,node:n.id}).toString();link.setAttribute('aria-current',String(explorerData?.node.id===n.id));link.onclick=()=>{if(['agent','tool','request'].includes(n.kind))tab='conversation';else if(n.kind==='session')tab='timeline';};return link;
  }
  function ancestry(data:Data){const list:Data[]=[],seen=new Set<string>();let n=data.node;while(n&&!seen.has(n.id)){seen.add(n.id);list.unshift(n);n=data.nodes.find((p:Data)=>p.id===n.parent_id);}return list;}
  function activityRows(parent:HTMLElement,data:Data,all=false){
    const n=data.node,children=new Map<string,Data[]>();for(const row of data.nodes){const p=row.parent_id??'';children.set(p,[...(children.get(p)??[]),row]);}
    const rows:{node:Data;depth:number}[]=[],seen=new Set<string>();
    const walk=(id:string,depth:number)=>{if(depth>32||seen.has(id)||rows.length>=500)return;seen.add(id);for(const row of children.get(id)??[]){if(rows.length>=500)break;rows.push({node:row,depth});if(all)walk(row.id,depth+1);}};walk(n.id,0);
    if(!rows.length){el('div','No nested activity recorded for this selection.',parent,'missing');return;}
    const start=Date.parse(n.started_at),total=n.duration_ms;
    if(Number.isFinite(start)&&typeof total==='number'){const ruler=el('div','',parent,'ruler');el('span',date(n.started_at),ruler);el('span',duration(total)+' elapsed · overlapping work is not added',ruler);}
    const list=el('div','',parent,'activity-list'+(tab==='timeline'?' trace-waterfall':''));
    if(tab==='timeline'){
      const head=el('div','',list,'activity-row timeline-axis');el('span','Agent / activity',head);const ticks=el('div','',head,'timeline-ticks');for(let i=0;i<=4;i++)el('span',typeof total==='number'?duration(total*i/4):'—',ticks);el('span','Duration',head);
    }
    for(const {node:row,depth} of rows){const item=el('div','',list,'activity-row'),name=el('div','',item);name.style.paddingLeft=Math.min(depth,8)*12+'px';activityLink(row,name,row.name,'');el('small',' · '+row.kind+' · '+row.status,name,'muted');const track=el('div','',item,'activity-track');
      const offset=Date.parse(row.started_at)-start;
      if(Number.isFinite(offset)&&typeof total==='number'&&total>0&&typeof row.duration_ms==='number'){
        const bar=activityLink(row,track,'','activity-bar '+row.kind+(row.status==='failed'?' failed':''));bar.setAttribute('aria-label',row.name+' · '+duration(row.duration_ms));bar.title=row.name+' · '+date(row.started_at)+' · '+duration(row.duration_ms);const left=Math.max(0,Math.min(100,100*offset/total));bar.style.left=left+'%';bar.style.width=Math.max(0,Math.min(100-left,100*row.duration_ms/total))+'%';
      }else el('small','Timing unavailable',track,'muted');el('span',duration(row.duration_ms),item,'muted');
    }
    if(rows.length>=500)el('p','Showing up to 500 activities. Drill into a branch to narrow the view.',parent,'notice');
  }
  function renderDetail(token:number){
    if(!explorerData)return;const data=explorerData,n=data.node,s=data.session??{},root=$('detail');root.replaceChildren();
    const layout=el('div','',root,'explorer-layout'+(['timeline','events'].includes(tab)?' timeline-layout':'')),tree=el('nav','',layout,'structure');tree.hidden=['timeline','events'].includes(tab);tree.setAttribute('aria-label','Session structure');el('h2','Session structure',tree);
    const ancestors=ancestry(data),expanded=new Set(ancestors.map(a=>a.id)),children=new Map<string,Data[]>();for(const row of data.nodes){const key=row.parent_id??'';children.set(key,[...(children.get(key)??[]),row]);}
    let count=0;const draw=(row:Data,parent:HTMLElement,depth=0)=>{if(depth>32||count++>=500)return;const link=activityLink(row,parent);el('small',row.kind+' · '+duration(row.duration_ms),link);const nested=children.get(row.id)??[];if(nested.length){const box=el('details','',parent) as HTMLDetailsElement;box.open=expanded.has(row.id);el('summary',nested.length+' activities',box);for(const child of nested)draw(child,box,depth+1);}};
    for(const row of data.nodes.filter((r:Data)=>!r.parent_id))draw(row,tree);if(count>=500)el('small','Tree limited to 500 activities.',tree);
    const inner=el('article','',layout,'reader'),crumbs=el('nav','',inner,'breadcrumbs');crumbs.setAttribute('aria-label','Activity breadcrumbs');for(const [i,a] of ancestors.entries()){if(i)el('span','›',crumbs);activityLink(a,crumbs,a.name,'');}
    if(ancestors.length>1)activityLink(ancestors[ancestors.length-2]!,inner,'← Back to '+ancestors[ancestors.length-2]!.name,'back-link');
    const heading=el('div','',inner,'detail-heading');const titles=el('div','',heading);el('div',n.kind==='session'?'PROFILE SESSION':n.kind.toUpperCase(),titles,'eyebrow');el('h1',n.name,titles);const actions=el('div','',heading,'actions');const index=sessions.findIndex(row=>row.id===selected);button('← Previous run',actions,()=>choose(sessions[index-1]!.id)).disabled=index<=0;button('Next run →',actions,()=>choose(sessions[index+1]!.id)).disabled=index<0||index>=sessions.length-1;button('Refresh',actions,()=>loadDetail(selected));
    const sub=el('div','',inner,'subheading');el('span',n.status,sub,'badge '+n.status);el('span',(s.harness??'Agent')+' · '+(s.user??'Unknown user')+' · '+date(n.started_at),sub);el('div',s.worktree??'',inner,'subheading');
    const stats=el('div','',inner,'stats');for(const [title,value,note] of [['Elapsed',duration(n.duration_ms),'Wall time, not summed agent time'],['Model requests',number(n.requests),'Including linked descendants'],['Output tokens',number(n.output_tokens),'Input: '+number(n.input_tokens)],['Reported cost',money(n.cost_usd),n.cost_coverage+'/'+n.requests+' requests report cost']]){const stat=el('div','',stats,'stat');el('span',title!,stat,'stat-label');el('span',value!,stat,'stat-value');el('small',note!,stat,'stat-note');}
    if(data.partial||data.warnings.length)el('p',[data.partial?'Partial telemetry.':'',...data.warnings].join(' '),inner,'notice');
    const tabs=el('div','',inner,'tabs');for(const [id,title] of [['timeline','Timeline'],['conversation','Turn reader'],['events','Timeline & events'],['metadata','Details & raw data']]){const b=button(title!,tabs,()=>{tab=id!;renderDetail(token);});b.className='tab';b.setAttribute('aria-pressed',String(tab===id));if(tab===id)b.setAttribute('aria-selected','true');}
    const panel=el('div','',inner);
    if(tab==='timeline'){el('p','Recorded parent/child relationships on a shared time axis. Gaps are not classified as idle.',panel,'muted');activityRows(panel,data,true);return;}
    if(tab==='events'){el('p','Native spans and events. Bars compare recorded durations within each loaded page; they do not indicate start offsets.',panel,'muted');void renderRaw(panel,token);return;}
    if(tab==='metadata'){const meta=el('dl','',panel,'metadata');for(const [key,value] of Object.entries({...s,...n})){el('dt',key.replaceAll('_',' '),meta);el('dd',String(value??'Not recorded'),meta);}const attributes=el('details','',panel,'raw-details');el('summary','Selected activity attributes',attributes);el('pre',JSON.stringify(data.attributes,null,2),attributes,'raw');if(n.kind==='session'&&n.session_id!==selected){const link=el('a','Open child session independently',panel) as HTMLAnchorElement;link.href='#session='+encodeURIComponent(n.session_id);}button('Open session raw events',panel,()=>{const raw=el('div','',panel);void renderRaw(raw,token);});return;}
    if(n.kind==='session'){
      el('p','Each turn spans a user message to the agent response. Expand an agent to inspect its nested work.',panel,'muted');const turns=data.nodes.filter((r:Data)=>r.kind==='turn'&&r.parent_id===n.id);for(const turn of turns){const link=activityLink(turn,panel,turn.name,'turn-link');el('small',duration(turn.duration_ms)+' · '+turn.requests+' requests · '+money(turn.cost_usd),link);}
      if(!turns.length)el('p','No complete turn boundaries were exported. Available activity is shown without guessing turn ownership.',panel,'notice');activityRows(panel,data,false);
    }else{
      if(n.kind==='turn')el('p','A turn runs from your message to the final response.',panel,'muted');
      if(n.kind==='unlinked')el('p','These records lack an exact parent relationship. Their timing does not establish ownership.',panel,'notice');
      label('01',n.kind==='agent'?'Agent input':'User message',panel);if(data.prompt)documentText(data.prompt,panel);else el('div','Message not captured for this activity.',panel,'missing');
      label('02','What happened',panel);activityRows(panel,data,true);
      if(n.kind==='turn'){label('03','Final response',panel);if(data.final_output.length)for(const output of data.final_output)section(output,panel,true);else el('div','A final response was not explicitly captured. Inspect individual requests below.',panel,'missing');}
    }
    const requestBox=el('details','',panel,'raw-details') as HTMLDetailsElement;requestBox.open=['request','agent','tool'].includes(n.kind);el('summary','Instructions, context & model requests · '+data.total_requests,requestBox);const list=el('div','',requestBox);data.requests.forEach((r:Data,i:number)=>renderTurn(r,i,list,data.requests.length===1));let next=data.next_cursor;
    const more=button('Load more requests',requestBox,async()=>{more.disabled=true;try{const page=await query('explorer',{session_id:selected,node_id:n.id,cursor:next,limit:5});if(token!==generation||tab!=='conversation')return;page.requests.forEach((r:Data,i:number)=>renderTurn(r,Number(next)+i,list,false));next=page.next_cursor;more.hidden=!next;}catch(e){error(e);}finally{more.disabled=false;}});more.hidden=!next;
    if(!data.total_requests)el('p','No correlated model content. Content capture is opt-in; missing text does not imply no work occurred.',requestBox,'missing');
  }
  async function loadDetail(id:string){
    if(explorerData)positions.set(explorerData.node.id,$('detail').scrollTop);
    selected=id;const token=++generation;renderList();notify('Loading session…');
    try{const node=new URLSearchParams(location.hash.slice(1)).get('node');const data=await query('explorer',{session_id:id,...(node?{node_id:node}:{})});
      if(token!==generation)return;explorerData=data;renderDetail(token);$('detail').scrollTop=positions.get(data.node.id)??0;notify('');
    }catch(e){if(token===generation){$('detail').replaceChildren();el('div','This session could not be loaded. Choose another session or refresh.', $('detail'),'empty');error(e);}}
  }
  $('filters').onsubmit=e=>{e.preventDefault();filters=Object.fromEntries([...new FormData(e.currentTarget as HTMLFormElement)].filter(([,value])=>value));if(filters.to)filters.to+='T23:59:59.999Z';void loadSessions();};
  $('search').oninput=renderList;$('more').onclick=()=>loadSessions(true);
  window.addEventListener('hashchange',()=>{const id=selectedHash();if(id)void loadDetail(id);});
  void loadSessions();if(selectedHash())void loadDetail(selectedHash());
  setInterval(()=>{if(!document.hidden&&sessions.length<=50)void loadSessions(false,true);},5000);
}
