/* Run with the site server active: node scripts/qa.cjs [baseURL].
 * Uses Playwright from the current environment and the system Chromium executable.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.argv[2] || 'http://localhost:3000';
const output = process.env.QA_OUTPUT || path.join(process.cwd(), 'artifacts', 'qa');
fs.mkdirSync(output, { recursive: true });
const results = { baseURL, startedAt: new Date().toISOString(), checks: [], errors: [], viewports: [] };
function record(name, detail = {}) { results.checks.push({ name, passed: true, ...detail }); console.log('PASS', name); }
const viewports = [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[375,812]];
async function settle(page) { await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true'&&document.querySelector('[data-page-transition]')?.dataset.state==='idle'); await page.waitForTimeout(1500); await page.evaluate(() => document.fonts.ready); }
async function loadAllImages(page) {
  await page.evaluate(async () => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    for (let y=0; y<document.documentElement.scrollHeight; y+=window.innerHeight) { window.scrollTo(0,y); await delay(100); }
    window.scrollTo(0,0);
  });
  await page.waitForFunction(() => [...document.querySelectorAll('img')].every(img => img.complete && img.naturalWidth > 0), { timeout: 20000 });
}
async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({ width:innerWidth, scrollWidth:document.documentElement.scrollWidth, bodyWidth:document.body.scrollWidth }));
  assert(size.scrollWidth <= size.width && size.bodyWidth <= size.width, `${label} horizontal overflow: ${JSON.stringify(size)}`);
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless:true, args:['--no-sandbox'] });
  try {
    for (const [width,height] of viewports) {
      const context = await browser.newContext({viewport:{width,height}, deviceScaleFactor:1, hasTouch:width<768});
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__qaLayoutShift = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaLayoutShift += entry.value;
        }).observe({type:'layout-shift', buffered:true});
      });
      const errors=[];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if(message.type()==='error') errors.push(message.text()); });
      await page.goto(`${baseURL}/work`, { waitUntil:'networkidle' });
      await settle(page); await loadAllImages(page);
      await noOverflow(page,`${width} grid`);
      assert.equal(await page.locator('#projects [data-project]').count(),6);
      assert.equal(await page.locator('#projects img').count(),6);
      const rects=await page.locator('#projects [data-project]').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}));
      assert(width>=1024 ? Math.abs(rects[0].y-rects[1].y)<1 && rects[1].x>rects[0].x : rects[1].y>rects[0].y, `${width} wrong gallery columns`);
      await page.screenshot({path:path.join(output,`grid-${width}.png`),fullPage:true});
      const cls=await page.evaluate(()=>window.__qaLayoutShift);
      assert(cls < 0.1, `${width} initial layout shift ${cls}`);
      if(width===1440) {
        await page.evaluate(()=>window.scrollTo(0,1100));
        await page.screenshot({path:path.join(output,'middle-1440.png')});
        await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
        await page.screenshot({path:path.join(output,'bottom-1440.png')});
        await page.evaluate(()=>window.scrollTo(0,0));
      }
      for(let i=0;i<3;i++) {
        await page.getByRole('button',{name:'List',exact:true}).click(); await settle(page);
        assert.equal(await page.locator('#projects [data-project]').count(),6);
        assert.equal(await page.locator('#projects img').count(),0);
        assert.equal(await page.getByRole('button',{name:'List',exact:true}).getAttribute('aria-pressed'),'true');
        await noOverflow(page,`${width} list`);
        if(i===0) await page.screenshot({path:path.join(output,`list-${width}.png`),fullPage:true});
        await page.getByRole('button',{name:'Grid',exact:true}).click(); await settle(page);
        assert.equal(await page.getByRole('button',{name:'Grid',exact:true}).getAttribute('aria-pressed'),'true');
      }
      record(`${width}x${height}: layout, six images, three List/Grid cycles`);
      await page.getByRole('button',{name:'Menu',exact:true}).click(); await settle(page);
      const menu=page.getByRole('dialog',{name:'Navigation'});
      assert(await menu.isVisible());
      assert.equal(await menu.locator('nav a').count(),4);
      await page.waitForFunction(() => [...document.querySelectorAll('[data-menu-link]')].every(e => Math.abs(new DOMMatrix(getComputedStyle(e).transform).m42) < 0.1));
      await noOverflow(page,`${width} menu`);
      await page.screenshot({path:path.join(output,`menu-${width}.png`)});
      // Cycle beyond the number of controls in the panel, checking focus never escapes.
      for(let i=0;i<15;i++) {
        await page.keyboard.press('Tab');
        assert(await menu.evaluate(el=>el.contains(document.activeElement)),`${width} menu focus escaped`);
      }
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({state:'detached'});
      assert.equal(await page.getByRole('dialog').count(),0);
      assert.equal(await page.locator('main').evaluate(el=>el.inert),false);
      await page.getByRole('button',{name:'Menu',exact:true}).click();await settle(page);
      await page.getByRole('dialog').getByRole('button',{name:'Contact Us',exact:true}).filter({visible:true}).click();
      await settle(page);
      await page.waitForFunction(() => [...document.querySelectorAll('input')].every(e => getComputedStyle(e).opacity === '1'));
      const contact=page.getByRole('dialog',{name:'Contact us',exact:true});
      assert(await contact.isVisible());
      assert.equal(await contact.locator('input').count(),5);
      await noOverflow(page,`${width} contact`);
      await page.screenshot({path:path.join(output,`contact-${width}.png`)});
      if(width===1440 || width===390) {
        await contact.getByRole('textbox',{name:'Full name',exact:true}).fill('Preview Tester');
        await contact.getByRole('textbox',{name:'Email',exact:true}).fill('preview@example.test');
        await contact.getByRole('textbox',{name:"What's your idea? How can we help?",exact:true}).fill('A local validation enquiry, not for external delivery.');
        await contact.getByRole('button',{name:'Send',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('does not send enquiries'));
        record(`${width}: local preview form submitted without external delivery`);
      }
      await page.getByRole('button',{name:'Close contact form',exact:true}).click();
      await page.getByRole('dialog',{name:'Navigation',exact:true}).waitFor();
      await settle(page);
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({state:'detached'});
      assert.equal(await page.getByRole('dialog').count(),0);
      assert.equal(await page.locator('main').evaluate(el=>el.inert),false);
      record(`${width}x${height}: menu, focus trap, Escape, contact, close`);
      assert.deepEqual(errors,[],`${width} console/page errors`);
      results.viewports.push({width,height,errors,rects,cls});
      await context.close();
    }
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const page=await context.newPage();
    await page.goto(`${baseURL}/work`,{waitUntil:'networkidle'});await settle(page);
    const image=page.locator('#projects img').first();
    await image.hover();await page.waitForTimeout(400);
    const hovered=await image.evaluate(e=>getComputedStyle(e).transform);
    assert(hovered.startsWith('matrix(1.1,'),`hover scale: ${hovered}`);
    await page.screenshot({path:path.join(output,'hover-1440.png')});
    await page.mouse.move(10,300);await page.waitForTimeout(400);
    assert.equal(await image.evaluate(e=>getComputedStyle(e).transform),'none');
    record('Desktop image hover scales to 1.1 and resets');
    await page.goto(baseURL,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');
    assert((await page.locator('h1').innerText()).includes('meruem is a creative agency'));
    record('Root entry renders the separate Home page');
    const malformed=await context.request.post(`${baseURL}/api/contact`,{data:'broken-json',headers:{'Content-Type':'application/json'}});
    assert.equal(malformed.status(),400);
    const invalid=await context.request.post(`${baseURL}/api/contact`,{data:{name:'Test',email:'invalid',description:'Test'}});
    assert.equal(invalid.status(),400);
    const valid=await context.request.post(`${baseURL}/api/contact`,{data:{name:'Test',email:'preview@example.test',description:'Test'}});
    assert.equal(valid.status(),200);assert.deepEqual(await valid.json(),{ok:true,mode:'preview',sent:false});
    record('Contact API rejects malformed/invalid data and confirms preview mode');
    await page.goto(`${baseURL}/work`,{waitUntil:'networkidle'});await settle(page);
    await page.locator('#projects a').first().click();
    await page.waitForURL(`${baseURL}/work/artist-accelerator`);
    await page.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');
    assert.equal(await page.locator('h1').innerText(),'Artist Accelerator');
    assert.equal(await page.locator('a[href^="https://"]').count(),0);
    record('Project card opens its local project overview without external links');
    await context.close();
    const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true});
    await reduced.addInitScript(()=>localStorage.setItem('otherlife-motion','reduced'));
    const reducedPage=await reduced.newPage();
    await reducedPage.goto(`${baseURL}/work`,{waitUntil:'networkidle'});
    const motion=await reducedPage.locator('#projects [data-project]').evaluateAll(els=>els.map(e=>({opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform})));
    assert(motion.every(e=>e.opacity==='1'&&e.transform==='none'));
    await reducedPage.getByRole('button',{name:'List',exact:true}).click();
    assert.equal(await reducedPage.locator('#projects [data-project]').count(),6);
    assert((await reducedPage.locator('#projects [data-project]').evaluateAll(els=>els.map(e=>getComputedStyle(e).transform))).every(e=>e==='none'));
    record('Explicit reduced motion renders immediately without project transforms');
    await reduced.close();
  } catch(error) { results.errors.push(error.stack||error.message); console.error(error); process.exitCode=1; }
  finally { await browser.close(); results.finishedAt=new Date().toISOString();results.passed=results.errors.length===0; fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)); }
})();
