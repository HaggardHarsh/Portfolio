import test from 'node:test';
import assert from 'node:assert/strict';
import {PLACES,createState,visitPlace,discoverSecret,experience,movePlayer,findPath,isWalkable,nearestPlace,parseCommand} from '../dist/game.js';

test('corrupt or hostile saved data cannot manufacture XP or break the player',()=>{
  const state=createState({visited:['workshop','workshop','fake','__proto__'],secrets:['coffee','coffee','fake'],position:{x:999,y:-1},theme:'unexpected',sound:'true'});
  assert.deepEqual(state.visited,['workshop']);assert.deepEqual(state.secrets,['coffee']);assert.equal(experience(state),75);assert.ok(isWalkable(state.position.x,state.position.y));assert.equal(state.theme,'green');assert.equal(state.sound,false);
  assert.doesNotThrow(()=>createState(null));assert.doesNotThrow(()=>createState({visited:'bad',secrets:12,position:{x:'55',y:27}}));
});
test('discoveries award XP once, revisits remain available, and all four total 200 XP',()=>{
  let state=createState();
  for(const id of Object.keys(PLACES)){const result=visitPlace(state,id);assert.equal(result.fresh,true);state=result.state;const again=visitPlace(state,id);assert.equal(again.fresh,false);state=again.state;}
  assert.equal(state.visited.length,4);assert.equal(experience(state),200);
  const secret=discoverSecret(state,'compass');assert.equal(experience(secret.state),225);assert.equal(discoverSecret(secret.state,'compass').fresh,false);assert.equal(discoverSecret(secret.state,'unknown').fresh,false);
});
test('every place is reachable by a contiguous path on the walkable island',()=>{
  const state=createState();
  for(const place of Object.values(PLACES)){
    const path=findPath(state.position,place);assert.ok(path.length>0,place.id);let previous=state.position;
    for(const step of path){assert.ok(isWalkable(step.x,step.y));assert.equal(Math.abs(step.x-previous.x)+Math.abs(step.y-previous.y),1);previous=step;}
    assert.deepEqual(path.at(-1),{x:place.x,y:place.y});assert.equal(nearestPlace(place,1).id,place.id);
  }
});
test('movement never leaves land and invalid directions leave state untouched',()=>{
  let state=createState();for(let n=0;n<200;n++)state=movePlayer(state,'left');assert.ok(isWalkable(state.position.x,state.position.y));const edge=state;assert.equal(movePlayer(edge,'left'),edge);assert.equal(movePlayer(edge,'diagonal'),edge);assert.deepEqual(findPath(state.position,{x:0,y:0}),[]);
});
test('terminal recognizes useful aliases, whitespace, history-safe strings, and secrets',()=>{
  assert.deepEqual(parseCommand('  OPEN   projects/ '),{type:'open',place:'workshop'});assert.deepEqual(parseCommand('cd ./campfire'),{type:'open',place:'campfire'});assert.equal(parseCommand('sudo make coffee').type,'coffee');assert.deepEqual(parseCommand('theme amber'),{type:'theme',value:'amber'});assert.equal(parseCommand('cat README.md').type,'readme');assert.equal(parseCommand('  ').type,'empty');assert.equal(parseCommand('<img src=x onerror=alert(1)>').type,'unknown');assert.equal(parseCommand('open constructor').type,'unknown');
});
