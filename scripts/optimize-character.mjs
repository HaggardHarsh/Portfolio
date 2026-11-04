import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const file=new URL('../public/models/human/remy/remy.glb',import.meta.url);
const input=await readFile(file),jsonLength=input.readUInt32LE(12);
const model=JSON.parse(input.toString('utf8',20,20+jsonLength));
const binary=input.subarray(28+jsonLength);
const visit=(value,fn)=>{if(!value||typeof value!=='object')return;for(const [key,child]of Object.entries(value)){fn(value,key,child);visit(child,fn);}};
const usedTextures=new Set();
visit(model.materials,(_,key,value)=>{if(key.endsWith('Texture')&&Number.isInteger(value?.index))usedTextures.add(value.index);});
const textureMap=new Map([...usedTextures].sort((a,b)=>a-b).map((old,index)=>[old,index]));
const images=[],hashes=new Map();
model.textures=[...textureMap.keys()].map(index=>{
 const texture={...model.textures[index]},image=model.images[texture.source],view=model.bufferViews[image.bufferView];
 const hash=createHash('sha256').update(binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength)).digest('hex');
 if(!hashes.has(hash)){hashes.set(hash,images.length);images.push({...image});}
 texture.source=hashes.get(hash);return texture;
});
model.images=images;
visit(model.materials,(_,key,value)=>{if(key.endsWith('Texture')&&Number.isInteger(value?.index))value.index=textureMap.get(value.index);});
const usedViews=new Set();
visit({...model,bufferViews:undefined},(_,key,value)=>{if(key==='bufferView')usedViews.add(value);});
let offset=0;
const chunks=[],viewMap=new Map(),views=[];
for(const index of [...usedViews].sort((a,b)=>a-b)){
 const view=model.bufferViews[index],padding=(4-offset%4)%4;
 if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}
 const bytes=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
 viewMap.set(index,views.length);views.push({...view,byteOffset:offset});chunks.push(bytes);offset+=bytes.length;
}
visit(model,(_,key,value)=>{if(key==='bufferView')_[key]=viewMap.get(value);});
model.bufferViews=views;model.buffers[0].byteLength=offset;
const body=Buffer.concat(chunks),json=Buffer.from(JSON.stringify(model)),jsonPadding=(4-json.length%4)%4,binaryPadding=(4-body.length%4)%4;
const header=Buffer.alloc(20),binaryHeader=Buffer.alloc(8);
header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+jsonPadding+body.length+binaryPadding,8);header.writeUInt32LE(json.length+jsonPadding,12);header.writeUInt32LE(0x4e4f534a,16);
binaryHeader.writeUInt32LE(body.length+binaryPadding,0);binaryHeader.writeUInt32LE(0x004e4942,4);
const output=Buffer.concat([header,json,Buffer.alloc(jsonPadding,0x20),binaryHeader,body,Buffer.alloc(binaryPadding)]);
await writeFile(file,output);
console.log(`Character: ${input.length} → ${output.length} bytes. Retained ${model.textures.length} referenced textures / ${images.length} unique images; geometry, rig and animation unchanged.`);
