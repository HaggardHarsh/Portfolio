import test from 'node:test';
import assert from 'node:assert/strict';
import {createCamera,toScreen,toWorld} from '../dist/camera.js';
import {SCENE} from '../dist/world-scene.js';
import {PLACES,SPAWN,findPath,canTraverse} from '../dist/game.js';
import {profile} from '../dist/content.js';
test('camera pointer conversion round-trips on desktop, tablet, phone and zoomed screens',()=>{
 for(const [w,h]of [[1440,610],[1024,550],[768,550],[390,430],[195,430]])for(const p of [SPAWN,{x:100,y:100},{x:1450,y:800}]){const camera=createCamera(w,h,p);const result=toWorld(toScreen(p,camera),camera);assert.ok(Math.abs(result.x-p.x)<1e-8);assert.ok(Math.abs(result.y-p.y)<1e-8);if(w/camera.scale<1600)assert.ok(camera.x>=0);else assert.equal(camera.x,(1600-w/camera.scale)/2);assert.ok(camera.scale>=.68);}
});
test('visible building entrances and navigation destinations share coordinates',()=>{
 for(const [id,p]of Object.entries(PLACES)){assert.equal(SCENE.places[id].x,p.x);assert.equal(SCENE.places[id].y,p.y);const o=SCENE.objects.find(o=>o.destination===id);assert.ok(o);assert.equal(o.x,p.x);assert.ok(p.y>o.y);}
});
test('all entrances connect to each other without crossing solids',()=>{
 for(const a of Object.values(PLACES))for(const b of Object.values(PLACES)){if(a===b)continue;const route=findPath(a,b);assert.ok(route.length);let start=a;for(const point of route){assert.ok(canTraverse(start,point));start=point;}}
});
test('portfolio contains the owner identity and real repository links',()=>{assert.equal(profile.name,'The Woodland Cabin');assert.ok(profile.projects.length>=3);for(const p of profile.projects){assert.match(p.url,/^https:\/\/github.com\/portfolio-owner\//);assert.ok(p.description&&p.detail);}});
