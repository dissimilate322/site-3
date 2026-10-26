'use client';

import {useEffect,useRef,useState} from 'react';
import {useSiteMotion} from './MotionSettings';
import sequence from '@/data/hero-sequence.json';
import {heroContact} from '@/data/hero-contact';
import styles from './ScrollVideoHero.module.css';

const blobs=new Map<number,Blob>();
const clamp=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n));
const url=(frame:number)=>`/media/meruem-hero/frames/frame_${String(frame).padStart(4,'0')}.webp`;
type Frame=ImageBitmap|HTMLImageElement;

function ContactLinks({actions,onNotice}:{actions:React.RefObject<HTMLDivElement|null>;onNotice:()=>void}){
 return <div ref={actions} className={styles.actions} aria-label="Контакты Алексея" inert>
  {heroContact.resumeUrl?<a className={`${styles.hotspot} ${styles.resume}`} href={heroContact.resumeUrl} download><span className={styles.label}>Скачать резюме</span></a>:<button type="button" className={`${styles.hotspot} ${styles.resume}`} onClick={onNotice}><span className={styles.label}>Скачать резюме</span></button>}
  <a className={`${styles.hotspot} ${styles.email}`} href={`mailto:${heroContact.email}`} aria-label={`Почта: ${heroContact.email}`}><span className={styles.label}>Почта</span></a>
  <a className={`${styles.hotspot} ${styles.telegram}`} href={heroContact.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram: @dissimilate322666"><span className={styles.label}>Telegram</span></a>
 </div>;
}

/** Skill-based progressive WebP scrubbing; no video seeking or per-frame React updates. */
export default function ScrollVideoHero({final=false}:{final?:boolean}){
 const {reduced}=useSiteMotion();const still=final||reduced;
 const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),poster=useRef<HTMLImageElement>(null),actions=useRef<HTMLDivElement>(null);
 const [notice,setNotice]=useState(false);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(false),6000);return()=>clearTimeout(timer)},[notice]);
 useEffect(()=>{
  const element=root.current!,view=stage.current!,surface=canvas.current!,image=poster.current!,links=actions.current!;
  const context=surface.getContext('2d',{alpha:false});
  const last=sequence.frameCount-1;
  let disposed=false,visible=true,raf=0,previous=0,current=still?last:0,target=current,width=0,height=0,dpr=1,dirty=true;
  let box={x:0,y:0,width:0,height:0};
  const controller=new AbortController();
  const bitmaps=new Map<number,Frame>(),decoding=new Set<number>(),requested=new Set<number>(),failed=new Set<number>();
  const queue:number[]=[];let active=0,started=false;
  const release=(frame:Frame)=>{if('close' in frame)frame.close()};
  const contactReady=(ready:boolean)=>{view.dataset.contactReady=String(ready);links.inert=!ready};
  const resize=()=>{
   width=view.clientWidth;height=view.clientHeight;dpr=Math.min(devicePixelRatio||1,2);
   const mobile=width<768;const area={x:0,y:mobile?height*.08:0,width,height:mobile?height*.66:height};
   const scale=mobile?Math.min(area.width/sequence.width,area.height/sequence.height):Math.max(area.width/sequence.width,area.height/sequence.height);
   box={x:(width-sequence.width*scale)/2,y:area.y+(area.height-sequence.height*scale)/2,width:sequence.width*scale,height:sequence.height*scale};
   const rectangle={left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px'};
   Object.assign(image.style,rectangle,{objectFit:'fill'});Object.assign(links.style,rectangle);
   surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);context?.setTransform(dpr,0,0,dpr,0,0);
   view.dataset.geometryReady='true';dirty=true;wake();
  };
  const touch=(index:number)=>{const frame=bitmaps.get(index);if(frame){bitmaps.delete(index);bitmaps.set(index,frame)}return frame};
  const decode=(index:number)=>{
   if(disposed||failed.has(index)||bitmaps.has(index)||decoding.has(index)||decoding.size>=3)return;
   const blob=blobs.get(index);if(!blob){prioritize(index);return}
   decoding.add(index);
   const decoded=typeof createImageBitmap==='function'?createImageBitmap(blob,{resizeWidth:width<768?1280:sequence.width,resizeQuality:'high'}):new Promise<HTMLImageElement>((resolve,reject)=>{
    const i=new Image(),src=URL.createObjectURL(blob);i.onload=()=>{URL.revokeObjectURL(src);resolve(i)};i.onerror=()=>{URL.revokeObjectURL(src);reject(new Error('frame decode'))};i.src=src;
   });
   void decoded.then(frame=>{
    if(disposed){release(frame);return}bitmaps.set(index,frame);
    while(bitmaps.size>10){const victim=[...bitmaps.keys()].find(n=>Math.abs(n-current)>2&&n!==index);if(victim===undefined)break;release(bitmaps.get(victim)!);bitmaps.delete(victim)}
    dirty=true;wake();
   }).catch(()=>{failed.add(index);dirty=true;wake()}).finally(()=>decoding.delete(index));
  };
  const pump=()=>{
   while(!disposed&&active<4&&queue.length){
    const index=queue.shift()!;active++;
    const request=blobs.has(index)?Promise.resolve(blobs.get(index)!):fetch(url(index),{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('frame '+index);return r.blob()}).catch(error=>{if(index!==0&&index!==last)throw error;return fetch(`/media/meruem-hero/${index===0?'first':'last'}.webp`,{signal:controller.signal}).then(r=>{if(!r.ok)throw error;return r.blob()})});
    void request.then(blob=>{
     if(disposed)return;blobs.set(index,blob);view.dataset.loadedFrames=String(blobs.size);
     if(index===0||index===last||Math.abs(index-current)<9)decode(index);
     if(!started){started=true;for(let i=0;i<=last;i+=8)enqueue(i);enqueue(last);for(let i=0;i<=last;i++)enqueue(i)}
    }).catch(()=>{if(!disposed)failed.add(index)}).finally(()=>{
     active--;if(!disposed){if(!started){started=true;for(let i=1;i<=last;i++)enqueue(i)}pump()}
    });
   }
  };
  const enqueue=(index:number)=>{if(!requested.has(index)){requested.add(index);queue.push(index)}};
  const prioritize=(index:number)=>{
   if(disposed||failed.has(index))return;
   if(blobs.has(index)){decode(index);return}
   const queued=queue.indexOf(index);if(queued>=0)queue.splice(queued,1);
   if(queued>=0||!requested.has(index)){requested.add(index);queue.unshift(index)}pump();
  };
  const tick=(now:number)=>{
   raf=0;if(disposed||!visible||document.hidden||still||!context)return;
   const dt=previous?Math.min((now-previous)/1000,.1):1/60;previous=now;
   const travel=Math.max(1,element.offsetHeight-view.offsetHeight);
   target=clamp(-element.getBoundingClientRect().top/travel/.85)*last;
   // Native scrolling rounds CSS pixels; still reach the exact endpoint.
   if(target>last-.05)target=last;else if(target<.05)target=0;
   current+=(target-current)*(1-Math.exp(-dt*9));if(Math.abs(target-current)<.01)current=target;
   const lower=Math.floor(current),upper=Math.min(last,lower+1),fraction=current-lower;
   decode(lower);decode(upper);
   for(let step=1;step<=4;step++){decode(Math.min(last,upper+step));decode(Math.max(0,lower-step))}
   const available=[...bitmaps.keys()];
   const nearest=available.sort((a,b)=>Math.abs(a-current)-Math.abs(b-current))[0];
   const low=touch(lower)||touch(nearest),high=touch(upper);
   if(low&&(dirty||current!==target||view.dataset.frame!==String(lower))){
    context.setTransform(dpr,0,0,dpr,0,0);context.globalAlpha=1;context.fillStyle='#d7d7d4';context.fillRect(0,0,width,height);
    context.drawImage(low,box.x,box.y,box.width,box.height);
    if(high&&bitmaps.has(lower)&&fraction>0){context.globalAlpha=fraction;context.drawImage(high,box.x,box.y,box.width,box.height)}
    context.globalAlpha=1;view.dataset.canvasReady='true';view.dataset.frame=String(bitmaps.has(lower)?lower:nearest);view.dataset.playhead=current.toFixed(3);dirty=false;
   }
   view.dataset.targetFrame=String(Math.round(target));contactReady(current>=last-.05&&bitmaps.has(last)&&target===last);
   if(current!==target||(!bitmaps.has(lower)&&!failed.has(lower))||(!bitmaps.has(upper)&&!failed.has(upper)))wake();
  };
  function wake(){if(!raf&&!disposed&&!still&&visible&&!document.hidden)raf=requestAnimationFrame(tick)}
  const scroll=()=>{const bounds=element.getBoundingClientRect();if(bounds.bottom>0&&bounds.top<innerHeight){visible=true;wake()}};
  const visibility=()=>{previous=0;if(!document.hidden)wake()};
  const loop=()=>{current=target=0;dirty=true;contactReady(false);wake()};
  resize();contactReady(still);
  if(still){view.dataset.frame=String(last);window.addEventListener('resize',resize);return()=>{disposed=true;window.removeEventListener('resize',resize);delete view.dataset.geometryReady}}
  view.dataset.frameCount=String(sequence.frameCount);view.dataset.fps=String(sequence.fps);
  enqueue(0);pump();
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;previous=0;if(visible)wake()},{rootMargin:'100px'});observer.observe(element);
  window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);window.addEventListener('site:scroll-loop',loop);document.addEventListener('visibilitychange',visibility);
  wake();
  return()=>{disposed=true;controller.abort();observer.disconnect();cancelAnimationFrame(raf);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);window.removeEventListener('site:scroll-loop',loop);document.removeEventListener('visibilitychange',visibility);bitmaps.forEach(release);bitmaps.clear();delete view.dataset.canvasReady;delete view.dataset.geometryReady};
 },[still]);
 return <section ref={root} className={`${styles.track} ${still?styles.static:''}`} data-home-film={final?undefined:true} data-closing-film={final?true:undefined} data-scroll-video={final?'final':'hero'} aria-label={final?'Контакты Алексея':'Алексей — комплексный маркетинг. Прокрутите страницу, чтобы посмотреть презентацию.'}>
  <p className={styles.description}>Алексей. 6 лет опыта в маркетинге. Привлечение инвестиций в частный бизнес, маркетинговые стратегии, сайты и рекламные кампании.</p>
  <div ref={stage} className={styles.stage}>
   {/* The source poster remains visible until the first canvas draw succeeds. */}
   <img ref={poster} className={styles.poster} src={`/media/meruem-hero/${still?'last':'first'}.webp`} width={sequence.width} height={sequence.height} alt={final?'Алексей. 6 лет опыта в маркетинге. Контакты на экране ноутбука.':''} fetchPriority={final?'auto':'high'} />
   <canvas ref={canvas} className={styles.canvas} aria-hidden="true" data-hero-canvas />
   <ContactLinks actions={actions} onNotice={()=>setNotice(true)}/>
   {notice&&<p className={styles.notice} role="status">Резюме пока не опубликовано. Напишите мне на почту.</p>}
  </div>
 </section>;
}
