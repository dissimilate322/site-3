'use client';

import {useEffect,useLayoutEffect,useRef,type ReactNode} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {gsap} from 'gsap';
import styles from './PageTransition.module.css';
import {useSiteMotion} from './MotionSettings';

/** Freeze only the visible page while its plane turns over the grey wordmark. */
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
  if(node instanceof HTMLVideoElement){
   if(node.readyState>=2){
    const canvas=document.createElement('canvas');canvas.width=node.videoWidth;canvas.height=node.videoHeight;
    const computed=getComputedStyle(node);
    for(const property of ['position','left','top','width','height','object-fit','transform','mask-image','mask-composite','border-radius'])canvas.style.setProperty(property,computed.getPropertyValue(property));
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
 const lastPath=useRef<string|null>(null);
 const pathname=usePathname();const router=useRouter();
 const scene=useRef<HTMLDivElement>(null);const overlay=useRef<HTMLDivElement>(null);const sheet=useRef<HTMLDivElement>(null);const count=useRef<HTMLSpanElement>(null);
 const busy=useRef(false);const mounted=useRef(true);const timeline=useRef<gsap.core.Timeline|null>(null);const fallback=useRef<ReturnType<typeof setTimeout>|null>(null);
 const destination=useRef<string|null>(null);
 const restore=()=>{
  const wasBusy=busy.current;
  timeline.current?.kill();
  if(fallback.current)clearTimeout(fallback.current);
  if(scene.current){scene.current.style.visibility='';scene.current.inert=false}
  if(overlay.current){overlay.current.style.display='none';overlay.current.dataset.state='idle'}
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
   if(url.origin!==location.origin||url.pathname===location.pathname||!/^https?:$/.test(url.protocol))return;
   if(reducedRef.current)return;
   event.preventDefault();event.stopPropagation();if(busy.current)return;
   busy.current=true;destination.current=url.pathname+url.search+url.hash;router.prefetch(url.pathname);window.dispatchEvent(new Event('site:navigate'));
   snapshot(scene.current!,sheet.current!);
   scene.current!.style.visibility='hidden';scene.current!.inert=true;document.body.style.overflow='hidden';
   overlay.current!.style.display='block';overlay.current!.dataset.state='leaving';count.current!.textContent='';
   gsap.set(sheet.current,{scale:1,rotationY:0,rotationZ:0,borderRadius:0,autoAlpha:1});
   timeline.current=gsap.timeline({onComplete:()=>{
    overlay.current!.dataset.state='loading';
    destination.current=null;router.push(url.pathname+url.search+url.hash,{scroll:true});
   }}).to(sheet.current,{scale:.48,rotationY:-42,rotationZ:-12,borderRadius:32,duration:.65,ease:'power2.inOut'})
    .to(sheet.current,{scale:0,rotationY:-65,rotationZ:-18,duration:.35,ease:'power2.in'});
   // A failed navigation must never leave the site covered or the body locked.
   fallback.current=setTimeout(()=>{if(mounted.current){destination.current=null;restore()}},8000);
  };
  document.addEventListener('click',click,true);
  return()=>{mounted.current=false;document.removeEventListener('click',click,true);timeline.current?.kill();if(fallback.current)clearTimeout(fallback.current)};
 // Router is stable; click reads the current URL at the time of navigation.
 },[router]);

 useLayoutEffect(()=>{
  const changed=lastPath.current!==pathname;lastPath.current=pathname;
  const pending=destination.current;
  destination.current=null;
  if(reduced){restore();if(pending)router.push(pending);return}
  // Strict Mode repeats layout effects during startup. Restart an unfinished
  // entrance, but do not replay the page when motion is simply re-enabled.
  if(!changed&&!busy.current)return;
  let cancelled=false;
  busy.current=true;overlay.current!.style.display='block';overlay.current!.dataset.state='loading';
  scene.current!.style.visibility='hidden';scene.current!.inert=true;document.body.style.overflow='hidden';
  gsap.set(sheet.current,{autoAlpha:0});
  const ready=async()=>{
   const firstVideo=Array.from(scene.current!.querySelectorAll('video')).find(v=>v.getBoundingClientRect().width>0);
   const firstImage=Array.from(scene.current!.querySelectorAll<HTMLImageElement>('main img')).find(i=>i.getBoundingClientRect().top<innerHeight);
   const mediaReady=firstVideo?new Promise<void>(resolve=>{
    if(firstVideo.readyState>=2){resolve();return}
    const finish=()=>{firstVideo.removeEventListener('loadeddata',finish);resolve()};
    firstVideo.addEventListener('loadeddata',finish,{once:true});setTimeout(finish,900);
   }):firstImage?firstImage.decode().catch(()=>{}):Promise.resolve();
   let done=0;count.current!.textContent='0 / 100';
   await Promise.all([document.fonts.ready,mediaReady].map(p=>Promise.resolve(p).then(()=>{if(!cancelled&&count.current)count.current.textContent=(++done*50)+' / 100'})));
   if(cancelled||!mounted.current)return;
   // Let the route's layout effects settle before capturing the incoming plane.
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   if(cancelled)return;
   snapshot(scene.current!,sheet.current!);overlay.current!.dataset.state='entering';
   timeline.current?.kill();
   timeline.current=gsap.timeline({onComplete:()=>{
    restore();
    const title=scene.current?.querySelector<HTMLElement>('h1');
    if(title&&scrollY===0){title.tabIndex=-1;title.focus({preventScroll:true})}
   }}).fromTo(sheet.current,{autoAlpha:1,scale:.08,rotationY:48,rotationZ:12,borderRadius:28},{scale:1,rotationY:0,rotationZ:0,borderRadius:0,duration:1.1,ease:'power3.inOut'});
  };
  void ready();
  return()=>{cancelled=true};
 },[pathname,reduced]);

 return <><div ref={scene} className={styles.scene} data-page-scene>{children}</div><div ref={overlay} className={styles.overlay} aria-hidden="true" inert data-page-transition data-state="idle"><span className={styles.wordmark}>Otherlife</span><span ref={count} className={styles.count}/><div ref={sheet} className={styles.sheet}/></div></>;
}
