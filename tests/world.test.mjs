import test from 'node:test';import assert from 'node:assert/strict';
import {SPAWN,POINTS,obstacles,clear,move,traverse,findRoute,treeLayout,rockLayout,floorHeight,FLOORS,safeSave,inCabin} from '../src/world.js';
import {initialQuality,createFrameBudget} from '../src/performance.js';
const trees=treeLayout(),closed=obstacles(trees,false),open=obstacles(trees,true);
test('forest spawn and porch connect without obstacles',()=>{assert.ok(clear(SPAWN,closed));const route=findRoute(SPAWN,POINTS.cabin,closed);assert.ok(route.length);let p=SPAWN;for(const next of route){assert.ok(traverse(p,next,closed));p=next;}});
test('closed door prevents entry and open door connects all cabin objects',()=>{assert.equal(traverse({x:0,z:-14},{x:0,z:-17},closed),false);assert.equal(traverse({x:0,z:-14},{x:0,z:-17},open),true);for(const target of Object.values(POINTS)){const route=findRoute(POINTS.cabin,target,open);assert.ok(route.length,target.id);let p=POINTS.cabin;for(const q of route){assert.ok(traverse(p,q,open));p=q;}}});
test('all interior objects connect to each other with capsule clearance',()=>{for(const a of Object.values(POINTS).slice(1))for(const b of Object.values(POINTS).slice(1)){assert.ok(clear(a,open),a.id);assert.ok(findRoute(a,b,open).length,`${a.id} to ${b.id}`);}});
test('swept movement cannot tunnel through a wall or a closed door',()=>{const result=move({x:0,z:-13},{x:0,z:-10},closed);assert.ok(result.z>-15);assert.ok(clear(result,closed));const wall=move({x:4,z:-19},{x:10,z:0},open);assert.ok(wall.x<6);});
test('diagonal movement slides along a wall without entering solids',()=>{let p={x:5.5,z:-18};for(let i=0;i<60;i++)p=move(p,{x:.1,z:-.04},open);assert.ok(clear(p,open));assert.ok(p.x<5.6);assert.ok(p.z<-18);});
test('unreachable or invalid destinations fail without manufacturing a route',()=>{for(const p of [{x:NaN,z:0},{x:100,z:0},{x:6,z:-20}])assert.deepEqual(findRoute(SPAWN,p,closed),[]);});
test('preferences only preserve supported values and real discoveries',()=>{assert.deepEqual(safeSave({render:'bad',camera:'bad',visited:['projects','projects','fake','__proto__'],sound:'yes'}),{version:1,render:'normal',camera:'third',ambient:true,sound:false,visited:['projects']});assert.equal(safeSave(null).render,'normal');});
test('location transitions correspond to the actual cabin footprint',()=>{assert.ok(inCabin({x:0,z:-20}));assert.equal(inCabin(POINTS.cabin),false);assert.equal(inCabin(SPAWN),false);});
test('legacy village discoveries migrate and old map coordinates do not become a forest position',()=>{const saved=safeSave({sceneVersion:5,position:{x:740,y:770},visited:['workshop','campfire','signal','observatory']});assert.deepEqual(saved.visited,['projects','about','contact','skills']);assert.equal(saved.position,undefined);});

