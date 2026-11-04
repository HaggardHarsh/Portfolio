import {readFile,readdir,rm,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {extname,join,relative} from 'node:path';
import {createAssetHandler} from '../worker/assets.mjs';
import {securityHeaders} from '../config/launch.mjs';

const root=new URL('../',import.meta.url).pathname,out=join(root,'dist'),assets={};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.gltf':'model/gltf+json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
async function collect(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=join(directory,entry.name);if(entry.isDirectory()){if(entry.name!=='.openai'&&entry.name!=='server')await collect(path);continue;}
  const name=relative(out,path).split('\\').join('/');if(name==='_headers')continue;
  const body=await readFile(path);assets[`/${name}`]={type:mime[extname(path)]||'application/octet-stream',size:body.length,etag:`"${createHash('sha256').update(body).digest('hex')}"`,body:body.toString('base64')};
 }
}
await collect(out);
if(!assets['/index.html'])throw new Error('Build the static client before packaging its Worker.');
const manifest=JSON.parse(await readFile(join(root,'.openai/hosting.json'),'utf8'));
if(manifest.static)throw new Error('The Sites Worker manifest must not declare static hosting.');
const source=`const assets=${JSON.stringify(assets)};\nconst securityHeaders=${JSON.stringify(securityHeaders)};\n${createAssetHandler.toString()}\nexport default createAssetHandler(assets,securityHeaders);\n`;
if(gzipSync(source).length>9_500_000)throw new Error('Worker exceeds the deployment size budget.');
await rm(out,{recursive:true,force:true});await mkdir(join(out,'server'),{recursive:true});await mkdir(join(out,'.openai'),{recursive:true});
await writeFile(join(out,'server/index.js'),source);await writeFile(join(out,'.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Built single-file Sites Worker: ${Object.keys(assets).length} assets, ${source.length} bytes / ${gzipSync(source).length} gzip. No runtime asset or database binding required.`);
