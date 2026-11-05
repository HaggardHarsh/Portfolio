import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const url=process.env.SIDEQUEST_QA_URL||'http://localhost:4174';
const browser=await chromium.launch({headless:true,executablePath:process.env.SIDEQUEST_BROWSER_PATH,args:['--no-sandbox','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const chapter=id=>page.locator(`[data-chapter="${id}"]`);
const open=id=>chapter(id).click();
await mkdir('artifacts',{recursive:true});
try {
 await page.goto(`${url}/#reading`);
 await page.waitForSelector('#contentDialog[open]');
 await page.waitForFunction(()=>window.woodland?.snapshot().ready,{},{timeout:120000});
 await page.screenshot({path:'artifacts/archive-index.png'});
 await page.locator('.archive-chapter[data-open-chapter="about"]').click();
 assert.equal(await chapter('about').getAttribute('aria-current'),'page');
 await page.screenshot({path:'artifacts/archive-about.png'});
 for(const id of ['projects','skills','contact']) {
  await open(id);
  assert.equal(await chapter(id).getAttribute('aria-current'),'page');
  assert.equal(await page.locator('[data-chapter][aria-current]').count(),1);
  assert.equal(new URL(page.url()).hash,`#${id}`);
  if(id==='projects') {
   assert.equal(await page.locator('.folio-project').count(),3);
   for(const image of await page.locator('#contentBody img').all()) {
    await image.evaluate(image=>image.decode());
    assert.ok(await image.evaluate(image=>image.naturalWidth>0));
   }
   await page.locator('.project-notes summary').first().click();
   assert.equal(await page.locator('.project-notes').first().evaluate(e=>e.open),true);
  }
  await page.screenshot({path:`artifacts/archive-${id}.png`});
 }
 const configured=!!process.env.VITE_CONTACT_EMAIL||!!process.env.VITE_LINKEDIN_URL;
 if(configured){
  assert.equal(await page.locator('.card-owner').textContent(),process.env.VITE_PUBLIC_NAME||'The Woodland Cabin');
  assert.equal(await page.locator('.card-email').count(),process.env.VITE_CONTACT_EMAIL?1:0);
  if(process.env.VITE_CONTACT_EMAIL)assert.equal(await page.locator('.card-email').getAttribute('href'),`mailto:${process.env.VITE_CONTACT_EMAIL}`);
  assert.equal(await page.locator('.correspondence-link').count(),process.env.VITE_LINKEDIN_URL?1:0);
  if(process.env.VITE_LINKEDIN_URL){
   assert.equal(await page.locator('.correspondence-link').getAttribute('href'),process.env.VITE_LINKEDIN_URL);
   assert.equal(await page.locator('.correspondence-link').getAttribute('rel'),'noopener noreferrer');
  }
 }else{
  assert.equal(await page.locator('.card-email').count(),0);
  assert.equal(await page.locator('.correspondence-link').count(),0);
  assert.match(await page.locator('.contact-empty').textContent(),/No contact details/);
 }
 await page.locator('#nextChapter').click();
 assert.equal(await chapter('reading').getAttribute('aria-current'),'page');
 await page.goBack();
 assert.equal(await chapter('contact').getAttribute('aria-current'),'page');
 for(const width of [320,390,768,1280]) {
  await page.setViewportSize({width,height:844});
  for(const id of ['reading','about','projects','skills','contact']) {
   await open(id);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`page overflow ${width}/${id}`);
   assert.ok(await page.locator('.folio-pages').evaluate(e=>e.scrollWidth<=e.clientWidth+1),`page panel overflow ${width}/${id}`);
   assert.ok(await page.locator('#contentDialog').evaluate(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.bottom<=innerHeight;}));
   await page.locator('#nextChapter').scrollIntoViewIfNeeded();
   assert.ok(await page.locator('#contentDialog [data-close]').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}),`sticky close ${width}/${id}`);
  }
  if(width===390) {
   await open('about');
   await page.screenshot({path:'artifacts/archive-mobile.png'});
   await open('contact');
   await page.screenshot({path:'artifacts/archive-contact-mobile.png'});
  }
 }
 // Preserve the original world trigger even after navigating to another archive chapter.
 await page.keyboard.press('Escape');
 const trigger=page.locator('.header [data-content="contact"]');
 await trigger.click();
 await open('skills');
 await page.locator('[data-chapter="reading"]').focus();
 await page.keyboard.press('Shift+Tab');
 assert.equal(await page.locator('#nextChapter').evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('Tab');
 assert.equal(await chapter('reading').evaluate(e=>e===document.activeElement),true);
 for(let n=0;n<16;n++) {
  await page.keyboard.press('Tab');
  assert.ok(await page.locator('#contentDialog').evaluate(e=>e.contains(document.activeElement)));
 }
 await page.keyboard.press('Escape');
 assert.ok(await trigger.evaluate(e=>e===document.activeElement));
 await page.locator('#guideButton').click();
 await page.locator('#quality').selectOption('low');
 await page.locator('#guideDialog [data-close]').click();
 await page.locator('#minimapButton').click();
 assert.ok(await page.locator('#mapDialog').isVisible());
 await page.keyboard.press('Escape');
 // A failed preview must leave a readable state, not broken alt text.
 await page.route('**/assets/project-blob.png',route=>route.abort());
 await page.locator('.header [data-content="projects"]').click();
 await page.waitForSelector('.image-fallback:not([hidden])');
 assert.equal(await page.locator('#contentBody img').first().isVisible(),false);
 assert.match(await page.locator('.image-fallback').first().textContent(),/notes/);
 const noJs=await browser.newContext({javaScriptEnabled:false}),fallback=await noJs.newPage();
 await fallback.goto(url);
 assert.equal(await fallback.locator('#contact a[href^="mailto:"]').count(),process.env.VITE_CONTACT_EMAIL?1:0);
 assert.equal(await fallback.locator('#contact a[href*="linkedin.com/in/"]').count(),process.env.VITE_LINKEDIN_URL?1:0);
 await noJs.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: archive chapters, overview/next/back navigation, project preview, build notes, configured contact or empty state, 320/390/768/1280 layouts, sticky close, keyboard containment/return, map/guide, failed-image state; no runtime errors.');
} finally {
 await browser.close();
}
