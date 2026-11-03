import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export async function createAvatar(scene){
 const root=new T.Group();scene.add(root);let mixer,actions={},current;
 const fallback=new T.Group();root.add(fallback);const body=new T.Mesh(new T.CapsuleGeometry(.25,.65,5,8),new T.MeshStandardMaterial({color:0x7b6e50,roughness:.9}));body.position.y=1.03;fallback.add(body);const head=new T.Mesh(new T.SphereGeometry(.16,10,8),new T.MeshStandardMaterial({color:0xc19b77}));head.position.y=1.67;fallback.add(head);const legs=[];
 for(const x of [-.13,.13]){const leg=new T.Mesh(new T.CapsuleGeometry(.09,.46,4,6),new T.MeshStandardMaterial({color:0x39483c}));leg.position.set(x,.37,0);fallback.add(leg);legs.push(leg);}
 const pack=new T.Mesh(new RoundedBoxGeometry(.36,.44,.22,2,.04),new T.MeshStandardMaterial({color:0x655b3e,roughness:.9}));pack.position.set(0,1.18,-.23);root.add(pack);
 const pocket=new T.Mesh(new RoundedBoxGeometry(.27,.2,.06,2,.02),new T.MeshStandardMaterial({color:0x8a7852,roughness:.9}));pocket.position.set(0,-.06,-.13);pack.add(pocket);for(const x of [-.11,.11]){const strap=new T.Mesh(new T.BoxGeometry(.035,.41,.025),new T.MeshStandardMaterial({color:0x342e26}));strap.position.set(x,0,-.14);pack.add(strap);}
 try{const manifest=await (await fetch('./models/manifest.json')).json();const gltf=await new GLTFLoader().loadAsync(manifest.character);const model=gltf.scene,bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),scale=1.8/size.y;model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;
  model.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;o.material=o.material.clone();o.material.roughness=.9;o.material.color.set(o.material.name==='M_Joints'?0x444c3e:0xffffff);
   if(o.material.name==='M_Main'){o.material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float avatarHeight;').replace('#include <begin_vertex>','#include <begin_vertex>\navatarHeight=position.y;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float avatarHeight;').replace('#include <color_fragment>',`#include <color_fragment>\nvec3 clothing=avatarHeight>1.48?vec3(.58,.40,.26):avatarHeight>.92?vec3(.29,.34,.24):avatarHeight>.18?vec3(.12,.18,.15):vec3(.07,.08,.07);diffuseColor.rgb*=clothing;`);};}
  });fallback.visible=false;root.add(model);mixer=new T.AnimationMixer(model);
  for(const [name,pattern]of Object.entries({idle:/^Idle_Loop$/i,walk:/^Walk_Loop$/i,run:/^Jog_Fwd_Loop$/i})){const clip=gltf.animations.find(a=>pattern.test(a.name));if(clip)actions[name]=mixer.clipAction(clip);}
  if(actions.idle){current=actions.idle;current.play();mixer.update(.05);}
 }catch(e){console.warn('Using the authored explorer.',e.message);}
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.material.transparent=true;o.userData.noPick=true;}});
 return {root,update(dt,speed,heading,visible,animate){root.visible=visible;root.rotation.y+=Math.atan2(Math.sin(heading-root.rotation.y),Math.cos(heading-root.rotation.y))*(1-Math.exp(-14*dt));const mode=speed>.2?(speed>3.2?'run':'walk'):'idle';if(mixer){const action=actions[mode]||actions.idle;if(action&&action!==current){current?.fadeOut(.2);action.reset().fadeIn(.2).play();current=action;}mixer.update(animate?dt:0);}else legs.forEach((l,i)=>l.rotation.x=animate&&speed>.2?Math.sin(performance.now()*.009+i*Math.PI)*.45:0);pack.position.y=1.18+(animate&&speed>.2?Math.sin(performance.now()*.01)*.012:0);},setOpacity(value){root.traverse(o=>{if(o.isMesh)o.material.opacity=value;});}};
}
