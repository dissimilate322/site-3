'use client';

import {useEffect,useLayoutEffect,useRef,type ReactNode} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {gsap} from 'gsap';
import styles from './PageTransition.module.css';
import {useSiteMotion} from './MotionSettings';
import {clamp,map,mix,portalPath,portalValue} from '@/lib/reference-motion';

/** Preserve the visible page while the original portal closes around it. */
function snapshot(source:HTMLElement,host:HTMLElement){
 const copy=source.cloneNode(true) as HTMLElement;
 const original=[source,...source.querySelectorAll<HTMLElement>('*')];
 const clones=[copy,...copy.querySelectorAll<HTMLElement>('*')];
 original.forEach((node,i)=>{
  const clone=clones[i];clone.removeAttribute('id');clone.removeAttribute('inert');
  const position=getComputedStyle(node).position;
  if(position==='sticky'){
   // Freeze a sticky project at its layout position, then retain its current
   // perspective transform. offsetTop includes the sticky scroll displacement.
   const parent=node.offsetParent as HTMLElement|null;const parentRect=parent?.getBoundingClientRect();
   Object.assign(clone.style,{position:'fixed',top:(parentRect?.top??0)+node.offsetTop+scrollY+'px',left:(parentRect?.left??0)+node.offsetLeft+'px',right:'auto',bottom:'auto',width:node.offsetWidth+'px',height:node.offsetHeight+'px'});
  }else if(position==='fixed'){
   // The translated snapshot becomes the fixed containing block. Keeping fixed
   // positioning avoids counting a ScrollTrigger pin spacer's offset twice.
   const r=node.getBoundingClientRect();Object.assign(clone.style,{position:'fixed',top:r.top+scrollY+'px',left:r.left+'px',right:'auto',bottom:'auto',width:r.width+'px',height:r.height+'px'});
  }
  if(node instanceof HTMLCanvasElement&&clone instanceof HTMLCanvasElement){
   clone.width=node.width;clone.height=node.height;
   try{clone.getContext('2d')?.drawImage(node,0,0)}catch{/* A lost WebGL context retains its native-media fallback. */}
  }
  if(node instanceof HTMLVideoElement){
   if(node.readyState>=2){
    const canvas=document.createElement('canvas');canvas.width=node.videoWidth;canvas.height=node.videoHeight;
    const computed=getComputedStyle(node);
    for(const property of ['position','left','top','width','height','object-fit','transform','mask-image','mask-composite','border-radius','filter'])canvas.style.setProperty(property,computed.getPropertyValue(property));
    canvas.style.display='block';
    try{canvas.getContext('2d')?.drawImage(node,0,0);clone.replaceWith(canvas)}catch{clone.removeAttribute('autoplay')}
   }else clone.removeAttribute('autoplay');
  }
 });
 copy.querySelectorAll('[role="dialog"]').forEach(e=>e.remove());
 copy.style.visibility='visible';copy.style.transform=`translateY(${-scrollY}px)`;
 copy.className=styles.snapshot;copy.inert=true;host.replaceChildren(copy);
}

