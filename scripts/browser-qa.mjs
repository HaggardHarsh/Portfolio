import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.SIDEQUEST_BROWSER_PATH?{executablePath:process.env.SIDEQUEST_BROWSER_PATH}:{}),args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:960,height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,200));});
const url=process.env.SIDEQUEST_QA_URL||'http://localhost:4174';const snapshot=()=>page.evaluate(()=>woodland.snapshot());
async function waitReady(){await page.waitForFunction(()=>window.woodland?.snapshot().ready,{},{timeout:120000});}
async function release(){await page.waitForTimeout(300);await page.evaluate(()=>{if(document.pointerLockElement)document.exitPointerLock();});await page.waitForFunction(()=>!document.pointerLockElement);await page.waitForTimeout(300);}
async function choose(id){await release();await page.locator('#minimapButton').click();await page.locator('#mapDestinations button').filter({hasText:id}).click();}
try{
 await page.goto(url);await waitReady();console.log('Loaded',await snapshot());
 await page.locator('#guideButton').click();await page.locator('#quality').selectOption('low');await page.locator('#guideDialog [data-close]').click();
 await page.screenshot({path:'artifacts/woodland-desktop.png'});
 await page.locator('#enterButton').click();await release();
 const before=(await snapshot()).position;await page.keyboard.down('KeyW');await page.waitForTimeout(2000);await page.keyboard.up('KeyW');await page.waitForTimeout(300);console.log('After walking',await snapshot());assert.ok((await snapshot()).position.z<before.z-.2,'manual walking');
 await page.locator('#cameraToggle').click();assert.equal((await snapshot()).camera,'first');await page.locator('#renderToggle').click();assert.equal((await snapshot()).render,'ascii');await page.screenshot({path:'artifacts/woodland-first-ascii.png'});await page.locator('#renderToggle').click();await page.locator('#cameraToggle').click();
 await choose('Cabin porch');await page.waitForTimeout(500);await page.keyboard.down('KeyA');await page.waitForTimeout(100);await page.keyboard.up('KeyA');assert.equal((await snapshot()).route.length,0,'manual interruption');
 await choose('Cabin porch');console.log('Walking to porch');await page.waitForFunction(()=>woodland.snapshot().near==='cabin'&&!woodland.snapshot().route.length,{},{timeout:120000});
 await page.locator('#interactButton').click();assert.equal((await snapshot()).doorOpen,true);
 await page.screenshot({path:'artifacts/woodland-porch.png'});
 for(const id of ['Workbench','Diary','Calling card','Tool wall']){await choose(id);console.log('Walking to',id);await page.waitForSelector('#contentDialog[open]',{timeout:90000});assert.ok((await page.locator('#contentBody').textContent()).length>50);if(id==='Workbench'){await page.screenshot({path:'artifacts/woodland-projects.png'});await page.locator('#contentBody summary').first().click();assert.equal(await page.locator('#contentBody details').first().evaluate(e=>e.open),true);}for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.querySelector('#contentDialog').contains(document.activeElement)));}await page.locator('#contentDialog [data-close]').click();}
 assert.equal((await snapshot()).visited.length,4);await page.screenshot({path:'artifacts/woodland-cabin.png'});
 await page.locator('#renderToggle').click();await page.screenshot({path:'artifacts/woodland-cabin-ascii.png'});await page.locator('#cameraToggle').click();await page.screenshot({path:'artifacts/woodland-first-cabin-ascii.png'});
 await page.locator('nav [data-content="contact"]').click();assert.equal(await page.locator('#contentBody a[href^="mailto:"]').count(),0);await page.keyboard.press('Escape');
 await page.locator('#motionButton').click();assert.equal(await page.locator('#motionButton').getAttribute('aria-pressed'),'false');await page.locator('#soundButton').click();assert.equal(await page.locator('#soundButton').getAttribute('aria-pressed'),'true');await page.locator('#soundButton').click();
 await page.reload();await waitReady();assert.equal((await snapshot()).camera,'first');assert.equal((await snapshot()).render,'ascii');assert.equal((await snapshot()).visited.length,4);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'artifacts/woodland-mobile.png'});
 await page.locator('#enterButton').click();await release();const joy=page.locator('#joystick');await joy.dispatchEvent('pointerdown',{pointerId:9,clientX:85,clientY:750});await joy.dispatchEvent('pointercancel',{pointerId:9});await page.waitForTimeout(400);const stopped=(await snapshot()).position;await page.waitForTimeout(500);assert.ok(Math.hypot((await snapshot()).position.x-stopped.x,(await snapshot()).position.z-stopped.z)<.03);
 await page.locator('nav [data-content="projects"]').click();assert.ok(await page.locator('#contentDialog').evaluate(e=>e.getBoundingClientRect().width<=innerWidth));await page.keyboard.press('Escape');
 const noJs=await browser.newPage({javaScriptEnabled:false});await noJs.goto(url);assert.ok(await noJs.locator('#reading').isVisible());assert.match(await noJs.locator('#reading').textContent(),/SinceLastTime/);await noJs.close();
 assert.deepEqual(errors,[]);console.log('PASS: manual movement, both cameras/renderers, route cancellation, porch/door, all four interior objects, content focus, privacy notice, preferences, mobile layout, touch cancellation, no-JS content.');
}finally{await browser.close();}
