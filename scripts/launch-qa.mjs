import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {documentPolicy,securityHeaders,normalizeSiteUrl} from '../config/launch.mjs';

const url=process.env.SIDEQUEST_QA_URL||'http://localhost:4175';
const browserName=process.env.SIDEQUEST_BROWSER||'chromium';
const browser=await ({chromium,webkit}[browserName]).launch({headless:true,...(browserName==='chromium'?{executablePath:process.env.SIDEQUEST_BROWSER_PATH,args:['--no-sandbox','--use-angle=swiftshader']}:{} )});
const report={browser:browserName,profiles:[]},errors=[];
await mkdir('artifacts',{recursive:true});
async function monitor(page){
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{window.launchViolations=[];document.addEventListener('securitypolicyviolation',event=>window.launchViolations.push({directive:event.effectiveDirective,blocked:event.blockedURI}));});
}
try{
 for(const [name,settings]of [['desktop',{viewport:{width:1280,height:800}}],['iphone',{...devices['iPhone 13']}],['android',{...devices['Pixel 7']}]] ){
  const context=await browser.newContext({...settings,reducedMotion:'reduce'}),page=await context.newPage();await monitor(page);
  const response=await page.goto(`${url}/#projects`);
  assert.equal(response.status(),200);
  const headers=await response.allHeaders();for(const [key,value]of Object.entries(securityHeaders))assert.equal(headers[key.toLowerCase()],value,key);
  await page.waitForSelector('#contentDialog[open]');
  await page.waitForFunction(()=>window.woodland?.snapshot().ready||!document.querySelector('#errorNotice').hidden,{},{timeout:120000});
  const graphics=await page.evaluate(()=>!!window.woodland?.snapshot().ready);
  if(browserName==='chromium')assert.equal(graphics,true,'Chromium must load the 3D scene under the security policy');
  for(const image of await page.locator('#contentBody img').all())await image.evaluate(image=>image.decode());
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),`${normalizeSiteUrl(process.env.SITE_URL)}/`);
  const share=await context.request.get(`${url}/assets/social-preview.jpg`);assert.equal(share.status(),200);assert.match(share.headers()['content-type'],/image\/jpeg/);
  assert.match(await(await context.request.get(`${url}/robots.txt`)).text(),/Sitemap: https:\/\//);
  assert.match(await(await context.request.get(`${url}/sitemap.xml`)).text(),/<urlset/);
  for(const id of ['about','skills','contact','reading']){
   await page.locator(`[data-chapter="${id}"]`).click();
   assert.equal(await page.locator(`[data-chapter="${id}"]`).getAttribute('aria-current'),'page');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.keyboard.press('Escape');
  if(graphics){
   if(name!=='desktop')await page.locator('#enterButton').click();
   await page.locator('#renderToggle').click();await page.locator(name==='desktop'?'#cameraToggle':'#touchCamera').click();
   await page.locator('.header [data-content="about"]').click();
   const state=await page.evaluate(()=>woodland.snapshot());assert.equal(state.render,'ascii');assert.equal(state.camera,'first');
   await page.screenshot({path:`artifacts/launch-${browserName}-${name}.png`});
   await page.keyboard.press('Escape');
  }
  await page.goto(`${url}/#constructor`);await page.waitForFunction(()=>document.body.classList.contains('enhanced')||!document.querySelector('#errorNotice').hidden);
  assert.equal(await page.locator('#contentDialog').evaluate(dialog=>dialog.open),false,'prototype names cannot open archive chapters');
  assert.deepEqual(await page.evaluate(()=>window.launchViolations),[],'normal navigation must not violate CSP');
  await page.evaluate(()=>{const script=document.createElement('script');script.textContent='window.untrustedLaunchScriptRan=true';document.body.append(script);const image=document.createElement('img');image.src='https://example.invalid/tracker.png';document.body.append(image);});
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>window.untrustedLaunchScriptRan),undefined);
  const violations=await page.evaluate(()=>window.launchViolations);assert.ok(violations.some(v=>v.directive.startsWith('script-src')));assert.ok(violations.some(v=>v.directive==='img-src'));
  report.profiles.push({name,graphics,normalPolicyViolations:0,injectedScriptBlocked:true,externalImageBlocked:true});await context.close();
 }
 const noJs=await browser.newContext({javaScriptEnabled:false}),fallback=await noJs.newPage();await fallback.goto(url);assert.ok(await fallback.locator('#reading').isVisible());assert.equal(await fallback.locator('#loading').isVisible(),false);await noJs.close();
 assert.deepEqual(errors,[]);
 await writeFile(`artifacts/launch-${browserName}.json`,JSON.stringify(report,null,2));
 console.log('PASS:',JSON.stringify(report));
}finally{await browser.close();}
