import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groupSessionsByWorktree} from '../dist/telemetry-ui-page.js';

test('sidebar groups full worktree paths without merging matching basenames',()=>{
 const rows=[{id:'newest',worktree:'/repo-a/main',profile:'builder'},{id:'other',worktree:'/repo-b/main',profile:'reviewer'},{id:'older',worktree:'/repo-a/main',profile:'researcher'}];
 const groups=groupSessionsByWorktree(rows);assert.deepEqual(groups.map(g=>g.path),['/repo-a/main','/repo-b/main']);assert.deepEqual(groups.map(g=>g.label),['main','main']);assert.deepEqual(groups[0].sessions.map(s=>s.id),['newest','older']);assert.equal(groups[0].sessions[0].profile,'builder');assert.equal(rows.length,3);
});
test('sidebar handles project fallbacks, missing worktrees, and Windows display paths',()=>{
 const groups=groupSessionsByWorktree([{project:'/project'},{worktree:'',project:'/project'},{},{worktree:'C:\\worktrees\\feature'}]);assert.equal(groups.length,3);assert.equal(groups[0].sessions.length,2);assert.equal(groups[1].label,'Unknown worktree');assert.equal(groups[2].label,'feature');assert.deepEqual(groupSessionsByWorktree([]),[]);
});

test('agent timeline skips structural and request rows and assigns tools to the nearest agent',async()=>{
 const {agentTimelineRows}=await import('../dist/telemetry-ui-page.js');
 const nodes=[
  {id:'root',kind:'session',duration_ms:1000},
  {id:'turn',parent_id:'root',kind:'turn'},
  {id:'read',parent_id:'turn',kind:'tool'},
  {id:'research',parent_id:'turn',kind:'agent',duration_ms:300},
  {id:'request',parent_id:'research',kind:'request'},
  {id:'search',parent_id:'request',kind:'tool'},
  {id:'nested',parent_id:'research',kind:'agent'},
  {id:'test',parent_id:'nested',kind:'tool'},
  {id:'unlinked',parent_id:'root',kind:'unlinked'},
  {id:'orphan-tool',parent_id:'unlinked',kind:'tool'},
  {id:'orphan-agent',parent_id:'unlinked',kind:'agent'},
  {id:'child',parent_id:'nested',kind:'session'},
 ];
 const rows=agentTimelineRows(nodes,'root');
 assert.deepEqual(rows.map(r=>r.node.id),['root','research','nested','child','orphan-agent']);
 assert.deepEqual(rows.map(r=>r.tools.map(t=>t.id)),[['read'],['search'],['test'],[],[]]);
 assert.deepEqual(rows.map(r=>r.depth),[0,1,2,3,1]);
 assert.equal(rows.at(-1).unlinked,true);
 assert.equal(rows[1].node.duration_ms,300);
 assert.deepEqual(agentTimelineRows(nodes,'nested').map(r=>r.node.id),['nested','child']);
 assert.deepEqual(agentTimelineRows(nodes,'missing'),[]);
});
