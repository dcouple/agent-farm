import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {TelemetryStore,type QueryOptions} from './telemetry-query.js';

const page=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Agent Farm traces</title>
<style>body{font:15px system-ui;background:#101820;color:#e3eee5;max-width:1100px;margin:40px auto;padding:0 20px}h1{color:#9fe3ab}input,select,button{font:inherit;padding:8px;margin:4px;background:#24342c;color:inherit;border:1px solid #56735e;border-radius:5px}button{cursor:pointer}article{border-top:1px solid #56735e;padding:12px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#192820;padding:16px}small{color:#bbc9c0}.bar{height:6px;background:#9fe3ab;max-width:100%}</style>
<h1>Agent Farm traces</h1><small>Local, read-only telemetry · refreshes every 5 seconds. “Unfinished” does not imply still running.</small>
<form id="filters"><input name="profile" aria-label="Exact profile" placeholder="Exact profile"><input name="project" aria-label="Project contains" placeholder="Project contains"><select name="harness" aria-label="Harness"><option value="">All harnesses</option><option>claude</option><option>codex</option></select><select name="status" aria-label="Outcome"><option value="">All outcomes</option><option>success</option><option>failed</option><option>unfinished</option></select><label>From <input name="from" type="date"></label><label>To <input name="to" type="date"></label><button>Filter</button></form>
<p id="notice" role="status"></p><section id="sessions"></section><button id="more" hidden>More sessions</button><section id="details"><h2>Select a session</h2></section>
<script src="app.js"></script></html>`;
const script=`const $=id=>document.getElementById(id);let cursor=null,selected=null,filters={},busy=false,refresh=true;
async function query(tool,args){const r=await fetch('api/'+tool+'?args='+encodeURIComponent(JSON.stringify(args)));const value=await r.json();if(!r.ok)throw Error(value.error);return value;}
function element(tag,text,parent){const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;}
async function sessions(append=false){if(busy)return;busy=true;try{const data=await query('list_sessions',{...filters,...(append&&cursor?{cursor}:{})});if(!append)$('sessions').replaceChildren();for(const s of data.items){const row=element('article','',$('sessions'));const b=element('button',s.profile+' · '+s.harness+' · '+s.status,row);b.onclick=()=>detail(s.id);element('small',s.started_at+' · '+s.worktree,row);}cursor=data.next_cursor;$('more').hidden=!cursor;$('notice').textContent=data.total_matching+' matching sessions. '+data.warnings.join(' ');}catch(e){$('notice').textContent=e.message;}finally{busy=false;}}
async function detail(id){selected=id;try{const data=await query('get_session',{session_id:id});if(selected!==id)return;const root=$('details');root.replaceChildren();element('h2','Session '+id,root);element('pre',JSON.stringify(data,null,2),root);for(const [tool,label] of [['query_spans','Spans'],['query_events','Events']]){const section=element('section','',root);element('h3',label,section);const rows=element('div','',section);const more=element('button','Load '+label.toLowerCase(),section);let next;more.onclick=async()=>{more.disabled=true;try{const result=await query(tool,{session_id:id,...(next?{cursor:next}:{})});const max=Math.max(1,...result.items.map(x=>x.duration_ms||0));for(const row of result.items){const item=element('article','',rows);if(row.duration_ms!==undefined){const bar=element('div','',item);bar.className='bar';bar.style.width=(100*row.duration_ms/max)+'%';}element('pre',JSON.stringify(row,null,2),item);}next=result.next_cursor;more.hidden=!next;more.textContent='Load more';element('small',result.warnings.join(' '),rows);}catch(e){element('p',e.message,rows);}finally{more.disabled=false;}};more.click();}}catch(e){$('notice').textContent=e.message;}}
$('filters').onsubmit=e=>{e.preventDefault();filters=Object.fromEntries([...new FormData(e.target)].filter(([,v])=>v));if(filters.to)filters.to+='T23:59:59.999Z';refresh=true;sessions();};$('more').onclick=()=>{refresh=false;sessions(true);};sessions();setInterval(()=>{if(!document.hidden&&refresh)sessions();},5000);`;

export async function startTelemetryUI(options:QueryOptions,port=0){
  const store=new TelemetryStore(options),token=randomBytes(24).toString('hex');let origin='';
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'");
    const send=(status:number,value:unknown)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
    if(req.headers.host!==new URL(origin).host||(req.headers.origin&&req.headers.origin!==origin)){send(403,{error:'Forbidden origin'});return;}
    if(req.method!=='GET'){send(405,{error:'Read only'});return;}
    if((req.url?.length??0)>8192){send(414,{error:'URL too long'});return;}
    let url:URL;try{url=new URL(req.url??'/',origin);}catch{send(400,{error:'Invalid URL'});return;}
    const prefix='/'+token+'/';
    if(!url.pathname.startsWith(prefix)){send(404,{error:'Not found'});return;}
    const route=url.pathname.slice(prefix.length);
    if(route===''||route==='app.js'){res.writeHead(200,{'Content-Type':route?'text/javascript; charset=utf-8':'text/html; charset=utf-8'});res.end(route?script:page);return;}
    if(!route.startsWith('api/')){send(404,{error:'Not found'});return;}
    try{send(200,await store.query(route.slice(4),JSON.parse(url.searchParams.get('args')??'{}')));}catch(e){send(400,{error:(e as Error).message});}
  });
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{const address=server.address();if(!address||typeof address==='string')return reject(new Error('No listener'));origin='http://127.0.0.1:'+address.port;resolve();});});
  return {server,url:origin+'/'+token+'/'};
}
