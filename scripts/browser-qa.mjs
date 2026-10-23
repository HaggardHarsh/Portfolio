import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const endpoint=process.env.SIDEQUEST_CDP_URL||'http://127.0.0.1:9222';
const origin=process.env.SIDEQUEST_QA_URL||'http://127.0.0.1:4173';
const pages=await(await fetch(`${endpoint}/json`)).json();
const page=pages.find(p=>p.type==='page');
if(!page)throw new Error('No browser page available.');
const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
let sequence=0;const pending=new Map(),errors=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const task=pending.get(message.id);if(task){pending.delete(message.id);message.error?task.reject(new Error(JSON.stringify(message.error))):task.resolve(message.result);}}else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text+' '+(message.params.exceptionDetails.exception?.description||''));});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
async function screenshot(name){const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(new URL(`../artifacts/${name}.png`,import.meta.url),Buffer.from(shot.data,'base64'));}
async function viewport(width,height,mobile=false){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});}
await mkdir(new URL('../artifacts',import.meta.url),{recursive:true});
try{
  await send('Runtime.enable');await send('Page.enable');
  await viewport(1440,1100);await send('Page.navigate',{url:origin});await delay(1200);
  await evaluate('document.fonts.ready');
  await evaluate('localStorage.removeItem("sidequest.adventure.v1")');
  await send('Page.reload');await delay(600);
  assert.equal(await evaluate('document.querySelector("#xpCount").textContent'),'0');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Desktop overflow');
  await screenshot('desktop');
  await click('#startButton');
  const before=await evaluate('JSON.parse(localStorage.getItem("sidequest.adventure.v1")).position.x');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD',text:'d'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD'});
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("sidequest.adventure.v1")).position.x'),before+1,'Keyboard movement');
  await click('[data-open="campfire"]');
  assert.equal(await evaluate('document.querySelector("#contentDialog").open'),true);
  assert.match(await evaluate('document.querySelector("#dialogTitle").textContent'),/Curiosity/);
  assert.equal(await evaluate('document.querySelector("#xpCount").textContent'),'50');
  await click('#closeDialog');await click('[data-open="campfire"]');await click('#closeDialog');
  assert.equal(await evaluate('document.querySelector("#xpCount").textContent'),'50','Revisit must not duplicate XP');
  await click('[data-open="workshop"]');await click('[data-filter="creative"]');
  assert.equal(await evaluate('[...document.querySelectorAll(".project-item")].filter(el=>!el.hidden).length'),1);
  await click('[data-filter="all"]');await click('.project-detail-toggle');
  assert.equal(await evaluate('document.querySelector(".project-detail-toggle").getAttribute("aria-expanded")'),'true');
  await screenshot('workshop');await click('#closeDialog');
  await click('[data-open="observatory"]');await click('#closeDialog');await click('[data-open="signal"]');
  assert.equal(await evaluate('document.querySelector("#questCount").textContent'),'4/4');
  assert.equal(await evaluate('document.querySelector("#playerLevel").textContent'),'LVL 02');await click('#closeDialog');
  await evaluate('document.querySelector("#commandInput").value="sudo make coffee";document.querySelector("#terminalForm").requestSubmit()');
  await click('#secretButton');
  assert.equal(await evaluate('document.querySelector("#xpCount").textContent'),'250');
  await evaluate('document.querySelector("#commandInput").value="<img src=x onerror=alert(1)>";document.querySelector("#terminalForm").requestSubmit()');
  assert.equal(await evaluate('document.querySelectorAll("#terminalOutput img").length'),0,'Terminal must render text safely');
  await click('#themeButton');assert.equal(await evaluate('document.body.dataset.theme'),'amber');
  await send('Page.reload');await delay(400);assert.equal(await evaluate('document.body.dataset.theme'),'amber');assert.equal(await evaluate('document.querySelector("#xpCount").textContent'),'250','Saved progress');
  await click('#themeButton');await click('#resetButton');await click('#confirmReset');
  assert.equal(await evaluate('document.querySelector("#xpCount").textContent'),'0','Progress reset');
  await viewport(390,844,true);await evaluate('window.scrollTo(0,0)');await delay(300);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Mobile overflow');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".touch-controls")).display'),'flex');
  await screenshot('mobile');
  await click('[data-open="workshop"]');assert.equal(await evaluate('document.querySelector("#contentDialog").open'),true);
  assert.equal(await evaluate('document.querySelector("#contentDialog").getBoundingClientRect().width <= innerWidth'),true,'Mobile dialog overflow');await screenshot('mobile-workshop');await click('#closeDialog');
  await viewport(768,1024);await evaluate('window.scrollTo(0,0)');await delay(200);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Tablet overflow');
  await viewport(1440,1100);await evaluate('window.scrollTo(0,0)');
  assert.deepEqual(errors,[],'No JavaScript runtime errors');
  console.log(JSON.stringify({result:'passed',checks:['desktop, tablet, and mobile layout','keyboard movement','all four portfolio dialogs','non-duplicating XP','project filtering and expansion','terminal command execution and safe text output','both secret discoveries','theme and progress persistence','progress reset'],screenshots:['artifacts/desktop.png','artifacts/workshop.png','artifacts/mobile.png','artifacts/mobile-workshop.png'],runtimeErrors:errors},null,2));
}finally{socket.close();}
