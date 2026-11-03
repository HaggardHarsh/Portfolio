export const SAVE_KEY='woodland.demo.v1';
export const SPAWN={x:0,z:19};
export const POINTS={
 cabin:{id:'cabin',label:'Cabin',action:'Open cabin door',x:0,z:-13.4},
 projects:{id:'projects',label:'Workbench',action:'Inspect workbench',x:-3.9,z:-20.3},
 about:{id:'about',label:'Diary',action:'Read the diary',x:4.05,z:-21.1},
 contact:{id:'contact',label:'Calling card',action:'Read calling card',x:3.4,z:-16.9},
 skills:{id:'skills',label:'Tool wall',action:'Explore the toolkit',x:0,z:-23.2}
};
export const TRAIL=[{x:0,z:22},{x:-2.5,z:13},{x:-2.8,z:8},{x:1.8,z:1},{x:1,z:-6},{x:0,z:-14}];
export const BOXES=[
 {id:'stream',x:-16,z:-4,w:1.9,d:31,h:.05}, {id:'fallen-log',x:8,z:5,w:4.7,d:1,h:.8},
 {id:'left-wall',x:-6,z:-20,w:.35,d:10,h:3.5}, {id:'right-wall',x:6,z:-20,w:.35,d:10,h:3.5},
 {id:'back-wall',x:0,z:-25,w:12,d:.35,h:3.5},
 {id:'front-left',x:-3.65,z:-15,w:4.7,d:.35,h:3.5},{id:'front-right',x:3.65,z:-15,w:4.7,d:.35,h:3.5},
 {id:'bench',x:-5,z:-20.6,w:1.45,d:3.4,h:1.05},
 {id:'diary-desk',x:5.05,z:-21.3,w:1.35,d:2.5,h:1},
 {id:'card-table',x:4.4,z:-16.9,w:1,d:1.2,h:1},
 {id:'stove',x:-4.75,z:-23.5,w:1.3,d:1.3,h:1.8},
 {id:'tools',x:0,z:-24.5,w:3.7,d:.6,h:2.3}
];
export function inCabin(p){return Math.abs(p.x)<5.8&&p.z<-15&&p.z>-25;}
export function obstacles(trees=[],doorOpen=false){return [...BOXES,...trees.map(t=>({id:'tree',x:t.x,z:t.z,w:t.radius*2,d:t.radius*2,h:8})),...(!doorOpen?[{id:'door',x:0,z:-15,w:2.55,d:.25,h:3}]:[])];}
export function clear(p,solids,r=.32){if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.abs(p.x)>33||Math.abs(p.z)>33)return false;return !solids.some(b=>p.x>b.x-b.w/2-r&&p.x<b.x+b.w/2+r&&p.z>b.z-b.d/2-r&&p.z<b.z+b.d/2+r);}
export function traverse(a,b,solids,r=.32){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.12));for(let i=0;i<=n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},solids,r))return false;return true;}
export function move(position,delta,solids){let p={...position};const n=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.1));for(let i=0;i<n;i++){const x=delta.x/n,z=delta.z/n;if(clear({x:p.x+x,z:p.z+z},solids))p={x:p.x+x,z:p.z+z};else{if(clear({x:p.x+x,z:p.z},solids))p.x+=x;if(clear({x:p.x,z:p.z+z},solids))p.z+=z;}}return p;}
export function findRoute(start,end,solids){
 if(!clear(end,solids))return [];if(traverse(start,end,solids))return [{...end}];
 const step=.65,size=102,min=-33,key=(x,z)=>z*size+x,point=id=>({x:min+(id%size)*step,z:min+Math.floor(id/size)*step});
 const node=p=>({x:Math.max(0,Math.min(size-1,Math.round((p.x-min)/step))),z:Math.max(0,Math.min(size-1,Math.round((p.z-min)/step)))});
 const s=node(start),e=node(end),begin=key(s.x,s.z),goal=key(e.x,e.z),open=[begin],cost=new Map([[begin,0]]),prev=new Map(),closed=new Set();
 const heuristic=id=>{const p=point(id);return Math.hypot(p.x-end.x,p.z-end.z);};
 let found=false;
 while(open.length&&closed.size<12000){let best=0;for(let i=1;i<open.length;i++)if(cost.get(open[i])+heuristic(open[i])<cost.get(open[best])+heuristic(open[best]))best=i;const id=open.splice(best,1)[0];if(closed.has(id))continue;if(id===goal){found=true;break;}closed.add(id);const p=point(id),x=id%size,z=Math.floor(id/size);
 for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=size||nz>=size)continue;const next=key(nx,nz),q=point(next);if(closed.has(next)||!traverse(p,q,solids))continue;const score=cost.get(id)+Math.hypot(dx,dz)*step;if(score>=(cost.get(next)??Infinity))continue;cost.set(next,score);prev.set(next,id);open.push(next);}}
 if(!found)return [];const path=[{...end}];for(let id=goal;id!==undefined;id=prev.get(id)){path.unshift(point(id));if(id===begin)break;}
 const out=[];let anchor=start,i=0;while(i<path.length){let j=path.length-1;while(j>i&&!traverse(anchor,path[j],solids))j--;if(!traverse(anchor,path[j],solids))return [];out.push(path[j]);anchor=path[j];i=j+1;}return out;
}
export function safeSave(raw={}){const valid=raw&&typeof raw==='object'?raw:{},aliases={workshop:'projects',campfire:'about',observatory:'skills',signal:'contact'};return {version:1,render:valid.render==='ascii'?'ascii':'normal',camera:valid.camera==='first'?'first':'third',sound:valid.sound===true,ambient:valid.ambient!==false,visited:Array.isArray(valid.visited)?[...new Set(valid.visited.map(id=>Object.hasOwn(aliases,id)?aliases[id]:id).filter(id=>Object.hasOwn(POINTS,id)&&id!=='cabin'))]:[]};}
export function treeLayout(){let seed=721;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;},out=[];for(let i=0;i<230;i++){const x=(rnd()-.5)*69,z=(rnd()-.5)*69;const onTrail=TRAIL.some((p,i)=>{const q=TRAIL[Math.min(i+1,TRAIL.length-1)],dx=q.x-p.x,dz=q.z-p.z,t=Math.max(0,Math.min(1,((x-p.x)*dx+(z-p.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-p.x-dx*t,z-p.z-dz*t)<3.2;});if(onTrail||(Math.abs(x)<9&&z<-11&&z>-29)||Math.hypot(x,z-19)<4)continue;out.push({x,z,height:6+rnd()*7,radius:.25+rnd()*.25,type:i%4,rotation:rnd()*6.28});}return out;}
