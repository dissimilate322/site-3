'use client';

import {useLayoutEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useSiteMotion} from './MotionSettings';
import {clamp,scrollDamping} from '@/lib/reference-motion';
import styles from './SmoothScroll.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll(){
 const {reduced}=useSiteMotion();const pathname=usePathname();const bar=useRef<HTMLDivElement>(null);const thumb=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  if(reduced)return;
  let target=scrollY,position=scrollY,written=scrollY,active=false,blocked=false,dragging=false,touchY=0,touchDelta=0;
  let hide:ReturnType<typeof setTimeout>|undefined;
  const maximum=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  const locked=()=>blocked||document.body.style.overflow==='hidden'||document.querySelector('[data-page-transition]')?.getAttribute('data-state')!=='idle';
  const show=()=>{gsap.to(bar.current,{opacity:1,duration:.2,overwrite:true});if(hide)clearTimeout(hide);hide=setTimeout(()=>{if(!dragging)gsap.to(bar.current,{opacity:0,duration:.5,overwrite:true})},500)};
  const nested=(event:Event,delta:number)=>{
   let node=event.target instanceof HTMLElement?event.target:null;
   if(node?.closest('input,textarea,select,[contenteditable="true"]'))return true;
   for(;node&&node!==document.body;node=node.parentElement){const style=getComputedStyle(node);if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight&&((delta>0&&node.scrollTop+node.clientHeight<node.scrollHeight)||(delta<0&&node.scrollTop>0)))return true}
   return false;
  };
  const add=(delta:number)=>{
   if(!active){position=scrollY;target=scrollY}
   const max=maximum();const footer=document.querySelector<HTMLElement>('[data-closing-film]');const loop=pathname==='/'&&footer&&footer.getBoundingClientRect().top<innerHeight;
   target=clamp(target+delta,0,max+(loop?10000:0));active=true;show();
  };
  const wheel=(event:WheelEvent)=>{
   if(locked()||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||nested(event,event.deltaY))return;
   event.preventDefault();const unit=event.deltaMode===1?100/6:event.deltaMode===2?innerHeight:1;add(event.deltaY*unit);
  };
  const key=(event:KeyboardEvent)=>{
   if(locked()||event.ctrlKey||event.metaKey||event.altKey||nested(event,1)||(event.target as Element).closest('button,a,input,textarea,select,[contenteditable]'))return;
   const delta=event.code==='ArrowDown'?100:event.code==='ArrowUp'?-100:event.code==='PageDown'?innerHeight*.9:event.code==='PageUp'?-innerHeight*.9:event.code==='Space'?(event.shiftKey?-1:1)*innerHeight*.9:null;
   if(delta!==null){event.preventDefault();add(delta)}else if(event.code==='Home'||event.code==='End'){event.preventDefault();add((event.code==='Home'?0:maximum())-target)}
  };
  const start=(event:TouchEvent)=>{if(event.touches.length===1){touchY=event.touches[0].clientY;touchDelta=0}};
  const move=(event:TouchEvent)=>{if(event.touches.length!==1||locked())return;const y=event.touches[0].clientY;const delta=(touchY-y)*2;touchY=y;if(nested(event,delta))return;event.preventDefault();touchDelta=delta;add(delta)};
  const end=()=>{if(touchDelta&&!locked()){add(touchDelta);touchDelta=0}};
  const scroll=()=>{if(Math.abs(scrollY-written)>2){target=position=written=scrollY;active=false}};
  const stop=()=>{blocked=true;target=position=written=scrollY;active=false;gsap.to(bar.current,{opacity:0,duration:.2})};
  const resume=()=>{blocked=false;target=position=written=scrollY;active=false};
  const tick=(_time:number,deltaMs:number)=>{
   const max=maximum();
   if(active&&!locked()){
    position+=(target-position)*scrollDamping(Math.min(deltaMs/1000,.1));
    if(pathname==='/'&&target>max&&position>=max){position=target=0;window.dispatchEvent(new Event('site:scroll-loop'))}
    if(Math.abs(target-position)<.05){position=target;active=false}
    window.scrollTo(0,Math.round(clamp(position,0,max)));written=scrollY;ScrollTrigger.update();
   }
   const progress=max?clamp(scrollY/max):0;
   if(thumb.current)thumb.current.style.transform=`translateY(${progress*150-25}px)`;
   if(bar.current)bar.current.setAttribute('aria-valuenow',String(Math.round(progress*100)));
  };
  const drag=(event:PointerEvent)=>{if(!dragging)return;const rect=bar.current!.getBoundingClientRect();target=position=maximum()*clamp((event.clientY-rect.top)/rect.height);window.scrollTo(0,target);written=scrollY;active=false;show();event.preventDefault()};
  const down=(event:PointerEvent)=>{if(locked())return;dragging=true;bar.current?.setPointerCapture(event.pointerId);drag(event)};
  const up=()=>{dragging=false;show()};
  document.documentElement.dataset.smoothScroll='ready';
  window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);window.addEventListener('touchstart',start,{passive:true});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',end);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('site:navigate',stop);window.addEventListener('site:transition-end',resume);
  const element=bar.current;element?.addEventListener('pointerdown',down);element?.addEventListener('pointermove',drag);element?.addEventListener('pointerup',up);element?.addEventListener('pointercancel',up);gsap.ticker.add(tick,false,true);
  return()=>{
   gsap.ticker.remove(tick);if(hide)clearTimeout(hide);delete document.documentElement.dataset.smoothScroll;
   window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('touchstart',start);window.removeEventListener('touchmove',move);window.removeEventListener('touchend',end);window.removeEventListener('scroll',scroll);window.removeEventListener('site:navigate',stop);window.removeEventListener('site:transition-end',resume);
   element?.removeEventListener('pointerdown',down);element?.removeEventListener('pointermove',drag);element?.removeEventListener('pointerup',up);element?.removeEventListener('pointercancel',up);gsap.killTweensOf(element);
  };
 },[reduced,pathname]);
 if(reduced)return null;
 return <div ref={bar} className={styles.track} data-color-theme={pathname==='/'?'ivory-burgundy':undefined} role="scrollbar" aria-label="Page scroll" aria-orientation="vertical" aria-controls="site-content" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} tabIndex={0}><div ref={thumb} className={styles.thumb}/></div>;
}
