import * as THREE from 'three';
export function createAscii(renderer){
 const atlas=document.createElement('canvas');atlas.width=32*24;atlas.height=32;const ctx=atlas.getContext('2d');
 ctx.fillStyle='#000';ctx.fillRect(0,0,atlas.width,32);ctx.fillStyle='#fff';ctx.font='bold 27px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 const ramp=' .,:;-=+*o!?x%#@MW8B$&Q0OZHNDKXER';
 for(let i=0;i<32;i++)ctx.fillText(ramp[i]||'@',i*24+12,16);
 const texture=new THREE.CanvasTexture(atlas);texture.minFilter=texture.magFilter=THREE.NearestFilter;
 const target=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});
 const material=new THREE.ShaderMaterial({uniforms:{sceneTexture:{value:target.texture},atlas:{value:texture},cells:{value:new THREE.Vector2(160,90)}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv; uniform sampler2D sceneTexture;uniform sampler2D atlas;uniform vec2 cells;
 float light(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
 void main(){vec2 cell=floor(vUv*cells);vec2 center=(cell+.5)/cells;vec3 color=texture2D(sceneTexture,center).rgb;float lum=light(color);float edge=abs(lum-light(texture2D(sceneTexture,center+vec2(1./cells.x,0.)).rgb));float level=clamp(pow(lum,.65)+edge*.25,0.,1.);float index=floor(level*31.);vec2 local=fract(vUv*cells);float glyph=texture2D(atlas,vec2((index+local.x)/32.,local.y)).r;vec3 tint=pow(max(color,vec3(.008)),vec3(.4545));tint=mix(tint,vec3(.90,.91,.78),.10);vec3 paper=vec3(.018,.027,.022)+tint*.18;gl_FragColor=vec4(mix(paper,tint*1.38,glyph),1.);}`});
 const scene=new THREE.Scene();scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));const camera=new THREE.Camera();
 return {resize(w,h){target.setSize(Math.min(w,1920),Math.min(h,1200));material.uniforms.cells.value.set(Math.max(40,Math.floor(w/7)),Math.max(30,Math.floor(h/11)));},render(world,cam){renderer.setRenderTarget(target);renderer.render(world,cam);renderer.setRenderTarget(null);renderer.render(scene,camera);},dispose(){target.dispose();texture.dispose();material.dispose();}};
}
