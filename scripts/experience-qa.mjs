import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {rockLayout,SPAWN,obstacles,treeLayout,traverse} from '../src/world.js';

const url=process.env.SIDEQUEST_QA_URL||'http://localhost:4174';
const browser=await chromium.launch({headless:true,executablePath:process.env.SIDEQUEST_BROWSER_PATH,args:['--no-sandbox','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:960,height:700},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
await mkdir('artifacts',{recursive:true});
try {
 let unblock;
 const assetsMayLoad=new Promise(resolve=>unblock=resolve);
 await page.route('**/*.glb',async route=>{await assetsMayLoad;await route.continue();});
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('.header [data-content="about"]').click();
 assert.ok(await page.locator('#contentDialog[open]').isVisible());
 assert.equal(await page.evaluate(()=>!!window.woodland?.snapshot().ready),false,'portfolio works before the character download');
 unblock();
 await page.waitForFunction(()=>window.woodland?.snapshot().ready,{},{timeout:120000});
 await page.waitForTimeout(150);
 const frames=await page.evaluate(()=>woodland.snapshot().frames);
 await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>woodland.snapshot().frames),frames,'reading must stop rendering');
 const metrics=await page.evaluate(()=>({marks:performance.getEntriesByType('mark').map(m=>({name:m.name,ms:m.startTime})),resources:performance.getEntriesByType('resource').reduce((sum,r)=>sum+r.decodedBodySize,0)}));
 // The animation probe imports source modules and therefore uses the Vite dev server.
 const shoes=await page.evaluate(async()=>{
  const T=await import('/node_modules/.vite/deps/three.js'),{createAvatar}=await import('/src/avatar.js');
  const scene=new T.Scene(),avatar=await createAvatar(scene),results=[];
  for(const floor of [0,.14,.26,.29])for(const speed of [0,2.6,4.5]){
   let low=Infinity,high=-Infinity;avatar.root.position.y=floor;
   for(let i=0;i<96;i++){
    avatar.update(1/30,speed,0,true,true);scene.updateMatrixWorld(true);
    const height=new T.Box3().setFromObject(avatar.root,true).min.y-floor;
    low=Math.min(low,height);high=Math.max(high,height);
   }
   results.push({floor,speed,low,high});
  }
  return results;
 });
 for(const sample of shoes){assert.ok(sample.low>-.004,`shoe penetration ${JSON.stringify(sample)}`);assert.ok(sample.high<.025,`floating feet ${JSON.stringify(sample)}`);}
 await page.keyboard.press('Escape');
 await page.locator('#guideButton').click();await page.locator('#quality').selectOption('low');await page.keyboard.press('Escape');
 await page.locator('#enterButton').click();await page.waitForTimeout(300);
 await page.evaluate(()=>{if(document.pointerLockElement)document.exitPointerLock();});await page.waitForFunction(()=>!document.pointerLockElement);
 const solids=obstacles(treeLayout(),false),rock=rockLayout().sort((a,b)=>Math.hypot(a.x-SPAWN.x,a.z-SPAWN.z)-Math.hypot(b.x-SPAWN.x,b.z-SPAWN.z)).find(r=>{
  const distance=Math.hypot(r.x-SPAWN.x,r.z-SPAWN.z),t=(distance-r.radius-.34)/distance;
  return traverse(SPAWN,{x:SPAWN.x+(r.x-SPAWN.x)*t,z:SPAWN.z+(r.z-SPAWN.z)*t},solids);
 });
 assert.ok(rock,'reachable rock for a real-input regression');
 const yaw=Math.atan2(rock.x-SPAWN.x,SPAWN.z-rock.z);
 await page.mouse.move(480,350);await page.mouse.down();await page.mouse.move(480+yaw/.0025,350,{steps:8});await page.mouse.up();
 assert.ok(Math.abs((await page.evaluate(()=>woodland.snapshot())).yaw-yaw)<.02);
 await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyW');
 let closest=Infinity;
 for(let i=0;i<20;i++){
  await page.waitForTimeout(250);
  const state=await page.evaluate(()=>woodland.snapshot()),distance=Math.hypot(state.position.x-rock.x,state.position.z-rock.z);
  assert.ok(distance>=rock.radius+.32-1e-6,'manual running cannot enter a rock');closest=Math.min(closest,distance);
 }
 await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');
 assert.ok(closest<rock.radius+.5,'the runner actually reached the rock');
 await page.screenshot({path:'artifacts/rock-collision.png'});
 assert.deepEqual(errors,[]);
 const report={metrics,shoes,rock:{id:rock.id,radius:rock.radius,closest},errors};
 await writeFile('artifacts/experience-qa.json',JSON.stringify(report,null,2));
 console.log('PASS: reading before assets finish, zero render frames while reading, idle/walk/run shoe clearance on all four surfaces, and manual running into a real rendered rock.',JSON.stringify(metrics));
} finally {
 await browser.close();
}
