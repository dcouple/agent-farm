import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {TelemetryStore,type QueryOptions} from './telemetry-query.js';
import {telemetryPage,telemetryBrowser} from './telemetry-ui-page.js';

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
    if(route===''||route==='app.js'){res.writeHead(200,{'Content-Type':route?'text/javascript; charset=utf-8':'text/html; charset=utf-8'});res.end(route?'('+telemetryBrowser.toString()+')();':telemetryPage);return;}
    if(!route.startsWith('api/')){send(404,{error:'Not found'});return;}
    try{const args=JSON.parse(url.searchParams.get('args')??'{}');send(200,route==='api/explorer'?await store.explorer(args):route==='api/runs'?await store.runs(args):route==='api/conversation'?await store.conversation(args):await store.query(route.slice(4),args));}catch(e){send(400,{error:(e as Error).message});}
  });
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{const address=server.address();if(!address||typeof address==='string')return reject(new Error('No listener'));origin='http://127.0.0.1:'+address.port;resolve();});});
  return {server,url:origin+'/'+token+'/'};
}
