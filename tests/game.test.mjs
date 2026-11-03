import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD_MAP} from '../dist/world-map.js';
import {PLACES,SPAWN,SCENE_VERSION,createState,visitPlace,discoverSecret,experience,findPath,isWalkable,canTraverse,nearestPlace,parseCommand,worldToScreen,screenToWorld} from '../dist/game.js';
import {createMotion,stopMotion,advanceMotion,moveAndSlide,followRoute,WALK_SPEED} from '../dist/movement.js';

function simulate(start,input,seconds=1,fps=60){
  let motion=createMotion(start);
  for(let i=0;i<seconds*fps;i++){
    const before=motion.position;motion=advanceMotion(motion,input,1/fps);
    assert.ok(isWalkable(motion.position.x,motion.position.y),'foot position remains clear');
    assert.ok(Math.hypot(motion.position.x-before.x,motion.position.y-before.y)<=WALK_SPEED/fps+.001,'bounded frame displacement');
  }
  return motion;
}
test('corrupt saves cannot manufacture progress or place a player inside an obstacle',()=>{
  const state=createState({sceneVersion:SCENE_VERSION,visited:['workshop','workshop','fake','__proto__'],secrets:['coffee','coffee','fake'],position:{x:430,y:370},theme:'unexpected',sound:'true'});
  assert.deepEqual(state.visited,['workshop']);assert.deepEqual(state.secrets,['coffee']);assert.equal(experience(state),75);
  assert.deepEqual(state.position,SPAWN);assert.equal(state.theme,'soft');assert.equal(state.sound,false);
  for(const saved of [null,{}, {position:{x:'432',y:418}},{position:{x:NaN,y:Infinity}}])assert.ok(isWalkable(...Object.values(createState(saved).position)));
});
test('valid continuous positions resume and old grid positions migrate safely',()=>{
  const position={x:1000.25,y:500.75};assert.deepEqual(createState({sceneVersion:SCENE_VERSION,position}).position,position);
  assert.deepEqual(createState({sceneVersion:4,position,visited:['workshop']}).position,SPAWN);
  const migrated=createState({sceneVersion:3,position:{x:58,y:29},visited:['signal'],theme:'bright'});
  assert.ok(isWalkable(migrated.position.x,migrated.position.y));assert.deepEqual(migrated.position,SPAWN);
  assert.deepEqual(migrated.visited,['signal']);assert.equal(migrated.theme,'bright');
  for(const theme of ['green','amber'])assert.equal(createState({theme}).theme,'soft');
});
test('discoveries are awarded once and all four sections remain available',()=>{
  let state=createState();
  for(const id of Object.keys(PLACES)){const first=visitPlace(state,id);assert.equal(first.fresh,true);state=first.state;assert.equal(visitPlace(state,id).fresh,false);}
  assert.equal(experience(state),200);const secret=discoverSecret(state,'compass');assert.equal(experience(secret.state),225);assert.equal(discoverSecret(secret.state,'compass').fresh,false);
});
test('every solid object footprint blocks the traveler',()=>{
  assert.ok(WORLD_MAP.obstacles.length>=4);
  for(const obstacle of WORLD_MAP.obstacles){
    const x=obstacle.points.reduce((sum,p)=>sum+p[0],0)/obstacle.points.length;
    const y=obstacle.points.reduce((sum,p)=>sum+p[1],0)/obstacle.points.length;
    assert.equal(isWalkable(x,y),false,obstacle.id);
  }
});
test('coast, river and bridge use the same authored geometry',()=>{
  assert.equal(isWalkable(790,798),false,'river');assert.equal(isWalkable(820,572),true,'bridge deck');
  assert.equal(isWalkable(820,520),false,'bridge railing / water');assert.equal(isWalkable(50,500),false,'outside coast');
  for(const p of [{x:0,y:0},{x:-1,y:500},{x:1600,y:920}])assert.equal(isWalkable(p.x,p.y),false);
});
test('each entrance is reachable without crossing a solid or cutting a corner',()=>{
  for(const place of Object.values(PLACES)){
    assert.ok(isWalkable(place.x,place.y),place.id);
    const route=findPath(SPAWN,place);assert.ok(route.length,place.id);let from=SPAWN;
    for(const point of route){assert.ok(canTraverse(from,point),place.id);from=point;}
    assert.deepEqual(route.at(-1),{x:place.x,y:place.y});assert.equal(nearestPlace(place,1).id,place.id);
  }
});
test('clicking an obstacle chooses nearby reachable ground and outside clicks do not move',()=>{
  const rock={x:980,y:690};assert.equal(isWalkable(rock.x,rock.y),false);
  const route=findPath(SPAWN,rock);assert.ok(route.length);assert.ok(isWalkable(route.at(-1).x,route.at(-1).y));
  assert.ok(Math.hypot(route.at(-1).x-rock.x,route.at(-1).y-rock.y)<=48);
  assert.deepEqual(findPath(SPAWN,{x:-20,y:500}),[]);
  assert.deepEqual(findPath(SPAWN,{x:0,y:0}),[]);
});
test('continuous pointer transforms round-trip across the canvas',()=>{
  for(const p of [SPAWN,{x:345.25,y:567.75},{x:1599.5,y:919.5}]){
    const result=screenToWorld(worldToScreen(p));assert.ok(Math.abs(result.x-p.x)<1e-9);assert.ok(Math.abs(result.y-p.y)<1e-9);
  }
});
test('keyboard movement has the same speed vertically, horizontally and diagonally',()=>{
  const start={x:610,y:380};
  const distances=[{x:1,y:0},{x:0,y:1},{x:1,y:1}].map(input=>{const p=simulate(start,input).position;return Math.hypot(p.x-start.x,p.y-start.y);});
  assert.ok(Math.max(...distances)-Math.min(...distances)<.05);
  assert.ok(distances[0]>120&&distances[0]<136);
});
test('walking is independent of key repeat and nearly identical across frame rates',()=>{
  const xs=[30,60,120].map(fps=>simulate({x:1000,y:500},{x:1,y:0},1,fps).position.x);
  assert.ok(Math.max(...xs)-Math.min(...xs)<2);
});
test('holding into a wall never steps onto the building',()=>{
  const motion=simulate({x:432,y:470},{x:0,y:-1},4);
  assert.ok(motion.position.y>=416&&motion.position.y<470);
  assert.ok(Math.abs(motion.position.x-432)<.001);
});
test('swept collision prevents tunneling even for a large displacement',()=>{
  const p=moveAndSlide({x:432,y:470},{x:0,y:-300});assert.ok(p.y>=416);assert.ok(isWalkable(p.x,p.y));
  const rock=moveAndSlide({x:920,y:690},{x:130,y:0});assert.ok(rock.x<955);assert.ok(isWalkable(rock.x,rock.y));
});
test('the traveler slides along a wall without sticking or entering it',()=>{
  const p=simulate({x:432,y:470},{x:1,y:-1},1).position;
  assert.ok(p.x>490);assert.ok(isWalkable(p.x,p.y));
});
test('releasing input brakes promptly and explicit stops cancel velocity immediately',()=>{
  const moving=simulate({x:1000,y:500},{x:1,y:0},.5);let stopped=moving;
  for(let i=0;i<20;i++)stopped=advanceMotion(stopped,{x:0,y:0},1/60);
  assert.deepEqual(stopped.velocity,{x:0,y:0});assert.ok(stopped.position.x-moving.position.x<7);
  const cancelled=stopMotion(moving);assert.deepEqual(advanceMotion(cancelled,{x:0,y:0},1/60).position,moving.position);
});
test('lag spikes are capped instead of teleporting the character',()=>{
  const before={position:{x:1000,y:500},velocity:{x:WALK_SPEED,y:0}};
  const after=advanceMotion(before,{x:1,y:0},10);assert.ok(after.position.x-before.position.x<=WALK_SPEED*.05+.001);
});
test('click routes complete at every entrance with bounded, collision-free motion',()=>{
  for(const place of Object.values(PLACES)){
    let route=findPath(SPAWN,place),motion=createMotion(SPAWN),frames=0;
    while(route.length&&frames++<3000){
      const previous=motion.position,result=followRoute(motion,route,1/60);motion=result.motion;route=result.route;
      assert.equal(result.blocked,false,place.id);assert.ok(isWalkable(motion.position.x,motion.position.y));
      assert.ok(Math.hypot(motion.position.x-previous.x,motion.position.y-previous.y)<=WALK_SPEED/60+.001);
    }
    assert.ok(frames<3000,place.id);assert.deepEqual(motion.position,{x:place.x,y:place.y});assert.deepEqual(motion.velocity,{x:0,y:0});
  }
});
test('invalid or newly blocked routes stop safely',()=>{
  const motion=createMotion({x:432,y:450});const result=followRoute(motion,[{x:432,y:370}],.05);
  assert.ok(isWalkable(result.motion.position.x,result.motion.position.y));
  let next=result;for(let i=0;i<20&&!next.blocked;i++)next=followRoute(next.motion,next.route,.05);
  assert.equal(next.blocked,true);assert.deepEqual(next.route,[]);
});
test('contact and terminal aliases still work and untrusted text stays a command',()=>{
  assert.deepEqual(parseCommand('  OPEN   projects/ '),{type:'open',place:'workshop'});
  assert.deepEqual(parseCommand('open watchtower'),{type:'open',place:'signal'});
  assert.deepEqual(parseCommand('theme bright'),{type:'theme',value:'bright'});
  assert.equal(parseCommand('sudo make coffee').type,'coffee');assert.equal(parseCommand('<img src=x onerror=alert(1)>').type,'unknown');
  assert.equal(parseCommand('open constructor').type,'unknown');
});