test('all rendered rocks block walking and running from every side',()=>{
 const rocks=rockLayout();assert.ok(rocks.length>30);
 assert.equal(open.filter(b=>b.id.startsWith('rock-')).length,rocks.length);
 for(const rock of rocks){
  assert.equal(clear(rock,open),false,rock.id);
  const only=[rock];
  for(let angle=0;angle<Math.PI*2;angle+=Math.PI/4){
   const dx=Math.cos(angle),dz=Math.sin(angle),start={x:rock.x+dx*(rock.radius+1),z:rock.z+dz*(rock.radius+1)};
   if(!clear(start,only))continue;
   const result=move(start,{x:-dx*4,z:-dz*4},only);
   assert.ok(clear(result,only),rock.id);
   assert.equal(traverse(start,{x:rock.x-dx,z:rock.z-dz},only),false);
   if(Math.abs(dx)<.001||Math.abs(dz)<.001)assert.ok((result.x-rock.x)*dx+(result.z-rock.z)*dz>0,`cannot tunnel through ${rock.id}`);
  }
 }
});
test('indexed collision queries match a full scan, including cell edges',()=>{
 const full=[...open];
 for(let x=-32;x<=32;x+=.71)for(let z=-32;z<=32;z+=.83)assert.equal(clear({x,z},open),clear({x,z},full),`${x},${z}`);
});
test('automatic routes detour around rocks with full walking clearance',()=>{
 const rock=rockLayout().find(r=>Math.abs(r.x)<20&&r.z>0),solids=[rock];
 const a={x:rock.x-2,z:rock.z},b={x:rock.x+2,z:rock.z},path=findRoute(a,b,solids);
 assert.ok(path.length>1);let current=a;
 for(const next of path){assert.ok(traverse(current,next,solids));current=next;}
});
test('feet and camera use the actual step, porch, threshold and cabin top surfaces',()=>{
 for(const [p,height]of [[{x:0,z:-11.2},0],[{x:0,z:-11.6},FLOORS.step],[{x:0,z:-12.1},FLOORS.porch],[{x:0,z:-13.4},FLOORS.porch],[{x:0,z:-15},FLOORS.cabin],[{x:0,z:-20},FLOORS.cabin],[{x:3,z:-13},0]])assert.equal(floorHeight(p),height);
 assert.equal(traverse({x:0,z:-12},{x:3,z:-13},open),false,'porch rail blocks the side');
});
test('automatic quality responds to sustained slow frames without changing a healthy budget',()=>{
 assert.equal(initialQuality({mobile:true}),'low');assert.equal(initialQuality({memory:4}),'low');assert.equal(initialQuality({cores:12,memory:8}),'balanced');
 const fast=createFrameBudget();for(let i=0;i<180;i++)assert.equal(fast.sample(16.7),null);
 const slow=createFrameBudget();const changes=[];for(let i=0;i<150;i++){const next=slow.sample(50);if(next)changes.push(next);}
 assert.deepEqual(changes,[{quality:'low',scale:1},{quality:'low',scale:.8},{quality:'low',scale:.65}]);
});

test('bundled surface maps exist and cover the cabin and forest material families',async()=>{const {readFile,stat}=await import('node:fs/promises');const manifest=JSON.parse(await readFile(new URL('../public/materials/manifest.json',import.meta.url)));for(const name of ['wood','ground','roof','rock','path']){assert.ok(manifest[name]?.color,name);assert.ok(manifest[name]?.normal,name);for(const path of Object.values(manifest[name]))assert.ok((await stat(new URL('../public/'+path.replace('./',''),import.meta.url))).size>1000,path);}});

test('human locomotion tracks bind to bones present in the bundled model',async()=>{const {readFile}=await import('node:fs/promises');const manifest=JSON.parse(await readFile(new URL('../public/models/manifest.json',import.meta.url)));const model=await readFile(new URL('../public/'+manifest.character.replace('./',''),import.meta.url));assert.equal(model.toString('ascii',0,4),'glTF');const json=JSON.parse(model.toString('utf8',20,20+model.readUInt32LE(12)));const sanitize=name=>name.replace(/\s/g,'_').replace(/[\[\]\.:\/]/g,'');const nodes=new Set(json.nodes.map(n=>sanitize(n.name||'')));assert.ok(json.animations.some(a=>a.name===manifest.clipNames.idle));for(const file of Object.values(manifest.animations)){const clip=JSON.parse(await readFile(new URL('../public/'+file.replace('./',''),import.meta.url)));assert.ok(clip.duration>0);for(const track of clip.tracks){const bone=track.name.replace(/\.(quaternion|position|scale)$/,'');assert.ok(nodes.has(bone),bone);}}});
