import test from 'node:test';
import assert from 'node:assert/strict';
import {createAssetHandler} from '../worker/assets.mjs';
import {securityHeaders} from '../config/launch.mjs';
const bytes=Buffer.from('A cabin in the woods.'),asset={type:'text/html; charset=utf-8',size:bytes.length,etag:'"test-asset"',body:bytes.toString('base64')};
const worker=createAssetHandler({'/index.html':asset,'/assets/index-12345678.js':{...asset,type:'text/javascript; charset=utf-8'}},securityHeaders);
test('Worker sends real security headers and byte-identical assets',async()=>{
 const result=await worker.fetch(new Request('https://portfolio.example/'));
 assert.equal(result.status,200);for(const [name,value]of Object.entries(securityHeaders))assert.equal(result.headers.get(name),value);
 assert.deepEqual(Buffer.from(await result.arrayBuffer()),bytes);
});
test('Worker validates paths, methods, conditional requests and HEAD',async()=>{
 for(const path of ['/missing','/.env','/.git/config','/constructor','/__proto__'])assert.equal((await worker.fetch(new Request('https://portfolio.example'+path))).status,404);
 assert.equal((await worker.fetch(new Request('https://portfolio.example/',{method:'POST'}))).status,405);
 const head=await worker.fetch(new Request('https://portfolio.example/',{method:'HEAD'}));assert.equal(head.headers.get('content-length'),String(bytes.length));assert.equal(await head.text(),'');
 const cached=await worker.fetch(new Request('https://portfolio.example/',{headers:{'If-None-Match':'"test-asset"'}}));assert.equal(cached.status,304);assert.equal(await cached.text(),'');
 assert.match((await worker.fetch(new Request('https://portfolio.example/assets/index-12345678.js'))).headers.get('cache-control'),/immutable/);
 assert.ok(!(await worker.fetch(new Request('https://portfolio.example/'))).headers.get('cache-control').includes('immutable'));
});
