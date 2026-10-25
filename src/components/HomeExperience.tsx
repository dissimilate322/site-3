'use client';

import {useLayoutEffect, useRef, type ReactNode} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Media from './Media';
import {useSiteMotion} from './MotionSettings';
import styles from './HomeExperience.module.css';

gsap.registerPlugin(ScrollTrigger);

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
     gsap.from(title.querySelectorAll('[data-word]'),{opacity:0,filter:'blur(6px)',stagger:.08,duration:.6,ease:'power2.out',scrollTrigger:{trigger:title,start:'top 85%',once:true}});
    });
    // The reference gives every project a two-viewport track. Its plane enters
    // during one viewport of scrolling, stays centred for one, then exits while
    // the next plane enters. Independent tracks preserve the white space.
    root.current!.querySelectorAll<HTMLElement>('[data-project-track]').forEach(track=>{
     const panel=track.querySelector<HTMLElement>('[data-featured-project]')!;
     const content=panel.querySelector<HTMLElement>('[data-project-content]')!;
     const scrim=panel.querySelector<HTMLElement>('[data-project-scrim]')!;
     const timeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:track,start:'top bottom',end:'bottom top',scrub:.12,invalidateOnRefresh:true}});
     timeline.fromTo(panel,{scale:.82,rotationY:-10,rotationX:2,rotationZ:1.4,borderRadius:8,transformPerspective:1800,transformOrigin:'50% 50%',y:()=>innerHeight*.25},{scale:.85,rotationY:-4,rotationX:1,rotationZ:.3,duration:.55},0)
      .to(panel,{y:0,duration:1},0)
      .to(panel,{scale:1,rotationY:0,rotationX:0,rotationZ:0,borderRadius:0,duration:.45,ease:'power1.out'},.55)
      .to({},{duration:1},1)
      .to(panel,{scale:.85,rotationY:4,rotationX:-1,rotationZ:-.3,borderRadius:8,duration:.5},2)
      .to(panel,{scale:.82,rotationY:10,rotationX:-2,rotationZ:-1.4,duration:.5},2.5)
      .to(panel,{y:()=>-innerHeight*.25,duration:1},2)
      .fromTo(content,{opacity:0,y:10},{opacity:1,y:0,duration:.12},.88)
      .to(content,{opacity:0,y:-10,duration:.12},2)
      .fromTo(scrim,{opacity:0},{opacity:1,duration:.12},.88)
      .to(scrim,{opacity:0,duration:.12},2);
    });
    const clientCards=root.current!.querySelectorAll<HTMLElement>('[data-client-card]');
    gsap.from(clientCards,{opacity:0,rotationZ:20,rotationX:-95,transformPerspective:1000,transformOrigin:'50% 50%',duration:1.75,stagger:.1,ease:'power2.out',scrollTrigger:{trigger:'[data-client-grid]',start:'top 90%',toggleActions:'play none none reverse'}});
   }
   if(!reduced)media.add('(hover: hover) and (pointer: fine)',()=>{
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
 },[reduced]);
 return <div ref={root} className={styles.experience}>
  <section className={styles.hero} aria-label="Otherlife studio film" data-home-film>
   <div className={styles.landscape}><Media priority asset={{src:'/media/hero-landscape.mp4',kind:'video',width:1920,height:1080,alt:'Otherlife studio film: a phone among floating rocks'}} poster={{src:'/media/hero-landscape.jpg',kind:'image',width:1920,height:1080,alt:''}} className={styles.film}/></div>
   <div className={styles.portrait}><Media priority asset={{src:'/media/hero-portrait.mp4',kind:'video',width:1080,height:1920,alt:'Otherlife studio film: a phone among floating rocks'}} poster={{src:'/media/hero-portrait.jpg',kind:'image',width:720,height:1280,alt:''}} className={styles.film}/></div>
  </section>
  {children}
  <span ref={cursor} className={styles.cursor} aria-hidden="true">View case</span>
  <section className={styles.footerFilm} aria-label="Otherlife closing film"><Media asset={{src:'/media/hero-landscape.mp4',kind:'video',width:1920,height:1080,alt:'Otherlife closing film'}} poster={{src:'/media/hero-landscape.jpg',kind:'image',width:1920,height:1080,alt:''}} className={styles.film}/></section>
 </div>;
}
