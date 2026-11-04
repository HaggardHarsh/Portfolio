import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
const source=await readFile(new URL('../public/assets/woodland-preview.webp',import.meta.url));
const browser=await chromium.launch({headless:true,executablePath:process.env.SIDEQUEST_BROWSER_PATH,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Woodland portfolio sharing preview</title><style>*{box-sizing:border-box}body{margin:0;background:#20392d;color:#eee4ce;font-family:Georgia,serif}.forest{position:absolute;inset:0 0 0 320px;width:880px;height:630px;object-fit:cover;object-position:center 43%}.shade{position:absolute;inset:0;background:linear-gradient(90deg,#18372b 0%,#18372bf5 28%,#18372b9c 52%,#18372b00 76%)}main{position:absolute;inset:26px;border:1px solid #bda16a80;padding:45px 42px}small{font:13px system-ui;letter-spacing:.13em;color:#d8bf8f}.initials{display:block;font-style:italic;font-size:48px;line-height:1;margin:25px 0 23px;color:#d6b97f}h1{font-size:79px;line-height:1.05;font-weight:400;letter-spacing:-.04em;margin:0 0 27px}p{font:20px/1.7 system-ui;max-width:420px;margin:0;color:#e6dfcd}.domain{position:absolute;bottom:37px;left:43px;font:14px system-ui;color:#d8bf8f}</style><img class="forest" src="data:image/webp;base64,${source.toString('base64')}" alt="The woodland path and cabin"><div class="shade"></div><main><small>THE WOODLAND CABIN</small><span class="initials">ht.</span><h1>the-builder<br>cabin.</h1><p>Projects, notes, and the tools<br>behind them.</p><span class="domain">portfolio.example</span></main></html>`);
 await page.locator('img').evaluate(image=>image.decode());
 await mkdir(new URL('../public/assets/',import.meta.url),{recursive:true});
 await page.screenshot({path:new URL('../public/assets/social-preview.jpg',import.meta.url).pathname,type:'jpeg',quality:90});
 console.log('Generated public/assets/social-preview.jpg (1200 × 630).');
}finally{await browser.close();}
