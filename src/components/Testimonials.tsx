'use client';
import {useState,useRef,useEffect} from 'react';
import type {Testimonial} from '@/data/content';
import Media from './Media';
import styles from './SitePages.module.css';
export default function Testimonials({items}:{items:Testimonial[]}){
 const [index,setIndex]=useState(0);const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  let timer:ReturnType<typeof setInterval>|undefined;
  const query=window.matchMedia('(prefers-reduced-motion: reduce)');
  const observer=new IntersectionObserver(([e])=>{if(timer)clearInterval(timer);if(e.isIntersecting&&!query.matches)timer=setInterval(()=>setIndex(i=>(i+1)%items.length),5000);});
  if(ref.current)observer.observe(ref.current);return()=>{observer.disconnect();if(timer)clearInterval(timer)};
 },[items.length]);
 const q=items[index];
 return <section ref={ref} className={`${styles.container} ${styles.testimonials}`} aria-label="Testimonials" aria-roledescription="carousel">
  <h2 className={styles.label}>Testimonials</h2>
  <div className={styles.quote} aria-live="off"><blockquote key={index}>{q.quote}</blockquote><div className={styles.quoteAuthor}>{q.image&&<Media asset={q.image}/>}<p>{q.author}<br/><span>{q.role} @ {q.company}</span></p></div></div>
  <div className={styles.sliderControls}><button aria-label="Previous testimonial" onClick={()=>setIndex(i=>(i-1+items.length)%items.length)}>←</button><div>{items.map((_,i)=><button key={i} aria-label={`Testimonial ${i+1}`} aria-pressed={i===index} className={i===index?styles.currentDot:''} onClick={()=>setIndex(i)}/>)}</div><button aria-label="Next testimonial" onClick={()=>setIndex(i=>(i+1)%items.length)}>→</button></div>
 </section>;
}
