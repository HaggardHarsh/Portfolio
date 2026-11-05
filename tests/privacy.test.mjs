import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {profile} from '../src/content.js';
import {renderPanel} from '../src/panels.js';

test('public content omits personal contact and profile fields',()=>{
 assert.equal(profile.name,'The Woodland Cabin');
 assert.equal(profile.email,'');assert.equal(profile.resume,'');assert.deepEqual(profile.links,[]);
 for(const project of profile.projects)assert.equal(project.url,undefined);
 for(const id of ['reading','about','projects','skills','contact']){
  const html=renderPanel(id);
  assert.ok(!/mailto:|linkedin\.com\/in\/|github\.com\//i.test(html));
  assert.ok(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(html));
 }
 assert.match(renderPanel('contact'),/No contact details are listed yet/);
});
test('fallback and public setup docs do not restore contact links or verification values',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(!/mailto:|linkedin\.com\/in\/|github\.com\//i.test(html));
 const setup=await readFile(new URL('../DNS-SETUP.md',import.meta.url),'utf8');
 assert.ok(!/openai-site-verification=|appgdom_|_cf-custom-hostname.*[0-9a-f]{8}-/i.test(setup));
 await assert.rejects(stat(new URL('../public/assets/since-last-time.png',import.meta.url)),{code:'ENOENT'});
});
