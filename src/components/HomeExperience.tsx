'use client';

import {useLayoutEffect, useRef, type ReactNode} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Media from './Media';
import styles from './HomeExperience.module.css';

gsap.registerPlugin(ScrollTrigger);

/** The film, introduction and four scroll-driven project planes in the recording. */
export default function HomeExperience({children}:{children:ReactNode}) {
 const root=useRef<HTMLDivElement>(null);
 const cursor=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  const media=gsap.matchMedia();
  const context=gsap.context(()=>{
   media.add('(prefers-reduced-motion: no-preference)',()=>{
    const hero=root.current!.querySelector<HTMLElement>('[data-home-film]')!;
    gsap.fromTo(hero,{clipPath:'inset(0px 0px round 0px)'},{clipPath:()=>`inset(0 ${innerWidth<1024?15:42}px round 8px)`,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 60%',scrub:true,invalidateOnRefresh:true}});

    root.current!.querySelectorAll<HTMLElement>('[data-word-reveal]').forEach(title=>{
     gsap.from(title.querySelectorAll('[data-word]'),{opacity:0,filter:'blur(6px)',stagger:.08,duration:.6,ease:'power2.out',scrollTrigger:{trigger:title,start:'top 85%',once:true}});
    });
    const stage=root.current!.querySelector<HTMLElement>('[data-project-stage]')!;
    const panels=Array.from(stage.querySelectorAll<HTMLElement>('[data-featured-project]'));
    const contents=panels.map(p=>p.querySelector<HTMLElement>('[data-project-content]'));
    gsap.set(stage,{height:'100svh',perspective:1800});
    gsap.set(panels,{position:'absolute',inset:0,transformOrigin:'50% 50%',force3D:true});
    gsap.set(panels.slice(1),{autoAlpha:0,yPercent:100,scale:.8,rotationY:-22,rotationZ:5});
    panels.slice(1).forEach(p=>{p.inert=true});
    const entrance=gsap.fromTo(panels[0],{scale:.84,rotationY:-18,rotationZ:4},{scale:1,rotationY:0,rotationZ:0,ease:'none',scrollTrigger:{trigger:stage,start:'top bottom',end:'top top',scrub:true}});
    const timeline=gsap.timeline({scrollTrigger:{trigger:stage,start:'top top',end:()=>'+='+innerHeight*(panels.length-1)*1.35,pin:true,scrub:.35,invalidateOnRefresh:true,onUpdate:self=>{
     // Only the plane at the front accepts clicks and keyboard focus.
     const index=Math.min(panels.length-1,Math.floor(self.progress*panels.length));
     panels.forEach((panel,i)=>{panel.inert=i!==index;panel.style.pointerEvents=i===index?'auto':'none'});
    }}});
    timeline.to({},{duration:.55});
    for(let i=1;i<panels.length;i++){
     const at=timeline.duration();
     timeline.to(contents[i-1],{opacity:0,y:-10,duration:.18},at)
      .to(panels[i-1],{scale:.78,rotationY:22,rotationZ:-5,yPercent:-100,autoAlpha:0,duration:1,ease:'power1.inOut'},at)
      .to(panels[i],{autoAlpha:1,yPercent:0,scale:1,rotationY:0,rotationZ:0,duration:1,ease:'power1.inOut'},at)
      .fromTo(contents[i],{opacity:0,y:10},{opacity:1,y:0,duration:.25},at+.75)
      .to({},{duration:.55});
    }
    const clientCards=root.current!.querySelectorAll<HTMLElement>('[data-client-card]');
    gsap.from(clientCards,{opacity:0,rotationZ:20,rotationX:-95,transformPerspective:1000,transformOrigin:'50% 50%',duration:1.75,stagger:.1,ease:'power2.out',scrollTrigger:{trigger:'[data-client-grid]',start:'top 90%',toggleActions:'play none none reverse'}});
    return()=>{entrance.kill();panels.forEach(panel=>{panel.inert=false;panel.style.pointerEvents=''})};
   });
   media.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',()=>{
    const x=gsap.quickTo(cursor.current,'x',{duration:.22,ease:'power2.out'});
    const y=gsap.quickTo(cursor.current,'y',{duration:.22,ease:'power2.out'});
    root.current!.dataset.cursor='true';
    const move=(event:PointerEvent)=>{
     x(event.clientX);y(event.clientY);
     gsap.to(cursor.current,{autoAlpha:(event.target as Element).closest('[data-project-hitarea]')?1:0,duration:.18,overwrite:'auto'});
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
 },[]);
 return <div ref={root} className={styles.experience}>
  <section className={styles.hero} aria-label="Otherlife studio film" data-home-film>
   <div className={styles.landscape}><Media priority asset={{src:'/media/hero-landscape.mp4',kind:'video',width:1920,height:1080,alt:'Otherlife studio film: a phone among floating rocks'}} poster={{src:'/media/hero-landscape.jpg',kind:'image',width:1920,height:1080,alt:''}} className={styles.film}/></div>
   <div className={styles.portrait}><Media priority asset={{src:'/media/hero-portrait.mp4',kind:'video',width:720,height:1280,alt:'Otherlife studio film: a phone among floating rocks'}} poster={{src:'/media/hero-portrait.jpg',kind:'image',width:720,height:1280,alt:''}} className={styles.film}/></div>
  </section>
  {children}
  <span ref={cursor} className={styles.cursor} aria-hidden="true">View case</span>
  <section className={styles.footerFilm} aria-label="Otherlife closing film"><Media asset={{src:'/media/hero-landscape.mp4',kind:'video',width:1920,height:1080,alt:'Otherlife closing film'}} poster={{src:'/media/hero-landscape.jpg',kind:'image',width:1920,height:1080,alt:''}} className={styles.film}/></section>
 </div>;
}
