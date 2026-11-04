import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {documentPolicy,headersFile,normalizeSiteUrl,securityHeaders} from '../config/launch.mjs';

test('canonical origin rejects credentials, insecure URLs and injected paths',()=>{
 assert.equal(normalizeSiteUrl(),'https://portfolio.example');
 for(const value of ['http://portfolio.example','https://user:password@portfolio.example','https://portfolio.example/path','https://portfolio.example/?x=1','https://portfolio.example/#x'])assert.throws(()=>normalizeSiteUrl(value));
});
test('policy blocks injected scripts but permits the embedded texture loader',()=>{
 const directives=new Map(documentPolicy.split('; ').map(line=>{const [name,...values]=line.split(' ');return [name,values];}));
 assert.deepEqual(directives.get('script-src'),["'self'"]);
 assert.deepEqual(directives.get('script-src-attr'),["'none'"]);
 assert.deepEqual(directives.get('connect-src'),["'self'",'blob:']);
 assert.ok(!documentPolicy.includes("'unsafe-eval'"));
 assert.ok(!directives.get('script-src').includes("'unsafe-inline'"));
 assert.deepEqual(directives.get('object-src'),["'none'"]);
 assert.deepEqual(directives.get('base-uri'),["'none'"]);
});
test('deployment configurations use the same security headers',async()=>{
 const vercel=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 const actual=Object.fromEntries(vercel.headers[0].headers.map(h=>[h.key,h.value]));
 assert.deepEqual(actual,securityHeaders);
 const rules=headersFile();
 for(const [name,value]of Object.entries(securityHeaders))assert.ok(rules.includes(`${name}: ${value}`));
 assert.ok(!rules.includes('/assets/*\n  Cache-Control'),'unversioned images must not receive an immutable cache rule');
});
test('entry HTML has no inline executable code or inline event handlers',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(!/\son[a-z]+\s*=/i.test(html));
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){assert.match(match[1],/\bsrc=/);assert.equal(match[2].trim(),'');}
 assert.match(html,/id="retryWoodland"/);
 assert.match(html,/<noscript><link rel="stylesheet" href="\/no-script.css"><\/noscript>/);
 assert.ok((await stat(new URL('../public/assets/social-preview.jpg',import.meta.url))).size>1000);
});
