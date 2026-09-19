import {resolveWorkspace,type WorkspaceOptions} from './workspaces.js';
import {resolveTelemetry} from './runtime.js';
import fs from 'node:fs';
import path from 'node:path';
import {namespaces} from './config.js';
import {resolveProfile} from './compiler.js';

export function inspectProfile(root:string,profile:string,options:WorkspaceOptions={}){
 root=fs.realpathSync(root);const workspace=resolveWorkspace(root,options),resolved=resolveProfile(root,profile,workspace);
 return {profile:resolved.profile,plugin:resolved.plugin,plugin_version:resolved.plugin_version,trace_identity:`${resolved.plugin??'local'}/${resolved.profile_name}@${resolved.plugin_version??'local'}`,profile_file:resolved.profile_file,
  workspace_source:workspace.metadata,telemetry:resolveTelemetry(root,workspace.telemetry,process.env,options.home),cross_plugin_dependencies:resolved.cross_plugin_dependencies,
  agents:Object.fromEntries(Object.entries(resolved.nodes).map(([route,agent])=>[route,{agent:agent.name,qualified_agent:agent.qualified_name,plugin:agent.plugin,plugin_version:agent.plugin_version,source_file:agent.source_file,harness:agent.harness,
    model:{name:agent.model,reasoning:agent.reasoning_effort,speed:agent.speed??'native default',sources:agent.launch?.model.sources},arguments:agent.launch?.arguments??{},argument_definitions:agent.argument_definitions??{},preset:agent.launch?.preset,override:agent.launch?.override,instructions:agent.instructions,mode:route==='main'?'entry point':agent.mode,description:agent.description,
    skills:agent.skills.map(name=>({name,plugin:agent.skill_plugins?.[name]?.plugin,plugin_version:agent.skill_plugins?.[name]?.version,source_file:path.join(agent.skill_sources![name]!,'SKILL.md')})),connections:agent.connections,subagents:agent.children}]))};
}

export function listProfiles(root:string){
 root=fs.realpathSync(root);const entries=namespaces(root).flatMap(context=>{const directory=path.join(context.root,'profiles');if(!fs.existsSync(directory))return [];return fs.readdirSync(directory).filter(file=>file.endsWith('.yaml')).sort().map(file=>({context,profile:file.slice(0,-5)}));}),counts=new Map<string,number>();
 for(const entry of entries)counts.set(entry.profile,(counts.get(entry.profile)??0)+1);
 return entries.map(({context,profile})=>{const qualified=context.plugin?`${context.plugin}/${profile}`:profile,resolved=resolveProfile(root,profile,undefined,{namespace:context}),agent=resolved.nodes.main!;return {profile,qualified,plugin:context.plugin,plugin_version:context.version,ambiguous:(counts.get(profile)??0)>1,agent:agent.name,harness:agent.harness,model:{name:agent.model,reasoning:agent.reasoning_effort,speed:agent.speed??'native default'},source_file:resolved.profile_file};});
}
