import path from 'node:path';
import os from 'node:os';
import {parseArgs} from 'node:util';
import {spawn} from 'node:child_process';
import {resolveWorkspace} from './workspaces.js';
import {assertWorkspaceTrust,resolveTelemetry} from './runtime.js';
import {serveTelemetryMcp} from './telemetry-mcp.js';
import {startTelemetryUI} from './telemetry-ui.js';
import type {QueryOptions} from './telemetry-query.js';

export async function telemetryCommand(args:string[]){
  const ui=args[0]==='traces'||args[0]==='ui';
  if(!ui&&args[1]!=='mcp')throw new Error('Use agent-farm telemetry mcp');
  const {values,positionals}=parseArgs({args:args.slice(ui?1:2),options:{directory:{type:'string'},project:{type:'string'},scope:{type:'string',default:'project'},'config-root':{type:'string',default:path.join(os.homedir(),'.config/agent-farm')},'no-open':{type:'boolean'},port:{type:'string',default:'0'}}});
  if(positionals.length)throw new Error('Unexpected arguments');
  if(values.scope!=='project'&&values.scope!=='machine')throw new Error('scope must be project or machine');
  const projectDirectory=path.resolve(values.project??process.cwd()),root=path.resolve(values['config-root']!);
  const workspace=values.directory?undefined:resolveWorkspace(root,{directory:projectDirectory});
  if(workspace)assertWorkspaceTrust(workspace.metadata);
  const settings=resolveTelemetry(root,workspace?.telemetry);
  const options:QueryOptions={directory:path.resolve(values.directory??settings.directory),projectDirectory,scope:values.scope,currentSession:process.env.AGENT_FARM_SESSION_ID||undefined};
  if(!ui){await serveTelemetryMcp(options);return;}
  const port=Number(values.port);if(!/^\d+$/.test(values.port!)||!Number.isInteger(port)||port<0||port>65535)throw new Error('Invalid port');
  const {url,server}=await startTelemetryUI(options,port,{configRoot:root,projectDirectory});console.log('Agent Farm UI: '+url+'\nPress Ctrl-C to stop.');
  process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());
  if(!values['no-open']){const child=spawn(process.platform==='darwin'?'open':process.platform==='win32'?'explorer.exe':'xdg-open',[url],{stdio:'ignore'});child.on('error',()=>console.error('Open the URL above in your browser.'));child.unref();}
}
