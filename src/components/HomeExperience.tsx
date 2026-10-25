'use client';

import {useLayoutEffect, useRef, type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Media from './Media';
import {useSiteMotion} from './MotionSettings';
import styles from './HomeExperience.module.css';

gsap.registerPlugin(ScrollTrigger);
const ProjectSurface=dynamic(()=>import('./ProjectSurface'),{ssr:false});

/** The film, introduction and four scroll-driven project planes in the recording. */
export default function HomeExperience({children}:{children:ReactNode}) {
 const {reduced}=useSiteMotion();
 const root=useRef<HTMLDivElement>(null);
 const cursor=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  const media=gsap.matchMedia();
  const context=gsap.context(()=>{
   if(!reduced){
    const hero=root.current!.querySelector<HTMLElement>('[data-home-film]')!;
    gsap.fromTo(hero,{clipPath:'inset(0px 0px round 0px)'},{clipPath:()=>`inset(0 ${innerWidth<1024?15:42}px round 8px)`,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 60%',scrub:true,invalidateOnRefresh:true}});

    root.current!.querySelectorAll<HTMLElement>('[data-word-reveal]').forEach(title=>{
     const lines=title.querySelectorAll('[data-word-line]');
     const timeline=gsap.timeline({scrollTrigger:{trigger:title,start:'top bottom',once:true}});
     (lines.length?Array.from(lines):[title]).forEach((line,i)=>timeline.from(line.querySelectorAll('[data-word]'),{opacity:0,filter:'blur(6px)',stagger:.1,duration:.5,ease:'power2.out'},i*.5));
    });
    const footer=root.current!.querySelector<HTMLElement>('[data-closing-film]')!;
    gsap.fromTo(footer,{clipPath:()=>`inset(0 ${innerWidth<1024?15:42}px round 8px)`},{clipPath:'inset(0px 0px round 0px)',ease:'none',scrollTrigger:{trigger:footer,start:'top bottom',end:'top top',scrub:true,invalidateOnRefresh:true}});
    const clientCards=root.current!.querySelectorAll<HTMLElement>('[data-client-card]');
    gsap.from(clientCards,{opacity:0,rotationZ:20,rotationX:-95,transformPerspective:1000,transformOrigin:'50% 50%',duration:1.75,stagger:.13,ease:'power2.out',scrollTrigger:{trigger:'[data-client-grid]',start:'top bottom',toggleActions:'play none none reverse'}});
   }
   if(!reduced)media.add('(hover: hover) and (pointer: fine)',()=>{
    const x=gsap.quickTo(cursor.current,'x',{duration:.22,ease:'power2.out'});
    const y=gsap.quickTo(cursor.current,'y',{duration:.22,ease:'power2.out'});
    root.current!.dataset.cursor='true';
    const move=(event:PointerEvent)=>{
     x(event.clientX);y(event.clientY);
     const hit=(event.target as Element).closest('[data-project-hitarea]');
     gsap.to(cursor.current,{autoAlpha:hit?.closest('[data-project-track]')?.getAttribute('data-project-phase')==='hold'?1:0,duration:.18,overwrite:'auto'});
    };
    const leave=()=>gsap.to(cursor.current,{autoAlpha:0,duration:.18});
    root.current!.addEventListener('pointermove',move);root.current!.addEventListener('pointerleave',leave);
    window.addEventListener('site:navigate',leave);
    return()=>{root.current?.removeEventListener('pointermove',move);root.current?.removeEventListener('pointerleave',leave);window.removeEventListener('site:navigate',leave);delete root.current?.dataset.cursor;x.tween.kill();y.tween.kill()};
   });
  },root);
  const refresh=()=>ScrollTrigger.refresh();
  document.fonts.ready.then(refresh);
  window.addEventListener('load',refresh);
  return()=>{window.removeEventListener('load',refresh);media.revert();context.revert()};
 },[reduced]);
 return <div ref={root} className={styles.experience}>
  <section className={styles.hero} aria-label="meruem studio film" data-home-film>
   <div className={styles.landscape}><Media priority asset={{src:'/media/hero-landscape.mp4',kind:'video',width:1920,height:1080,alt:'meruem studio film: a phone among floating rocks'}} poster={{src:'/media/hero-landscape.jpg',kind:'image',width:1920,height:1080,alt:''}} className={styles.film}/></div>
   <div className={styles.portrait}><Media priority asset={{src:'/media/hero-portrait.mp4',kind:'video',width:1080,height:1920,alt:'meruem studio film: a phone among floating rocks'}} poster={{src:'/media/hero-portrait.jpg',kind:'image',width:720,height:1280,alt:''}} className={styles.film}/></div>
  </section>
  {children}
  <ProjectSurface root={root}/>
  <span ref={cursor} className={styles.cursor} aria-hidden="true">View case</span>
  <section className={`${styles.hero} ${styles.footerFilm}`} data-closing-film aria-label="meruem closing film">
   <div className={styles.landscape}><Media asset={{src:'/media/hero-landscape.mp4',kind:'video',width:1920,height:1080,alt:'meruem closing film'}} poster={{src:'/media/hero-landscape.jpg',kind:'image',width:1920,height:1080,alt:''}} className={styles.film}/></div>
   <div className={styles.portrait}><Media asset={{src:'/media/hero-portrait.mp4',kind:'video',width:1080,height:1920,alt:'meruem closing film'}} poster={{src:'/media/hero-portrait.jpg',kind:'image',width:720,height:1280,alt:''}} className={styles.film}/></div>
  </section>
 </div>;
}
