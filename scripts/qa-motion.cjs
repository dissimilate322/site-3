const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const content=require('../src/data/content.json');
const base=process.argv[2]||'http://localhost:3000';
const out=path.resolve('artifacts/motion');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[]};
async function assertWhitePixel(page,png,x,y){
 const pixel=await page.evaluate(async({data,x,y})=>{const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const context=c.getContext('2d');context.drawImage(img,0,0);return [...context.getImageData(x,y,1,1).data]}, {data:png.toString('base64'),x:Math.round(x),y:Math.round(y)});
 assert(pixel.slice(0,3).every(v=>v>=250),'space between projects is visibly white: '+pixel);
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const [width,height] of [[1920,936],[1440,900],[390,844]]){
   const p=await browser.newPage({viewport:{width,height}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base+'/',{waitUntil:'networkidle'});
   const idle=()=>p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');await idle();
   const hero=p.locator('[data-home-film] video:visible');assert.equal(await hero.count(),1);
   assert((await hero.getAttribute('poster')).includes(width<768?'hero-portrait':'hero-landscape'));
   await p.waitForFunction(()=>[...document.querySelectorAll('[data-home-film] video')].some(v=>v.clientWidth>0&&!v.paused&&v.currentTime>0));
   const before=await hero.evaluate(v=>v.currentTime);await p.waitForTimeout(300);assert(await hero.evaluate(v=>v.currentTime)>before,'hero progresses without interaction');
   assert.equal(await p.getByRole('button',{name:/^(Play|Pause) (video|film)/i}).count(),0,'no film buttons');
   assert(await p.locator('video').evaluateAll(vs=>vs.every(v=>v.muted&&v.loop&&v.playsInline&&!v.controls)),'all films are inline muted loops without controls');
   await p.screenshot({path:path.join(out,'home-'+width+'.png')});
   const tracks=await p.locator('[data-project-track]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top+scrollY));
   for(let index=0;index<tracks.length;index++){
    await p.evaluate(y=>scrollTo(0,y),tracks[index]+height*.5);await p.waitForTimeout(400);
    const panel=p.locator('[data-featured-project]').nth(index);const rect=await panel.boundingBox();assert(Math.abs(rect.y)<2&&Math.abs(rect.height-height)<2,'project holds at full screen');
    await p.waitForFunction(i=>{const v=document.querySelectorAll('[data-featured-project]')[i].querySelector('video');return !v.paused&&v.currentTime>0},index);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
    if(index===1)await p.screenshot({path:path.join(out,'project-'+width+'.png')});
    if(index>0){
     await p.evaluate(y=>scrollTo(0,y),tracks[index]-height*.42);await p.waitForTimeout(400);
     const previous=await p.locator('[data-featured-project]').nth(index-1).boundingBox();const next=await panel.boundingBox();
     const start=previous.y+previous.height;const gap=next.y-start;
     assert(start>0&&next.y<height,'both neighbouring blocks remain visible');
     assert(gap>height*.25&&gap<height*.55,'a substantial white gap separates neighbouring projects: '+gap);
     const png=await p.screenshot({path:path.join(out,`gap-${index}-${width}.png`)});await assertWhitePixel(p,png,width/2,start+gap/2);
     const films=await p.locator('[data-featured-project] video').evaluateAll(vs=>vs.map(v=>!v.paused));assert(films[index-1]&&films[index],'both visible films play in the gap');
     report.checks.push({width,gapBetween:index-1+' / '+index,pixels:Math.round(gap),white:true,passed:true});
    }
   }
   await p.evaluate(y=>scrollTo(0,y),tracks[0]+height*.5);await p.waitForTimeout(400);
   assert(await hero.evaluate(v=>v.paused),'offscreen opening film pauses');
   await p.locator('[data-featured-project]').first().getByRole('link',{name:'View Artist Accelerator case study',exact:true}).click({position:{x:width/2,y:height/2}});
   await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='leaving');
   const frozen=p.locator('[data-page-transition] [data-featured-project]').first();const frozenRect=await frozen.boundingBox();assert(frozenRect&&frozenRect.y<height&&frozenRect.y+frozenRect.height>0,'sticky project remains visible in page transition');
   assert(await frozen.locator('canvas').count()>0,'current video frame captured');await p.waitForTimeout(200);await p.screenshot({path:path.join(out,'transition-'+width+'.png')});
   await p.waitForURL('**/work/artist-accelerator');await idle();assert.equal(await p.locator('[data-page-scene] h1').innerText(),'Artist Accelerator');
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('link',{name:/Company/}).click();await p.waitForURL('**/company');await idle();assert.equal(await p.getByRole('dialog').count(),0);assert.equal(await p.evaluate(()=>document.body.style.overflow),'');
   await p.goBack();await p.waitForFunction(()=>document.querySelector('[data-page-scene] h1')?.textContent==='Artist Accelerator');await idle();assert(p.url().includes('/work/artist-accelerator'));
   await p.getByRole('link',{name:'Otherlife home'}).click();await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='leaving');await p.emulateMedia({reducedMotion:'reduce'});await p.waitForURL(base+'/');await idle();
   await p.waitForFunction(()=>[...document.querySelectorAll('[data-home-film] video')].some(v=>v.clientWidth>0&&!v.paused));
   assert(await p.locator('[data-featured-project]').evaluateAll(es=>es.every(e=>getComputedStyle(e).transform==='none'&&!e.inert)),'reduced motion removes project transforms while preserving access and autoplay');
   assert.equal(await p.locator('main button').count(),0,'film buttons also absent with reduced motion');
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('link',{name:/Work/}).click();await p.waitForURL('**/work');await idle();assert.equal(await p.locator('[data-page-scene]').evaluate(e=>e.inert),false);
   assert.deepEqual(errors,[]);report.checks.push({width,height,autoplay:true,projectPlanes:4,transitions:'case/menu/back/logo',reducedMotion:true,passed:true});
   console.log('PASS scroll, white gaps and autoplay',width,height);await p.close();
  }
  for(const width of [1440,390]){
   const p=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   for(const c of content.cases){
    await p.goto(base+'/work/'+c.slug,{waitUntil:'networkidle'});const videos=p.locator('main video');
    assert.equal(await p.getByRole('button',{name:/^(Play|Pause) (video|film)/i}).count(),0);
    for(let i=0;i<await videos.count();i++){
     const video=videos.nth(i);await video.scrollIntoViewIfNeeded();await p.waitForFunction(({i})=>{const v=document.querySelectorAll('main video')[i];return !v.paused&&v.currentTime>0},{i});
     assert(await video.evaluate(v=>v.muted&&v.loop&&v.playsInline&&!v.controls));
     const time=await video.evaluate(v=>v.currentTime);await p.waitForTimeout(180);assert(await video.evaluate(v=>v.currentTime)>time,'case film advances without a click');
    }
    report.checks.push({width,route:'/work/'+c.slug,autoplayVideos:await videos.count(),passed:true});console.log('PASS all case films',width,c.slug);
   }
   assert.deepEqual(errors,[]);await p.close();
  }
 }catch(e){report.errors.push(e.stack);console.error(e);process.exitCode=1}
 finally{await browser.close();report.passed=!report.errors.length;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2))}
})();
