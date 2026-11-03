import * as T from 'three';

export async function loadMaterials(renderer){
 const response=await fetch('./materials/manifest.json');
 if(!response.ok)throw new Error('Material library could not load');
 const manifest=await response.json(),loader=new T.TextureLoader(),out={};
 for(const [name,files]of Object.entries(manifest)){
  if(!files.color)continue;
  const maps=await Promise.all(['color','normal','roughness','ao'].map(async kind=>{
   if(!files[kind])return null;
   const texture=await loader.loadAsync(files[kind]);
   texture.wrapS=texture.wrapT=T.RepeatWrapping;
   texture.anisotropy=Math.min(8,renderer?.capabilities.getMaxAnisotropy()||4);
   if(kind==='color')texture.colorSpace=T.SRGBColorSpace;
   return texture;
  }));
  const material=new T.MeshStandardMaterial({map:maps[0],normalMap:maps[1],roughnessMap:maps[2],aoMap:maps[3],roughness:1,aoMapIntensity:name==='ground'?.6:.45,normalScale:new T.Vector2(name==='rock'?.8:.45,name==='rock'?.8:.45)});
  material.userData.surface=name;out[name]=material;
 }
 return out;
}

// Metre-scaled UVs keep grain and stone details the same size on different meshes.
export function boxUV(geometry,material,x,y,z){
 if(!material.userData.surface)return geometry;
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv,scale={wood:1.8,roof:3,rock:3,ground:2.14,path:1.3}[material.userData.surface]||2;
 for(let i=0;i<p.count;i++){
  let u,v;
  if(Math.abs(n.getY(i))>.7){u=p.getZ(i)+z;v=p.getX(i)+x;}
  else if(Math.abs(n.getX(i))>.7){u=p.getZ(i)+z;v=p.getY(i)+y;}
  else{u=p.getX(i)+x;v=p.getY(i)+y;}
  uv.setXY(i,u/scale,v/scale);
 }
 geometry.setAttribute('uv1',uv.clone());return geometry;
}
