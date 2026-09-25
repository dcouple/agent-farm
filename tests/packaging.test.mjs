import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';

const root=fileURLToPath(new URL('../',import.meta.url));

test('npm package contains every checksummed bundled plugin file',()=>{
 const manifest=parse(fs.readFileSync(new URL('../plugins/dcouple/plugin.yaml',import.meta.url),'utf8'));
 const checksums=Object.keys(manifest.checksums);
 assert.ok(checksums.length>0,'Bundled plugin must declare checksums');
 // --ignore-scripts: prepack/prepare would rebuild dist/ while parallel test files import it.
 const [pack]=JSON.parse(execFileSync('npm',['pack','--dry-run','--json','--ignore-scripts'],{cwd:root,encoding:'utf8'}));
 const files=new Set(pack.files.map(file=>file.path));
 const missing=checksums.map(relative=>`plugins/dcouple/${relative}`).filter(file=>!files.has(file));
 assert.deepEqual(missing,[],`Checksummed plugin files omitted from npm package: ${missing.join(', ')}`);
});