export default function PageTransition({children}:{children:ReactNode}){
 const {reduced}=useSiteMotion();const reducedRef=useRef(reduced);reducedRef.current=reduced;
 const lastPath=useRef<string|null>(null);const pathname=usePathname();const router=useRouter();
 const scene=useRef<HTMLDivElement>(null);const overlay=useRef<HTMLDivElement>(null);const sheet=useRef<HTMLDivElement>(null);const count=useRef<HTMLSpanElement>(null);
 const other=useRef<HTMLImageElement>(null);const life=useRef<HTMLImageElement>(null);
 const busy=useRef(false);const mounted=useRef(true);const timeline=useRef<gsap.core.Timeline|null>(null);const fallback=useRef<ReturnType<typeof setTimeout>|null>(null);
 const destination=useRef<string|null>(null);const clock=useRef({time:0});const direction=useRef<'enter'|'leave'>('enter');
 const paint=()=>{
  const time=clock.current.time,w=innerWidth,h=innerHeight;
  const path=portalPath(time,w,h,clamp(devicePixelRatio||1,1,2));
  if(direction.current==='leave'){
   overlay.current!.style.clipPath='none';sheet.current!.style.clipPath=`path("${path}")`;
  }else{
   // The page stays stationary and live. Only the hole in the grey overlay
   // turns in perspective, exactly as in the reference's stencil portal.
   overlay.current!.style.clipPath=`path(evenodd, "M 0 0 H ${w} V ${h} H 0 Z ${path}")`;
  }
  overlay.current!.dataset.portalTime=time.toFixed(4);
  const worldHeight=2*Math.tan(65*Math.PI/360)*5;
  const factor=mix(1.25,1.7,map(w,390,1200));const unit=(4*factor*h/worldHeight)/1024;
  const imageWidth=512*unit,imageHeight=113*unit;
  for(const [image,offset] of [[other.current,-195*portalValue('logo/offsetLeft',time)],[life.current,93*portalValue('logo/offsetRight',time)]] as const){
   if(image)Object.assign(image.style,{left:(w/2-imageWidth/2+offset*unit)+'px',top:(h/2-imageHeight/2)+'px',width:imageWidth+'px',height:imageHeight+'px'});
  }
 };
 const restore=()=>{
  const wasBusy=busy.current;timeline.current?.kill();if(fallback.current)clearTimeout(fallback.current);
  if(scene.current){scene.current.style.visibility='';scene.current.inert=false}
  if(overlay.current){overlay.current.style.display='none';overlay.current.dataset.state='idle';overlay.current.style.clipPath=''}
  sheet.current?.replaceChildren();if(wasBusy)document.body.style.overflow='';busy.current=false;
  window.dispatchEvent(new Event('site:transition-end'));
 };
 useEffect(()=>{
  mounted.current=true;
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=(event.target as Element).closest<HTMLAnchorElement>('a[href]');
   if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
   const url=new URL(link.href,location.href);
   if(url.origin!==location.origin||url.pathname===location.pathname||!/^https?:$/.test(url.protocol)||reducedRef.current)return;
   event.preventDefault();event.stopPropagation();if(busy.current)return;
   busy.current=true;destination.current=url.pathname+url.search+url.hash;router.prefetch(url.pathname);window.dispatchEvent(new Event('site:navigate'));
   snapshot(scene.current!,sheet.current!);scene.current!.style.visibility='hidden';scene.current!.inert=true;document.body.style.overflow='hidden';
   direction.current='leave';clock.current.time=2;overlay.current!.style.display='block';overlay.current!.dataset.state='leaving';count.current!.textContent='';paint();
   timeline.current?.kill();timeline.current=gsap.timeline({onComplete:()=>{
    overlay.current!.dataset.state='loading';destination.current=null;router.push(url.pathname+url.search+url.hash,{scroll:true});
   }}).to(clock.current,{time:0,duration:2/1.5,ease:'none',onUpdate:paint});
   fallback.current=setTimeout(()=>{if(mounted.current){destination.current=null;restore()}},8000);
  };
  const resize=()=>{if(busy.current)paint()};
  document.addEventListener('click',click,true);window.addEventListener('resize',resize);
  return()=>{mounted.current=false;document.removeEventListener('click',click,true);window.removeEventListener('resize',resize);timeline.current?.kill();if(fallback.current)clearTimeout(fallback.current)};
 },[router]);
 useLayoutEffect(()=>{
  const first=lastPath.current===null;const changed=lastPath.current!==pathname;lastPath.current=pathname;
  const pending=destination.current;destination.current=null;
  if(reduced){restore();if(pending)router.push(pending);return}
  if(!changed&&!busy.current)return;
  let cancelled=false;busy.current=true;direction.current='enter';clock.current.time=0;
  overlay.current!.style.display='block';overlay.current!.dataset.state='loading';sheet.current!.replaceChildren();paint();
  scene.current!.style.visibility='';scene.current!.inert=true;document.body.style.overflow='hidden';
  const header=scene.current!.querySelector('header');if(header)gsap.set(header,{opacity:0});
  const ready=async()=>{
   const firstVideo=Array.from(scene.current!.querySelectorAll('video')).find(v=>{const r=v.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight});
   const firstImage=Array.from(scene.current!.querySelectorAll<HTMLImageElement>('main img')).find(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight});
   const mediaReady=firstVideo?new Promise<void>(resolve=>{
    if(firstVideo.readyState>=2){resolve();return}
    const finish=()=>{firstVideo.removeEventListener('loadeddata',finish);resolve()};firstVideo.addEventListener('loadeddata',finish,{once:true});setTimeout(finish,1500);
   }):firstImage?firstImage.decode().catch(()=>{}):Promise.resolve();
   const progress={value:0};count.current!.textContent='0 / 100';
   const counter=gsap.to(progress,{value:100,duration:first?.75:.3,ease:'none',onUpdate:()=>{if(count.current&&!cancelled)count.current.textContent=Math.round(progress.value)+' / 100'}});
   await Promise.all([document.fonts.ready,mediaReady,new Promise(resolve=>setTimeout(resolve,first?550:0))]);
   counter.kill();if(cancelled||!mounted.current)return;count.current!.textContent='100 / 100';
   await new Promise(resolve=>setTimeout(resolve,500));if(cancelled||!mounted.current)return;
   overlay.current!.dataset.state='entering';timeline.current?.kill();
   timeline.current=gsap.timeline({onComplete:()=>{
    restore();if(header)gsap.to(header,{opacity:1,delay:.267,duration:.5,clearProps:'opacity'});
    const title=scene.current?.querySelector<HTMLElement>('h1');if(title&&scrollY===0){title.tabIndex=-1;title.focus({preventScroll:true})}
   }}).to(clock.current,{time:2,duration:2/1.5,ease:'none',onUpdate:paint},0).to(count.current,{opacity:0,duration:.5},0);
  };
  gsap.set(count.current,{opacity:1});void ready();
  return()=>{cancelled=true;if(header){gsap.killTweensOf(header);gsap.set(header,{clearProps:'opacity'})}};
 },[pathname,reduced]);
 return <><div ref={scene} id="site-content" className={styles.scene} data-page-scene>{children}</div><div ref={overlay} className={styles.overlay} aria-hidden="true" inert data-page-transition data-state="idle" data-color-theme="violet"><div className={styles.wordmark}><img ref={other} src="/assets/loading-meru.svg" alt=""/><img ref={life} src="/assets/loading-em.svg" alt=""/></div><span ref={count} className={styles.count}/><div ref={sheet} className={styles.sheet}/></div></>;
}
