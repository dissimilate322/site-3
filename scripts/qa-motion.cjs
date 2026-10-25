const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const content=require('../src/data/content.json');
const base=process.argv[2]||'http://localhost:3000';
const out=path.resolve('artifacts/motion');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[]};
async function assertPaperPixel(page,png,x,y){
 const pixel=await page.evaluate(async({data,x,y})=>{const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const context=c.getContext('2d');context.drawImage(img,0,0);return [...context.getImageData(x,y,1,1).data]}, {data:png.toString('base64'),x:Math.round(x),y:Math.round(y)});
 assert(pixel.slice(0,3).every((v,i)=>Math.abs(v-[161,161,159][i])<=2),'space between projects matches the grey page background: '+pixel);
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{
  for(const [width,height,preference] of [[1920,936,'reduce'],[1440,900,'no-preference'],[390,844,'reduce']]){
   const p=await browser.newPage({viewport:{width,height},reducedMotion:preference});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base+'/',{waitUntil:'networkidle'});
   const idle=()=>p.waitForFunction(()=>document.documentElement.dataset.motionReady==='true'&&document.querySelector('[data-page-transition]').dataset.state==='idle');await idle();
   assert.equal(await p.locator('html').getAttribute('data-motion'),'full','animations default on even when the OS requests reduced motion');
   const hero=p.locator('[data-home-film] video:visible');assert.equal(await hero.count(),1);
   assert((await hero.getAttribute('poster')).includes(width<768?'hero-portrait':'hero-landscape'));
   await p.waitForFunction(()=>[...document.querySelectorAll('[data-home-film] video')].some(v=>v.clientWidth>0&&!v.paused&&v.currentTime>0));
   const before=await hero.evaluate(v=>v.currentTime);await p.waitForTimeout(300);assert(await hero.evaluate(v=>v.currentTime)>before,'hero progresses without interaction');
   assert.equal(await p.getByRole('button',{name:/^(Play|Pause) (video|film)/i}).count(),0,'no film buttons');
   assert(await p.locator('video').evaluateAll(vs=>vs.every(v=>v.muted&&v.loop&&v.playsInline&&!v.controls)),'all films are inline muted loops without controls');
   await p.screenshot({path:path.join(out,'home-'+width+'.png')});
   await p.waitForFunction(()=>document.querySelector('[data-project-canvas]')?.closest('[data-webgl="ready"]'));
   const tracks=await p.locator('[data-project-track]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top+scrollY));
   await p.evaluate(y=>scrollTo(0,y),tracks[0]-height*.5);await p.waitForTimeout(300);
   const enteringCorners=await p.locator('[data-project-track]').first().getAttribute('data-project-corners');
   for(let index=0;index<tracks.length;index++){
    await p.evaluate(y=>scrollTo(0,y),tracks[index]+height*.5);await p.waitForTimeout(400);
    const panel=p.locator('[data-featured-project]').nth(index);const rect=await panel.boundingBox();assert(Math.abs(rect.y)<2&&Math.abs(rect.height-height)<2,'project holds at full screen');
    const interior=await p.locator('[data-project-canvas]').evaluate(original=>{const c=document.createElement('canvas');c.width=original.width;c.height=original.height;const cx=c.getContext('2d');cx.drawImage(original,0,0);return [.25,.5,.75].flatMap(x=>[.25,.5,.75].map(y=>cx.getImageData(Math.floor(c.width*x),Math.floor(c.height*y),1,1).data[3]))});assert(interior.every(a=>a===255),'held project has no transparent seams: '+interior);
    if(index===0){assert.equal(await p.locator('[data-project-track]').first().getAttribute('data-project-phase'),'hold');assert.notEqual(await p.locator('[data-project-track]').first().getAttribute('data-project-corners'),enteringCorners,'scroll changes the surface curvature');}
    await p.waitForFunction(i=>{const v=document.querySelectorAll('[data-featured-project]')[i].querySelector('video');return !v.paused&&v.currentTime>0},index);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
    if(index===1)await p.screenshot({path:path.join(out,'project-'+width+'.png')});
    if(index>0){
     await p.evaluate(y=>scrollTo(0,y),tracks[index]-height*.272);await p.waitForTimeout(250);
     const bounds=await p.evaluate(()=>{
      const original=document.querySelector('[data-project-canvas]');const c=document.createElement('canvas');c.width=original.width;c.height=original.height;const cx=c.getContext('2d');cx.drawImage(original,0,0);const a=cx.getImageData(Math.floor(c.width/2),0,1,c.height).data;
      const runs=[];let start=-1;for(let y=0;y<c.height;y++){if(a[y*4+3]>200&&start<0)start=y;if(start>=0&&(a[y*4+3]<=200||y===c.height-1)){runs.push([start,y]);start=-1;}}
      return runs.map(([start,end])=>[start/c.height*innerHeight,end/c.height*innerHeight]);
     });
     assert.equal(bounds.length,2,'both curved neighbouring surfaces remain visible');
     const start=bounds[0][1],end=bounds[1][0],gap=end-start;
     assert(gap>height*.35&&gap<height*.45,'recorded gap separates neighbouring projects: '+gap);
     const png=await p.screenshot({path:path.join(out,`gap-${index}-${width}.png`)});await assertPaperPixel(p,png,width/2,start+gap/2);
     if(width===1920&&index===1){
      const edge=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=1920;c.height=936;const cx=c.getContext('2d');cx.drawImage(document.querySelector('[data-project-canvas]'),0,0);const data=cx.getImageData(0,0,1920,936).data;return [192,384,576,768,960,1152,1344,1536,1728].map(x=>{for(let y=140;y<936;y++)if(data[(y*1920+x)*4+3]>200)return y;return 936})});
      // Measured from the user's recording at 19.75s, browser chrome cropped.
      const recorded=[408,406,404,402,400,398,396,395,392];const maxError=Math.max(...edge.map((y,i)=>Math.abs(y-recorded[i])));
      assert(maxError<=3,'curved edge agrees with the recorded frame within 3px: '+maxError);assert(Math.abs(start-40)<=3,'outgoing plane also matches the recording');
      report.checks.push({reference:'user clip 19.75s',edge,maxError,outgoingBottom:start,passed:true});
     }
     const films=await p.locator('[data-featured-project] video').evaluateAll(vs=>vs.map(v=>!v.paused));assert(films[index-1]&&films[index],'both visible films play in the gap');
     report.checks.push({width,gapBetween:index-1+' / '+index,pixels:Math.round(gap),gray:true,passed:true});
    }
   }
   await p.evaluate(y=>scrollTo(0,y),tracks[0]+height*.5);await p.waitForTimeout(400);
   assert(await hero.evaluate(v=>v.paused),'offscreen opening film pauses');
   await p.locator('[data-featured-project]').first().getByRole('link',{name:'View Artist Accelerator case study',exact:true}).click({position:{x:width/2,y:height/2}});
   await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='leaving');
   const frozen=p.locator('[data-page-transition] [data-featured-project]').first();const frozenRect=await frozen.boundingBox();assert(frozenRect&&frozenRect.y<height&&frozenRect.y+frozenRect.height>0,'sticky project remains visible in page transition');
   assert(await p.locator('[data-page-transition] [data-project-canvas]').count()>0,'current WebGL surface captured');assert.equal(await p.locator('[data-page-transition] [data-project-canvas]').evaluate(c=>{const x=c.getContext('2d');return x.getImageData(c.width/2,c.height/2,1,1).data[3]}),255,'captured surface contains the visible project');await p.waitForTimeout(200);await p.screenshot({path:path.join(out,'transition-'+width+'.png')});
   await p.waitForURL('**/work/artist-accelerator');await idle();assert.equal(await p.locator('[data-page-scene] h1').innerText(),'Artist Accelerator');
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('link',{name:/Company/}).click();await p.waitForURL('**/company');await idle();assert.equal(await p.getByRole('dialog').count(),0);assert.equal(await p.evaluate(()=>document.body.style.overflow),'');
   await p.goBack();await p.waitForFunction(()=>document.querySelector('[data-page-scene] h1')?.textContent==='Artist Accelerator');await idle();assert(p.url().includes('/work/artist-accelerator'));
   await p.getByRole('link',{name:'meruem home'}).click();await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='leaving');await p.emulateMedia({reducedMotion:'reduce'});await p.waitForURL(base+'/');await idle();
   await p.waitForFunction(()=>[...document.querySelectorAll('[data-home-film] video')].some(v=>v.clientWidth>0&&!v.paused));
   assert.equal(await p.locator('html').getAttribute('data-motion'),'full','OS changes do not silently disable the selected animation mode');
   await p.waitForFunction(()=>document.querySelector('[data-project-canvas]')?.closest('[data-webgl="ready"]'));
   await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(150);
   const trajectory=await p.evaluate(()=>new Promise(resolve=>{const samples=[];document.body.dispatchEvent(new WheelEvent('wheel',{deltaY:500,cancelable:true,bubbles:true}));const begin=performance.now();const sample=()=>{samples.push([performance.now()-begin,scrollY]);if(performance.now()-begin<1000)requestAnimationFrame(sample);else resolve(samples)};requestAnimationFrame(sample)}));
   assert(trajectory[0][1]<450,'wheel input eases into movement');assert(trajectory.at(-1)[1]>490,'scroll settles toward the requested distance: '+JSON.stringify(trajectory));assert(trajectory.every((s,i)=>i===0||s[1]>=trajectory[i-1][1]),'scroll trajectory is monotonic');assert(new Set(trajectory.map(s=>s[1])).size>5,'movement spans multiple rendered frames');report.checks.push({width,wheelTrajectory:trajectory,passed:true});
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('button',{name:'Reduce motion',exact:true}).click();
   assert.equal(await p.getByRole('button',{name:'Reduce motion',exact:true}).getAttribute('aria-pressed'),'true');
   assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden','motion switch preserves menu scroll lock');
   await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'detached'});
   assert(await p.locator('[data-featured-project]').evaluateAll(es=>es.every(e=>getComputedStyle(e).transform==='none'&&!e.inert)),'reduced motion removes project transforms while preserving access and autoplay');
   assert.equal(await p.locator('[data-project-canvas]').count(),0,'reduced motion removes the WebGL overlay');assert.equal(await p.locator('html').getAttribute('data-smooth-scroll'),null,'reduced motion restores native scrolling');
   assert.equal(await p.locator('main button').count(),0,'film buttons also absent with reduced motion');
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('link',{name:/Work/}).click();await p.waitForURL('**/work');await idle();assert.equal(await p.locator('[data-page-scene]').evaluate(e=>e.inert),false);
   await p.reload({waitUntil:'networkidle'});await idle();assert.equal(await p.locator('html').getAttribute('data-motion'),'reduced','explicit preference persists after reload');
   await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('button',{name:'Reduce motion',exact:true}).click();await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'detached'});
   assert.equal(await p.locator('html').getAttribute('data-motion'),'full','animations can be restored without changing the OS');
   await p.getByRole('link',{name:'meruem home'}).click();await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='leaving');await p.waitForURL(base+'/');await idle();
   await p.waitForFunction(()=>document.querySelector('[data-project-canvas]')?.closest('[data-webgl="ready"]'));await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight-innerHeight-10));await p.waitForTimeout(150);await p.mouse.wheel(0,200);await p.waitForFunction(()=>scrollY<5);await p.waitForFunction(()=>[...document.querySelectorAll('[data-home-film] video')].some(v=>v.clientWidth>0&&!v.paused));
   assert.deepEqual(errors,[]);report.checks.push({width,height,osMotion:preference,defaultMotion:'full',autoplay:true,projectPlanes:4,transitions:'case/menu/back/logo',explicitReducedMotion:true,persistentMotionSetting:true,footerLoop:true,passed:true});
   console.log('PASS scroll, grey gaps and autoplay',width,height);await p.close();
  }
  for(const width of [1440,390]){
   const p=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   for(const c of content.cases){
    await p.goto(base+'/work/'+c.slug,{waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelector('[data-page-transition]').dataset.state==='idle');const videos=p.locator('main video');
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
