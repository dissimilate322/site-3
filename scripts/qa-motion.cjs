const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.argv[2]||'http://localhost:3000';
const out=path.resolve('artifacts/motion');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[]};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const [width,height] of [[1920,936],[1440,900],[390,844]]){
   const p=await browser.newPage({viewport:{width,height}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base+'/',{waitUntil:'networkidle'});
   const idle=()=>p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');await idle();
   const hero=p.locator('[data-home-film] video:visible');assert.equal(await hero.count(),1);
   const src=await hero.getAttribute('poster');assert(src.includes(width<768?'hero-portrait':'hero-landscape'));
   await p.waitForFunction(()=>[...document.querySelectorAll('[data-home-film] video')].some(v=>v.clientWidth>0&&!v.paused&&v.currentTime>0));
   const before=await hero.evaluate(v=>v.currentTime);await p.waitForTimeout(300);assert(await hero.evaluate(v=>v.currentTime)>before,'hero progresses without interaction');
   await p.screenshot({path:path.join(out,'home-'+width+'.png')});
   await p.locator('[data-home-film]').getByRole('button',{name:'Pause video'}).click();assert(await hero.evaluate(v=>v.paused));
   await p.locator('[data-home-film]').getByRole('button',{name:'Play video'}).click();assert(!(await hero.evaluate(v=>v.paused)));
   const stage=await p.locator('[data-project-stage]').evaluate(e=>e.getBoundingClientRect().top+scrollY);
   for(const [index,position]of [[0,.15],[1,1.5],[2,2.85],[3,3.85]]){
    await p.evaluate(y=>scrollTo(0,y),stage+position*height);await p.waitForTimeout(650);
    const panel=p.locator('[data-featured-project]').nth(index);
    assert(!(await panel.evaluate(e=>e.inert)),'active plane '+index);
    assert(await panel.evaluate(e=>getComputedStyle(e).visibility==='visible'));
    await p.waitForFunction(i=>{const v=document.querySelectorAll('[data-featured-project]')[i].querySelector('video');return !v.paused&&v.currentTime>0},index);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
    if(index===1)await p.screenshot({path:path.join(out,'project-'+width+'.png')});
   }
   await p.evaluate(y=>scrollTo(0,y),stage+height*.15);await p.waitForTimeout(650);
   await p.locator('[data-featured-project]').first().getByRole('link',{name:'View Artist Accelerator case study',exact:true}).click({position:{x:width/2,y:height/2}});
   await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='leaving');
   const frozen=p.locator('[data-page-transition] [data-project-stage]');
   const frozenRect=await frozen.boundingBox();assert(frozenRect&&frozenRect.y<height&&frozenRect.y+frozenRect.height>0,'pinned project remains visible in transition snapshot');
   assert(await frozen.locator('canvas').count()>0,'current film frame captured');
   await p.waitForTimeout(250);await p.screenshot({path:path.join(out,'transition-'+width+'.png')});
   await p.waitForURL('**/work/artist-accelerator');await idle();assert.equal(await p.locator('[data-page-scene] h1').innerText(),'Artist Accelerator');
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('link',{name:/Company/}).click();await p.waitForURL('**/company');await idle();
   assert.equal(await p.getByRole('dialog').count(),0);assert.equal(await p.evaluate(()=>document.body.style.overflow),'');
   await p.goBack();await idle();assert(p.url().includes('/work/artist-accelerator'));
   await p.getByRole('link',{name:'Otherlife home'}).click();
   await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='leaving');
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForURL(base+'/');await idle();await p.waitForTimeout(200);
   assert(await p.locator('[data-home-film] video').evaluateAll(vs=>vs.every(v=>v.paused)),'reduced motion pauses films');
   assert.equal(await p.locator('.pin-spacer').count(),0,'reduced motion releases pinned stage');
   assert(await p.locator('[data-featured-project]').evaluateAll(es=>es.every(e=>!e.inert)),'all links accessible with reduced motion');
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('link',{name:/Work/}).click();await p.waitForURL('**/work');await idle();
   assert.equal(await p.locator('[data-page-scene]').evaluate(e=>e.inert),false);
   await p.goto(base+'/work/onramper',{waitUntil:'networkidle'});await idle();await p.emulateMedia({reducedMotion:'no-preference'});
   const film=p.locator('#project video').first();await film.scrollIntoViewIfNeeded();await p.waitForFunction(()=>{let v=document.querySelector('#project video');return v&&!v.paused&&v.currentTime>0});
   assert(await film.evaluate(v=>v.muted&&v.loop&&v.playsInline),'inline muted looping case film');
   await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(200);assert(await film.evaluate(v=>v.paused),'offscreen film pauses');
   assert.deepEqual(errors,[]);report.checks.push({width,height,autoplay:true,projectPlanes:4,transitions:'case/menu/back/logo',reducedMotion:true,caseVideo:true,passed:true});
   console.log('PASS motion',width,height);await p.close();
  }
 }catch(e){report.errors.push(e.stack);console.error(e);process.exitCode=1}
 finally{await browser.close();report.passed=!report.errors.length;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2))}
})();
