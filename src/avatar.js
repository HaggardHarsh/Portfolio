import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

function canvasFabric(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const c=canvas.getContext('2d');c.fillStyle='#a89b79';c.fillRect(0,0,128,128);
 for(let y=0;y<128;y+=2){c.fillStyle=y%4?'#b3a685':'#958965';c.fillRect(0,y,128,1);}
 for(let x=0;x<128;x+=3){c.fillStyle='#554e3820';c.fillRect(x,0,1,128);}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2,2);return map;
}

export async function createAvatar(scene){
 const root=new T.Group();root.userData.dynamic=true;scene.add(root);
 let mixer,current,spine,packOffset,packRotation,model,opacity=1;const actions={},legs=[],soleProbes=[];
 const footPosition=new T.Vector3();
 function groundFeet(){
  if(!model||!soleProbes.length)return;
  root.updateMatrixWorld(true);
  let lowest=Infinity;
  for(const {mesh,indices}of soleProbes)for(const index of indices){mesh.getVertexPosition(index,footPosition).applyMatrix4(mesh.matrixWorld);lowest=Math.min(lowest,footPosition.y);}
  model.position.y+=root.position.y+.008-lowest;
  root.updateMatrixWorld(true);
 }
 const fallback=new T.Group();root.add(fallback);
 const body=new T.Mesh(new T.CapsuleGeometry(.22,.62,7,12),new T.MeshStandardMaterial({color:0x6a7765,roughness:.9}));body.position.y=1.03;fallback.add(body);
 const head=new T.Mesh(new T.SphereGeometry(.15,16,12),new T.MeshStandardMaterial({color:0xb98e6c,roughness:.9}));head.position.y=1.67;fallback.add(head);
 for(const x of [-.12,.12]){const leg=new T.Mesh(new T.CapsuleGeometry(.085,.48,5,8),new T.MeshStandardMaterial({color:0x39483c}));leg.position.set(x,.37,0);fallback.add(leg);legs.push(leg);}
 const pack=new T.Group();pack.position.set(0,1.21,-.2);root.add(pack);
 const fabric=new T.MeshStandardMaterial({color:0xa49b7b,map:canvasFabric(),roughness:.96,bumpMap:null}),leather=new T.MeshStandardMaterial({color:0x3d3b2e,roughness:.8});
 const bag=new T.Mesh(new RoundedBoxGeometry(.30,.38,.17,3,.045),fabric);pack.add(bag);
 const pocket=new T.Mesh(new RoundedBoxGeometry(.24,.16,.045,3,.018),fabric.clone());pocket.material.color.set(0x89866e);pocket.position.set(0,-.065,-.1);pack.add(pocket);
 for(const x of [-.105,.105]){
  const curve=new T.CatmullRomCurve3([new T.Vector3(x,.12,-.08),new T.Vector3(x,.25,.03),new T.Vector3(x,.17,.23),new T.Vector3(x,-.06,.27),new T.Vector3(x,-.19,.1),new T.Vector3(x,-.13,-.07)]);
  pack.add(new T.Mesh(new T.TubeGeometry(curve,16,.012,5,false),leather));
  const buckle=new T.Mesh(new RoundedBoxGeometry(.033,.047,.014,2,.004),new T.MeshStandardMaterial({color:0x797565,metalness:.6,roughness:.4}));buckle.position.set(x,-.03,-.13);pack.add(buckle);
 }
 const zip=new T.Mesh(new T.BoxGeometry(.21,.008,.009),leather);zip.position.set(0,.015,-.127);pack.add(zip);
 try{
  const manifest=await (await fetch('./models/manifest.json')).json();
  const loader=new GLTFLoader();
  const [gltf,clips]=await Promise.all([loader.loadAsync(manifest.character),Promise.all(Object.entries(manifest.animations||{}).map(async([name,url])=>[name,T.AnimationClip.parse(await(await fetch(url)).json())]))]);model=gltf.scene;
  const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),scale=1.8/size.y;
  model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;
  model.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;
   const prepare=m=>{const material=m.clone();material.color.multiply(new T.Color(0xe6e5dc));material.roughness=Math.max(.65,material.roughness);material.metalness=0;return material;};
   o.material=Array.isArray(o.material)?o.material.map(prepare):prepare(o.material);
  });
  fallback.visible=false;root.add(model);mixer=new T.AnimationMixer(model);
  for(const [name,pattern]of Object.entries({idle:/^Idle_Loop$|^Idle$/i,walk:/^Walk_Loop$|^Walk$/i,run:/^Jog_Fwd_Loop$|^Run$/i})){
   const clip=clips.find(([key])=>key===name)?.[1]||gltf.animations.find(a=>manifest.clipNames?.[name]?a.name===manifest.clipNames[name]:pattern.test(a.name));
   if(clip)actions[name]=mixer.clipAction(clip);
  }
  if(actions.idle){current=actions.idle;current.play();mixer.update(.05);}
  root.updateMatrixWorld(true);
  const standingBounds=new T.Box3().setFromObject(model,true);
  model.position.y-=standingBounds.min.y;
  root.updateMatrixWorld(true);
  model.traverse(mesh=>{
   if(!mesh.isSkinnedMesh||!/^Shoes/i.test(mesh.name))return;
   // Keep both extremes in each small sole cell, including the heel during a run.
   const cells=new Map();
   for(let index=0;index<mesh.geometry.attributes.position.count;index++){
    mesh.getVertexPosition(index,footPosition).applyMatrix4(mesh.matrixWorld);
    const key=`${Math.floor(footPosition.x/.02)},${Math.floor(footPosition.z/.02)}`,cell=cells.get(key)||{low:Infinity,high:-Infinity};
    if(footPosition.y<cell.low){cell.low=footPosition.y;cell.lowIndex=index;}
    if(footPosition.y>cell.high){cell.high=footPosition.y;cell.highIndex=index;}
    cells.set(key,cell);
   }
   soleProbes.push({mesh,indices:[...new Set([...cells.values()].flatMap(cell=>[cell.lowIndex,cell.highIndex]))]});
  });
  groundFeet();
  spine=model.getObjectByName('mixamorigSpine2')||model.getObjectByName('DEF-spine002');
  if(spine){root.updateMatrixWorld(true);packOffset=spine.worldToLocal(pack.getWorldPosition(new T.Vector3()));packRotation=spine.getWorldQuaternion(new T.Quaternion()).invert().multiply(root.getWorldQuaternion(new T.Quaternion()));}
 }catch(error){console.warn('Using the authored explorer.',error.message);}
 root.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.userData.noPick=true;const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.userData.originalTransparent=m.transparent);});
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;
 const shadowContext=shadowCanvas.getContext('2d'),gradient=shadowContext.createRadialGradient(32,32,4,32,32,31);
 gradient.addColorStop(0,'#14221988');gradient.addColorStop(1,'#14221900');shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,64,64);
 const shadow=new T.Mesh(new T.PlaneGeometry(.85,.65),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));shadow.rotation.x=-Math.PI/2;shadow.userData.noPick=true;scene.add(shadow);
 const bonePosition=new T.Vector3(),boneQuaternion=new T.Quaternion(),rootQuaternion=new T.Quaternion();
 return {
  root,
  update(dt,speed,heading,visible,animate){
   root.visible=visible;shadow.position.set(root.position.x,root.position.y+.012,root.position.z);shadow.visible=visible;
   if(!visible)return;
   root.rotation.y+=Math.atan2(Math.sin(heading-root.rotation.y),Math.cos(heading-root.rotation.y))*(1-Math.exp(-12*dt));
   const mode=speed>.2?(speed>3.2?'run':'walk'):'idle';
   if(mixer){const action=actions[mode]||actions.idle;if(action&&action!==current){current?.fadeOut(.24);action.reset().fadeIn(.24).play();current=action;}
    if(current)current.setEffectiveTimeScale(mode==='walk'?T.MathUtils.clamp(speed/1.8,.7,1.5):mode==='run'?T.MathUtils.clamp(speed/3.8,.8,1.3):1);
    mixer.update(animate?dt:0);
    groundFeet();
   }else legs.forEach((l,i)=>l.rotation.x=animate&&speed>.2?Math.sin(performance.now()*.009+i*Math.PI)*.4:0);
   if(spine){root.updateMatrixWorld(true);bonePosition.copy(packOffset);spine.localToWorld(bonePosition);root.worldToLocal(bonePosition);pack.position.copy(bonePosition);spine.getWorldQuaternion(boneQuaternion);root.getWorldQuaternion(rootQuaternion).invert();pack.quaternion.copy(rootQuaternion.multiply(boneQuaternion).multiply(packRotation));}
  },
  setOpacity(value){if(value===opacity)return;opacity=value;root.traverse(o=>{if(!o.isMesh)return;for(const material of Array.isArray(o.material)?o.material:[o.material]){const transparent=material.userData.originalTransparent||value<1;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}material.opacity=value;}});}
 };
}
