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
