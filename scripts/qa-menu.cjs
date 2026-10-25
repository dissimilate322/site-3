const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.argv[2]||'http://localhost:3000';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/work',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');
   for(const interrupted of [false,true,false]){
    await page.getByRole('button',{name:'Menu',exact:true}).click();
    await page.waitForTimeout(interrupted?100:1000);
    const samples=await page.evaluate(async early=>{
     const panel=document.querySelector('[role="dialog"]');const samples=[];
     const collect=()=>{samples.push({x:panel.getBoundingClientRect().left,opacity:Number(getComputedStyle(panel).opacity)})};
     collect();
     if(early)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
     else panel.querySelector('[aria-label="Close menu"]').click();
     await new Promise((resolve,reject)=>{const started=performance.now();const frame=()=>{if(!panel.isConnected){resolve();return}collect();if(performance.now()-started>1600){reject(new Error('menu exit stalled'));return}requestAnimationFrame(frame)};requestAnimationFrame(frame)});
     return samples;
    },interrupted);
    assert(samples.length>3,'exit spans rendered frames');
    assert(samples.every((s,i)=>i===0||s.x>=samples[i-1].x-1),'panel never jumps back toward the page');
    assert(samples.every((s,i)=>i===0||s.opacity<=samples[i-1].opacity+.01),'panel fades continuously');
    assert(samples.at(-1).opacity<.08,'panel is faded before unmount');
    await page.getByRole('dialog').waitFor({state:'detached'});
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    assert.equal(await page.locator('main').evaluate(e=>e.inert),false);
    assert.equal(await page.getByRole('button',{name:'Menu',exact:true}).evaluate(e=>e===document.activeElement),true);
    console.log('PASS continuous menu exit and released focus/scroll:',width,interrupted?'during entrance':'settled');
   }
   await page.getByRole('button',{name:'Menu',exact:true}).click();
   await page.getByRole('button',{name:'Reduce motion',exact:true}).click();await page.keyboard.press('Escape');
   await page.getByRole('dialog').waitFor({state:'detached'});assert.deepEqual(errors,[]);
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
