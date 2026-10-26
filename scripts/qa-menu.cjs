const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const base=process.argv[2]||'http://localhost:3000';const report={checks:[],errors:[]};
const quad=t=>1-(1-Math.max(0,Math.min(1,t)))**2;
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/work',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');
  for(const interrupted of [false,true,false]){
   await page.getByRole('button',{name:'Menu',exact:true}).click();await page.waitForTimeout(interrupted?100:1050);
   const samples=await page.evaluate(async early=>{
    const panel=document.querySelector('[role="dialog"]'),controls=document.querySelector('[data-menu-controls]');const samples=[];
    const collect=()=>{const lines=[...panel.querySelectorAll('[data-menu-line]')].filter(e=>e.getClientRects().length);samples.push({time:Number(panel.dataset.menuExitTime||0),x:panel.getBoundingClientRect().left,opacity:Number(getComputedStyle(panel).opacity),control:controls.getBoundingClientRect().toJSON(),text:[...panel.querySelectorAll('[data-menu-link]')].map(e=>new DOMMatrix(getComputedStyle(e).transform).m42/e.getBoundingClientRect().height*100),lines:lines.map(e=>new DOMMatrix(getComputedStyle(e).transform).m11)})};collect();
    if(early)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));else document.querySelector('[aria-label="Close menu"]').click();
    await new Promise((resolve,reject)=>{const start=performance.now();const frame=()=>{if(!panel.isConnected){resolve();return}collect();if(performance.now()-start>3500){reject(new Error('menu exit stalled'));return}requestAnimationFrame(frame)};requestAnimationFrame(frame)});return samples;
   },interrupted);
   assert(samples.length>4);assert(samples.every(s=>s.opacity===1),'reference panel stays opaque');
   assert(samples.every((s,i)=>i===0||s.x>=samples[i-1].x-1),'panel never jumps backwards');
   assert(samples.every(s=>Math.abs(s.control.x-samples[0].control.x)<.1&&Math.abs(s.control.y-samples[0].control.y)<.1),'header buttons stay stationary');
   if(!interrupted){const mobile=width<768;for(const s of samples){const t=s.time;if(!t)continue;
    const expected=samples[0].x+(mobile?width*2:width*2-10)*quad((t-(mobile?.55:.48))/(mobile?1:2.5));assert(Math.abs(s.x-expected)<2,'reference panel trajectory at '+t);
    s.text.forEach((y,i)=>assert(Math.abs(y-100*quad((t-(mobile?i*.03:.16+i*.04))/.5))<1,'reference text stagger at '+t));
    s.lines.forEach((scale,i)=>assert(Math.abs(scale-(1-quad((t-(mobile?i*.13:.2+i*.04))/.5)))<.02,'reference rule stagger at '+t));
   }}
   await page.getByRole('dialog').waitFor({state:'detached'});await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Menu');
   assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.locator('main').evaluate(e=>e.inert),false);
   report.checks.push({width,interrupted,referenceTrajectory:!interrupted,stationaryControls:true,opaquePanel:true,passed:true});console.log('PASS reference menu exit, stationary controls, focus/scroll:',width,interrupted?'interrupted':'settled');
  }
  await page.getByRole('button',{name:'Menu',exact:true}).click();await page.waitForTimeout(100);await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(e=>e.textContent==='Reduce motion').click());
  await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});assert.equal(await page.locator('html').getAttribute('data-motion'),'reduced');
  await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('button',{name:'Reduce motion',exact:true}).click();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});
  await page.getByRole('button',{name:'Menu',exact:true}).click();await page.waitForTimeout(1050);await page.keyboard.press('Escape');await page.setViewportSize({width:width===390?375:1024,height:800});await page.getByRole('dialog').waitFor({state:'detached'});
  await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('link',{name:/Company/}).click();await page.waitForURL('**/company');await page.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  assert.deepEqual(errors,[]);report.checks.push({width,rapidEscape:true,motionModeDuringExit:true,resizeDuringExit:true,localNavigation:true,passed:true});await page.close();
 }
}catch(e){report.errors.push(e.stack);console.error(e);process.exitCode=1}finally{await browser.close();report.passed=!report.errors.length;fs.mkdirSync('artifacts/menu',{recursive:true});fs.writeFileSync('artifacts/menu/results.json',JSON.stringify(report,null,2))}})();
