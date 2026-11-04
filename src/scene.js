import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {treeLayout,rockLayout,TRAIL,FLOORS} from './world.js';
import {loadMaterials,boxUV} from './materials.js';
const palette={wood:0x795537,timber:0x493c2c,plank:0xa27a4d,cream:0xd4c19a,metal:0x343f3d,leaf:0x456142};
function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');let seed=12;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};x.fillStyle=kind==='ground'?'#5d6545':'#a08259';x.fillRect(0,0,256,256);for(let i=0;i<1300;i++){x.fillStyle=kind==='ground'?`rgba(${rnd()>.5?'30,49,29':'160,153,92'},${rnd()*.15})`:`rgba(44,29,18,${rnd()*.22})`;x.fillRect(rnd()*256,rnd()*256,kind==='ground'?rnd()*6:rnd()*70,kind==='ground'?rnd()*5:1);}if(kind!=='ground'){x.fillStyle='#433626';for(let y=0;y<256;y+=64)x.fillRect(0,y,256,2);}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;return tex;}
function captureTree(asset,renderer){
 const capture=new T.Scene(),tree=asset.clone(true);tree.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=false;o.material.alphaTest=.4;o.material.color.set(o.material.name.includes('Leaves')?0x9baa89:0xb9b8aa);}});capture.add(tree);capture.add(new T.HemisphereLight(0xe2e8db,0x505942,1.1));const sun=new T.DirectionalLight(0xffedda,1.5);sun.position.set(-5,10,7);capture.add(sun);
 const bounds=new T.Box3().setFromObject(tree),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),span=Math.max(size.x,size.y,size.z)*1.15;
 const camera=new T.OrthographicCamera(-span/2,span/2,span/2,-span/2,.1,40);camera.position.set(10,center.y,12);camera.lookAt(0,center.y,0);
 const target=new T.WebGLRenderTarget(512,512);target.texture.colorSpace=T.SRGBColorSpace;const previous=renderer.getRenderTarget(),color=renderer.getClearColor(new T.Color()),alpha=renderer.getClearAlpha();renderer.setClearColor(0,0);renderer.setRenderTarget(target);renderer.clear();renderer.render(capture,camera);renderer.setRenderTarget(previous);renderer.setClearColor(color,alpha);
 return {texture:target.texture,span,height:size.y,centerY:center.y};
}
export async function createWorld(scene,onProgress,renderer){
 const modelAssets=fetch('./models/manifest.json').then(r=>r.json()).then(async manifest=>{
  const loader=new GLTFLoader();
  const [trees,bush]=await Promise.all([Promise.all((manifest.trees||[]).map(url=>loader.loadAsync(url))),manifest.bush?loader.loadAsync(manifest.bush):null]);
  return {trees,bush};
 }).catch(error=>{console.warn('Using the authored forest.',error.message);return {trees:[],bush:null};});
 const mats={};for(const [k,color]of Object.entries(palette))mats[k]=new T.MeshStandardMaterial({color,roughness:.88});
 let surfaces={};try{onProgress('Weathering the timber…');surfaces=await loadMaterials(renderer);}catch(error){console.warn('Using authored material textures.',error.message);}
 const woodTex=texture('wood');mats.wood.map=woodTex;mats.plank.map=woodTex;
 if(surfaces.wood){mats.wood=surfaces.wood.clone();mats.wood.color.set(0xbfb6a3);mats.plank=surfaces.wood.clone();mats.plank.color.set(0xd5c8ac);mats.timber=surfaces.wood.clone();mats.timber.color.set(0x776e5b);}
 const groundMat=surfaces.ground||new T.MeshStandardMaterial({color:0xc1c5a1,map:texture('ground'),roughness:1});if(!surfaces.ground)groundMat.map.repeat.set(35,35);
 const add=(geometry,material,x,y,z,parent=scene)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const box=(x,y,z,w,h,d,mat,parent=scene,round=0)=>{const material=typeof mat==='string'?mats[mat]:mat,geometry=round?new RoundedBoxGeometry(w,h,d,2,round):new T.BoxGeometry(w,h,d);boxUV(geometry,material,x,y,z);return add(geometry,material,x,y,z,parent);};
 const cylinder=(x,y,z,rt,rb,h,mat,parent=scene,segments=8)=>add(new T.CylinderGeometry(rt,rb,h,segments),typeof mat==='string'?mats[mat]:mat,x,y,z,parent);
 const warm=new T.MeshStandardMaterial({color:0xffcf81,emissive:0xff9b32,emissiveIntensity:1.8});
 const glass=new T.MeshStandardMaterial({color:0x9ab4aa,roughness:.25,transparent:true,opacity:.32});
 const groundGeometry=new T.PlaneGeometry(160,160);if(surfaces.ground){const p=groundGeometry.attributes.position,u=groundGeometry.attributes.uv;for(let i=0;i<p.count;i++)u.setXY(i,p.getX(i)/2.14,p.getY(i)/2.14);groundGeometry.setAttribute('uv1',u.clone());}
 const ground=add(groundGeometry,groundMat,0,-.035,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 // Paths are authored as a single curved ribbon, keeping their edges organic.
 const curve=new T.CatmullRomCurve3(TRAIL.map(p=>new T.Vector3(p.x,.012,p.z))),verts=[],indices=[],pathUV=[],colors=[];
 for(let i=0;i<=150;i++){const t=i/150,p=curve.getPoint(t),dir=curve.getTangent(t),side=new T.Vector3(-dir.z,0,dir.x).multiplyScalar(1.45+.18*Math.sin(i*.24));for(let j=0;j<5;j++){const offset=(j-2)/2,x=p.x+side.x*offset,z=p.z+side.z*offset;verts.push(x,p.y,z);pathUV.push(x/1.3,-z/1.3);colors.push(1,1,1,[0,.65,1,.65,0][j]);if(i<150&&j<4){const k=i*5+j;indices.push(k,k+5,k+1,k+1,k+5,k+6);}}}
 const pathGeo=new T.BufferGeometry();pathGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));pathGeo.setAttribute('uv',new T.Float32BufferAttribute(pathUV,2));pathGeo.setAttribute('uv1',new T.Float32BufferAttribute(pathUV,2));pathGeo.setAttribute('color',new T.Float32BufferAttribute(colors,4));pathGeo.setIndex(indices);pathGeo.computeVertexNormals();const pathMat=(surfaces.path||groundMat).clone();pathMat.color.set(0xc9bba5);pathMat.vertexColors=true;pathMat.transparent=true;pathMat.opacity=.95;pathMat.depthWrite=false;pathMat.side=T.DoubleSide;add(pathGeo,pathMat,0,0,0).castShadow=false;
 // Cabin shell, with actual window openings and a usable front doorway.
 box(0,.12,-20,12.5,.24,10.6,'timber');
 for(let i=0;i<24;i++)box(-5.8+i*.5,FLOORS.cabin-.025,-20,.48,.05,9.8,'plank');
 for(let level=0;level<13;level++){
  const y=.4+level*.23;
  for(const side of [-1,1]){
   if(level>=5&&level<=9){box(side*6,y,-23.5,.23,.21,3,'wood');box(side*6,y,-16.7,.23,.21,3.2,'wood');}
   else box(side*6,y,-20,.23,.21,10,'wood');
  }
  box(0,y,-25,12,.21,.24,'wood');
  box(-3.65,y,-15,4.7,.21,.24,'wood');box(3.65,y,-15,4.7,.21,.24,'wood');
 }
 for(const x of [-6,6])for(const z of [-25,-15])box(x,1.8,z,.35,3.5,.35,'timber');
 box(0,1.75,-25.12,12,3.1,.05,'timber');for(const x of [-6.12,6.12]){box(x,.85,-20,.05,1.1,10,'timber');box(x,2.95,-20,.05,.7,10,'timber');box(x,1.95,-23.55,.05,1.2,2.9,'timber');box(x,1.95,-16.6,.05,1.2,3.2,'timber');}for(const x of [-3.65,3.65])box(x,1.75,-15.12,4.7,3.1,.04,'timber');
 for(const x of [-1.4,1.4])box(x,1.7,-14.94,.18,2.95,.28,'timber');box(0,3.15,-15,3,.3,.3,'timber');
 // The roof has thickness, overhang, ridge, shingles and visible interior rafters.
 const roofmat=surfaces.roof||new T.MeshStandardMaterial({color:0x3f5349,roughness:.9});
 for(const side of [-1,1]){const roof=box(side*3.25,4.4,-20,7.3,.25,12,roofmat);roof.rotation.z=-side*.37;const ceiling=box(side*3.25,4.23,-20,7.25,.04,11.8,'plank');ceiling.rotation.z=-side*.37;for(const z of [-26.05,-13.95]){const fascia=box(side*3.25,4.35,z,7.4,.22,.15,'timber');fascia.rotation.z=-side*.37;}box(side*6.65,3.11,-20,.16,.22,12.3,'timber');}
 const gableMat=mats.wood.clone();gableMat.side=T.DoubleSide;for(const z of [-25,-15]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-6,3.2,z,6,3.2,z,0,5.6,z],3));g.setAttribute('uv',new T.Float32BufferAttribute([-6/1.8,3.2/1.8,6/1.8,3.2/1.8,0,5.6/1.8],2));g.setAttribute('uv1',g.attributes.uv.clone());g.computeVertexNormals();add(g,gableMat,0,0,0);}
 box(0,5.62,-20,.25,.25,12.3,'timber');
 for(const z of [-24.6,-22,-19,-16]){box(0,3.2,z,12,.2,.2,'timber');for(const s of [-1,1]){const r=box(s*3,4.3,z,6.5,.18,.2,'timber');r.rotation.z=-s*.37;}}
 for(const s of [-1,1]){const x=s*6.03;box(x,1.95,-20,.03,1.15,3.8,glass);for(const z of [-22,-20,-18])box(x,1.95,z,.12,1.35,.12,'timber');for(const y of [1.3,1.95,2.6])box(x,y,-20,.15,.1,4.1,'timber');}
 box(0,FLOORS.porch/2,-13.4,5,FLOORS.porch,3,'plank');box(0,FLOORS.step/2,-11.6,4,FLOORS.step,.6,'wood');
 box(0,FLOORS.cabin-.015,-15,2.5,.03,.4,'plank');
 for(const x of [-2.3,2.3]){box(x,1.65,-12.15,.18,3.2,.18,'timber');box(x,.95,-13.3,.12,.12,2.3,'timber');for(const z of [-13.8,-13.1,-12.4])box(x,.6,z,.07,.7,.07,'timber');}
 const porchroof=box(0,3.36,-13.4,5.8,.18,3.8,roofmat);porchroof.rotation.x=-.08;
 const porchCeiling=box(0,3.23,-13.4,5.65,.04,3.65,'plank');porchCeiling.rotation.x=-.08;
 if(surfaces.rock){for(const x of [-5.5,5.5])for(const z of [-24,-16])box(x,.13,z,.7,.28,.7,surfaces.rock,scene,.04);for(const x of [-2.2,2.2])box(x,.08,-12.4,.5,.16,.55,surfaces.rock,scene,.025);}
 const doorPivot=new T.Group();doorPivot.position.set(-1.23,.27,-15);scene.add(doorPivot);box(1.23,1.35,0,2.46,2.7,.13,'plank',doorPivot);for(const y of [.35,2.3])box(1.23,y,.08,2.2,.14,.12,'timber',doorPivot);const knob=cylinder(2.14,1.35,.18,.065,.065,.13,'metal',doorPivot);knob.rotation.x=Math.PI/2;
 function lantern(x,y,z){box(x,y,z,.27,.44,.27,'metal');box(x,y,z,.21,.3,.21,warm);cylinder(x,y+.3,z,.16,.2,.14,'metal');}
 lantern(-1.9,2.25,-14.65);lantern(2.5,2.35,-21);lantern(-4.6,2.3,-19.5);
 const insideLight=new T.PointLight(0xffdba2,26,13,1.6);insideLight.position.set(0,2.8,-20);scene.add(insideLight);
 // Furnishings are arranged around a clear circulation loop.
 function table(x,z,w,d,height=.95){box(x,height,z,w,.13,d,'plank',scene,.035);for(const dx of [-w/2+.12,w/2-.12])for(const dz of [-d/2+.12,d/2-.12])box(x+dx,height/2,z+dz,.1,height,.1,'timber');}
 table(-5,-20.6,1.4,3.4);table(5.05,-21.3,1.35,2.5);table(4.4,-16.9,1,1.2,.8);
 const screen=box(-5,1.52,-20.8,.09,.8,1.2,'metal',scene,.04);box(-4.94,1.52,-20.8,.02,.63,1.02,new T.MeshStandardMaterial({color:0x71b0a3,emissive:0x447f72,emissiveIntensity:.5}));box(-5,1.08,-20.8,.6,.05,1.4,'metal');
 for(let i=0;i<4;i++)box(-4.7,1.56+i*.09,-20.8,.02,.025,.65-i*.08,warm);
 box(-5.1,1.1,-19.65,.5,.05,.6,'cream');box(-4.9,1.14,-19.5,.035,.035,.4,'metal');
 const diary=new T.Group();diary.position.set(4.9,1.06,-21.2);scene.add(diary);for(const s of [-1,1]){const page=box(s*.21,0,0,.4,.06,.57,'cream',diary);page.rotation.z=s*.1;for(let i=0;i<5;i++)box(s*.21,.04,-.18+i*.07,.28,.005,.009,'wood',diary);}box(5.1,1.1,-20.45,.05,.035,.4,'metal');
 cylinder(5.32,1.2,-22.1,.13,.13,.3,'cream');cylinder(5.32,1.36,-22.1,.1,.1,.01,new T.MeshStandardMaterial({color:0x3b2a1f}));
 const card=box(4.25,1.08,-16.9,.06,.32,.55,'cream');card.rotation.z=.15;box(4.2,.91,-16.9,.32,.06,.65,'wood');for(let i=0;i<3;i++)box(4.20,1.16-i*.07,-16.9,.01,.018,.32,'metal');
 box(0,1.8,-24.73,3.9,1.8,.1,'plank');
 for(let i=0;i<7;i++){const x=-1.5+i*.5;box(x,2.28,-24.59,.04,.07,.12,'metal');box(x,1.72,-24.56,.06,.55,.06,i%2?'wood':'metal');if(i===0){const head=box(x+.08,2.02,-24.56,.35,.13,.11,'metal',scene,.025);}else if(i===1||i===4){const wrench=add(new T.TorusGeometry(.11,.035,5,12,Math.PI*1.5),mats.metal,x,2.03,-24.56);wrench.rotation.z=-Math.PI*.25;}else if(i===2){box(x,2.04,-24.55,.24,.3,.06,'metal');for(let j=0;j<5;j++)box(x-.09+j*.04,1.87,-24.55,.02,.04,.06,'metal');}else if(i===3){for(const side of [-1,1]){const jaw=box(x+side*.045,1.98,-24.56,.04,.28,.06,'metal');jaw.rotation.z=side*.22;}}else if(i===5){box(x,1.58,-24.56,.14,.3,.09,'wood');box(x,1.94,-24.56,.035,.33,.035,'metal');}else{const blade=box(x+.06,2,-24.56,.28,.23,.07,'metal');blade.rotation.z=-.3;}}
 const paperMat=new T.MeshStandardMaterial({color:0xe2d6b8,roughness:1});box(-1.05,.91,-24.13,.6,.05,.35,paperMat);box(1.15,.9,-24.13,.6,.08,.34,'wood');
 for(let i=0;i<5;i++){const log=cylinder(-4.15+i*.19,.37,-24.1,.1,.1,.5,'wood');log.rotation.x=Math.PI/2;}
 function plaque(text,x,y,z,w,rotation=0){const c=document.createElement('canvas');c.width=512;c.height=96;const context=c.getContext('2d');context.fillStyle='#d3bb86';context.fillRect(0,0,512,96);context.strokeStyle='#765b36';context.lineWidth=8;context.strokeRect(8,8,496,80);context.fillStyle='#3a4935';context.textAlign='center';context.textBaseline='middle';context.font='bold 30px Georgia';context.fillText(text,256,50);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const mesh=add(new T.PlaneGeometry(w,w*96/512),new T.MeshStandardMaterial({map:texture,roughness:.8}),x,y,z);mesh.rotation.y=rotation;}
 plaque('the-builder’S CABIN',0,3.65,-14.86,2.7);plaque('TOOLS OF THE TRADE',0,2.92,-24.7,2.8);plaque('THE WORKBENCH',-5.84,2.6,-20.7,1.8,Math.PI/2);plaque('FIELD NOTES',5.82,2.6,-21.3,1.6,-Math.PI/2);
 table(0,-24.25,3.7,.5,.8);for(let i=0;i<4;i++)box(-1.3+i*.23,1,-24.25,.17,.4+i*.07,.3,i%2?'cream':'wood');
 const stoveMat=new T.MeshStandardMaterial({color:0x293130,roughness:.55});box(-4.75,.75,-23.5,1.2,1.1,1.2,stoveMat,scene,.08);box(-4.75,.75,-22.88,.7,.6,.03,'metal');box(-4.75,.72,-22.85,.48,.35,.01,warm);cylinder(-4.75,3,-23.5,.14,.14,4,'metal');
 const chimney=box(-4.75,5.3,-23.5,.7,1.3,.7,surfaces.rock||mats.timber);box(-4.75,6,-23.5,.85,.15,.85,'metal');
 const rugmat=new T.MeshStandardMaterial({color:0x94705a,roughness:1});box(0,.3,-20,4.7,.015,4.4,rugmat);for(const x of [-2.2,2.2])box(x,.313,-20,.1,.01,4.2,'cream');
 // Shelves, books, chair and practical clutter make the room feel occupied.
 for(const y of [1.2,2]){box(3,y,-24.6,2,.12,.55,'wood');for(let i=0;i<5;i++)box(2.3+i*.22,y+.25,-24.6,.14,.4,.3,i%2?'cream':'timber');}
 box(3.8,.7,-22.7,.75,.12,.75,'wood');for(const dx of [-.28,.28])for(const dz of [-.28,.28])box(3.8+dx,.4,-22.7+dz,.07,.7,.07,'timber');box(3.8,1.1,-23,.75,.8,.08,'wood');
 const potmat=new T.MeshStandardMaterial({color:0x9c6546});cylinder(2,.55,-16,.3,.22,.6,potmat);for(let i=0;i<6;i++){const leaf=add(new T.SphereGeometry(.35,5,4),mats.leaf,2+Math.sin(i)*.25,1+i*.1,-16+Math.cos(i)*.25);leaf.scale.set(.5,1.6,.5);}
 const treeData=treeLayout(),windUniforms=[],detailBatches=[],impostors=[];
 let lodPosition={x:999,z:999},lodQuality='balanced',lodDirty=true;
 let seed=91;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const grassGeo=new T.BufferGeometry(),bladeVertices=[],bladeIndices=[];
 for(let b=0;b<5;b++){const angle=b*2.4,height=.22+(b%3)*.07;for(let j=0;j<5;j++){const t=j/4,width=.013*(1-t),bend=t*t*.09,baseX=Math.sin(angle)*.04,baseZ=Math.cos(angle)*.04;for(const side of [-1,1])bladeVertices.push(baseX+Math.cos(angle)*width*side+Math.sin(angle)*bend,height*t,baseZ+Math.sin(angle)*width*side+Math.cos(angle)*bend);if(j<4){const k=b*10+j*2;bladeIndices.push(k,k+1,k+2,k+1,k+3,k+2);}}}
 grassGeo.setAttribute('position',new T.Float32BufferAttribute(bladeVertices,3));grassGeo.setIndex(bladeIndices);grassGeo.computeVertexNormals();const grassMat=new T.MeshLambertMaterial({color:0x788267,side:T.DoubleSide});const grass=new T.InstancedMesh(grassGeo,grassMat,2000),dummy=new T.Object3D(),trailSamples=curve.getPoints(60);
 const grassWind={value:0};windUniforms.push(grassWind);grassMat.onBeforeCompile=shader=>{shader.uniforms.windTime=grassWind;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float windTime;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=sin(windTime*1.1+instanceMatrix[3].x)*.08*position.y*position.y;');};
 for(let i=0;i<2000;i++){const x=(rnd()-.5)*67,z=(rnd()-.5)*67;dummy.position.set(x,0,z);if((Math.abs(x)<8&&z<-11&&z>-28)||trailSamples.some(p=>Math.hypot(x-p.x,z-p.z)<1.35))dummy.position.y=-2;dummy.rotation.set(0,rnd()*6.28,0);dummy.scale.setScalar(.65+rnd()*.8);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);grass.setColorAt(i,new T.Color().setHSL(.19+rnd()*.06,.18,.45+rnd()*.18));}grass.receiveShadow=true;scene.add(grass);
 const rockMaterial=surfaces.rock||new T.MeshStandardMaterial({color:0x697266,roughness:1});for(const r of rockLayout()){const geometry=new T.IcosahedronGeometry(r.radius,2);geometry.setAttribute('uv1',geometry.attributes.uv.clone());const m=add(geometry,rockMaterial,r.x,r.y,r.z);m.scale.y=.55;m.rotation.set(...r.rotation);}
 // A narrow stream stays off the main walking trail.
 const waterMat=new T.MeshStandardMaterial({color:0x699b9d,roughness:.22,metalness:.25,transparent:true,opacity:.8});const water=box(-16,.015,-4,2,.015,31,waterMat);for(let i=0;i<25;i++)box(-17+(i%2)*2,.03,-18+i*1.2,.5,.1,.8,'timber').rotation.y=i;
 const flow=new T.Group();scene.add(flow);for(let i=0;i<16;i++){const glint=box(-16+Math.sin(i*2)*.7,.035,-18+i*1.8,.25,.008,.5,new T.MeshBasicMaterial({color:0xc3d5bf,transparent:true,opacity:.25}),flow);glint.castShadow=false;}
 const log=cylinder(8,.4,5,.35,.45,5,'wood');log.rotation.z=Math.PI/2;log.rotation.y=.5;
 // Smoke and drifting particles use shared geometry and restrained motion.
 const smoke=new T.Group();scene.add(smoke);for(let i=0;i<12;i++){const material=new T.MeshBasicMaterial({color:0xcbd0bb,transparent:true,opacity:.08,depthWrite:false});const m=add(new T.IcosahedronGeometry(1,1),material,-4.75,6+i*.4,-23.5,smoke);m.castShadow=false;}
 const dustGeo=new T.BufferGeometry(),dustPos=new Float32Array(90*3);for(let i=0;i<90;i++){dustPos[i*3]=(rnd()-.5)*18;dustPos[i*3+1]=.8+rnd()*6;dustPos[i*3+2]=-10+rnd()*20;}dustGeo.setAttribute('position',new T.BufferAttribute(dustPos,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:0xf4dab0,size:.035,transparent:true,opacity:.5}));scene.add(dust);
 const birds=new T.Group();scene.add(birds);for(let i=0;i<3;i++){const g=new T.Group();for(const s of [-1,1]){const wing=box(s*.2,0,0,.4,.025,.15,'timber',g);wing.rotation.z=s*.2;}g.position.set(-8+i*1.5,12+i*.4,-14);birds.add(g);}
 scene.updateMatrixWorld(true);
 for(const group of [doorPivot,flow,smoke,birds])group.userData.dynamic=true;
 const batches=new Map();scene.traverse(mesh=>{if(!mesh.isMesh||mesh.isInstancedMesh||Array.isArray(mesh.material))return;for(let parent=mesh;parent;parent=parent.parent)if(parent.userData.dynamic)return;const key=mesh.material.uuid+':'+Object.keys(mesh.geometry.attributes).sort().join(',');if(!batches.has(key))batches.set(key,[]);batches.get(key).push(mesh);});
 for(const meshes of batches.values()){if(meshes.length<2)continue;const geometry=mergeGeometries(meshes.map(m=>(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrixWorld)),false);if(!geometry)continue;const mesh=new T.Mesh(geometry,meshes[0].material);mesh.castShadow=meshes.some(m=>m.castShadow);mesh.receiveShadow=meshes.some(m=>m.receiveShadow);scene.add(mesh);meshes.forEach(m=>{m.removeFromParent();m.geometry.dispose();});}
 onProgress('The cabin is ready');
 return {treeData,doorPivot,doorProgress:0,doorTarget:false,interactionMeshes:[],
  setQuality(value){lodQuality=value;lodDirty=true;grass.count=value==='low'?400:value==='high'?1600:900;},
  setDoor(open){this.doorTarget=open;},
  update(time,dt,ambient,position){const target=this.doorTarget?1:0;this.doorProgress=T.MathUtils.damp(this.doorProgress,target,6,dt);doorPivot.rotation.y=this.doorProgress*Math.PI*.53;
   if(position&&(lodDirty||Math.hypot(position.x-lodPosition.x,position.z-lodPosition.z)>4)){lodPosition={...position};lodDirty=false;const detailed=new Set();for(const batch of detailBatches){const limit=lodQuality==='low'?3:lodQuality==='high'?14:6,near=[...batch.instances].sort((a,b)=>(a.x-position.x)**2+(a.z-position.z)**2-((b.x-position.x)**2+(b.z-position.z)**2)).slice(0,limit);batch.mesh.count=near.length;near.forEach((t,i)=>{detailed.add(t);const s=t.height/batch.height,m=new T.Matrix4().compose(new T.Vector3(t.x,-batch.minY*s,t.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),t.rotation),new T.Vector3(s,s,s));m.multiply(batch.part);batch.mesh.setMatrixAt(i,m);});batch.mesh.instanceMatrix.needsUpdate=true;batch.mesh.computeBoundingSphere();}
    for(const batch of impostors){const dummy=new T.Object3D();batch.instances.forEach((t,i)=>{const scale=t.height/batch.height;dummy.position.set(t.x,batch.centerY*scale,t.z);dummy.rotation.set(0,Math.atan2(position.x-t.x,position.z-t.z),0);dummy.scale.setScalar(detailed.has(t)?0:batch.span*scale);dummy.updateMatrix();batch.mesh.setMatrixAt(i,dummy.matrix);});batch.mesh.instanceMatrix.needsUpdate=true;batch.mesh.computeBoundingSphere();}
   }
   windUniforms.forEach(u=>u.value=ambient?time:0);if(ambient){flow.children.forEach((m,i)=>m.position.z=-18+(time*.5+i*1.8)%30);smoke.children.forEach((m,i)=>{const t=(time*.25+i/12)%1;m.position.set(-4.75+Math.sin(time*.3+i)*t*.7,6+t*4,-23.5+t);m.scale.setScalar(.16+t*.65);m.material.opacity=(1-t)*.09;});dust.rotation.y=Math.sin(time*.05)*.04;birds.position.x=Math.sin(time*.06)*23;birds.children.forEach((g,i)=>{g.position.y=12+Math.sin(time*.6+i)*.4;g.children.forEach((w,j)=>w.rotation.z=(j?1:-1)*Math.sin(time*3+i)*.45);});}smoke.visible=dust.visible=birds.visible=ambient;
  },
  async loadModels(){
   try{const assets=await modelAssets,models=assets.trees;
    if(models.length){
     models.forEach((asset,index)=>{asset.scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(asset.scene),size=bounds.getSize(new T.Vector3()),instances=treeData.filter((_,i)=>i%models.length===index);
      asset.scene.traverse(part=>{if(!part.isMesh)return;const material=part.material.clone();if(material.name.includes('Leaves')){material.transparent=false;material.depthWrite=true;material.alphaTest=.5;material.color.set(0x8ca77c);const time={value:0};windUniforms.push(time);material.onBeforeCompile=shader=>{shader.uniforms.windTime=time;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float windTime;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=sin(windTime*.7+position.y+instanceMatrix[3].x)*.025*max(0.,position.y-2.);');};}const mesh=new T.InstancedMesh(part.geometry,material,instances.length);mesh.castShadow=mesh.receiveShadow=true;
       instances.forEach((t,i)=>{const s=t.height/size.y,m=new T.Matrix4().compose(new T.Vector3(t.x,-bounds.min.y*s,t.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),t.rotation),new T.Vector3(s,s,s));m.multiply(part.matrixWorld);mesh.setMatrixAt(i,m);});scene.add(mesh);detailBatches.push({mesh,instances,height:size.y,minY:bounds.min.y,part:part.matrixWorld.clone()});});
     });
     const horizon=[];for(let i=0;i<240;i++){const angle=i*2.399963,radius=39+(i%6)*5.7;horizon.push({x:Math.sin(angle)*radius,z:Math.cos(angle)*radius,height:8+(i%7)*.8});}
     if(renderer)models.forEach((asset,index)=>{const captured=captureTree(asset.scene,renderer),instances=[...treeData,...horizon].filter((_,i)=>i%models.length===index),material=new T.MeshBasicMaterial({map:captured.texture,alphaTest:.35,side:T.DoubleSide,fog:true,color:0xc6d1b4});const mesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),material,instances.length);mesh.userData.noPick=true;scene.add(mesh);impostors.push({mesh,instances,...captured});});
    }
    if(!models.length){const trunks=new T.InstancedMesh(new T.CylinderGeometry(.15,.3,1,7),mats.timber,treeData.length),crowns=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),mats.leaf,treeData.length),dummy=new T.Object3D();treeData.forEach((t,i)=>{dummy.position.set(t.x,t.height*.4,t.z);dummy.scale.set(1,t.height*.8,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.y=t.height*.75;dummy.scale.set(t.height*.28,t.height*.23,t.height*.28);dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);});scene.add(trunks,crowns);}
    if(assets.bush){const asset=assets.bush;asset.scene.updateMatrixWorld(true);asset.scene.traverse(part=>{if(!part.isMesh)return;const material=part.material.clone();material.transparent=false;material.alphaTest=.5;material.color.set(0x8c9e7c);const mesh=new T.InstancedMesh(part.geometry,material,55);for(let i=0;i<55;i++){const t=treeData[i%treeData.length],s=.45+(i%4)*.13,m=new T.Matrix4().compose(new T.Vector3(t.x+1.6,0,t.z+.8),new T.Quaternion(),new T.Vector3(s,s,s));m.multiply(part.matrixWorld);mesh.setMatrixAt(i,m);}mesh.receiveShadow=true;scene.add(mesh);});}
   }catch(e){console.warn('Using locally authored forest models.',e.message);}
  }
 };
}
