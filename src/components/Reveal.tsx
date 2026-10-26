'use client';
import {useLayoutEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useSiteMotion} from './MotionSettings';
gsap.registerPlugin(ScrollTrigger);
export default function Reveal({children}:{children:React.ReactNode}){
 const {reduced}=useSiteMotion();
 const ref=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const media=gsap.matchMedia();const context=gsap.context(()=>{
   if(!reduced){
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(target=>gsap.from(target,{opacity:0,y:40,duration:.65,ease:'power2.out',scrollTrigger:{trigger:target,start:'top 95%',once:true}}));
    gsap.utils.toArray<HTMLElement>('[data-shrink]').forEach(target=>gsap.fromTo(target,{clipPath:'inset(0px 0px round 0px)'},{clipPath:()=>`inset(0px ${innerWidth>=1024?50:23}px round 8px)`,ease:'none',scrollTrigger:{trigger:target,start:'top bottom',end:'bottom center',scrub:true,invalidateOnRefresh:true}}));
   }
  },ref);
  return()=>{media.revert();context.revert()};
 },[reduced]);
 return <div ref={ref}>{children}</div>;
}
