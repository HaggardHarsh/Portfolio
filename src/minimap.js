import {POINTS,TRAIL,inCabin} from './world.js';
export function drawMap(canvas,position,yaw,trees,route,large=false){
 const ctx=canvas.getContext('2d'),size=large?500:176,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==size*dpr){canvas.width=canvas.height=size*dpr;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);
 const indoor=inCabin(position),extent=indoor?15:74,center={x:0,z:indoor?-20:0},s=size/extent,to=p=>({x:size/2+(p.x-center.x)*s,y:size/2+(p.z-center.z)*s});
 ctx.fillStyle=indoor?'#d6c5a1':'#243c31';ctx.fillRect(0,0,size,size);
 if(!indoor){ctx.fillStyle='#426047';for(const t of trees){const p=to(t);ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1.3,s*.9),0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#9f946c';ctx.lineWidth=s*1.5;ctx.beginPath();TRAIL.forEach((t,i)=>{const p=to(t);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.stroke();const a=to({x:-6,z:-25}),b=to({x:6,z:-15});ctx.fillStyle='#cda77b';ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.strokeStyle='#edd5a7';ctx.lineWidth=1;ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);}
 else{const a=to({x:-6,z:-25}),b=to({x:6,z:-15});ctx.strokeStyle='#4c5440';ctx.lineWidth=3;ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.fillStyle='#d6c5a1';const door=to({x:-1.2,z:-15});ctx.fillRect(door.x,door.y-3,s*2.4,6);}
 if(route.length){ctx.strokeStyle=indoor?'#47644d':'#f8dd9c';ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.beginPath();[position,...route].forEach((r,i)=>{const p=to(r);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.stroke();ctx.setLineDash([]);}
 const list=indoor?Object.values(POINTS).filter(p=>p.id!=='cabin'):[POINTS.cabin];list.forEach((r,i)=>{const p=to(r);ctx.fillStyle=indoor?'#334c3e':'#fff0c6';ctx.beginPath();ctx.arc(p.x,p.y,large?11:6,0,Math.PI*2);ctx.fill();if(large||indoor){ctx.fillStyle=indoor?'#fff4d8':'#243c31';ctx.font=`bold ${large?11:8}px system-ui`;ctx.textAlign='center';ctx.fillText(indoor?String(i+1):'H',p.x,p.y+(large?4:3));}});
 const p=to(position);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(yaw);ctx.fillStyle='#e6a771';ctx.strokeStyle='#24382c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(5,5);ctx.lineTo(0,2);ctx.lineTo(-5,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 ctx.fillStyle=indoor?'#324b3b':'#ebdfc0';ctx.font='bold 9px system-ui';ctx.textAlign='left';ctx.fillText('N ↑',10,17);
}
