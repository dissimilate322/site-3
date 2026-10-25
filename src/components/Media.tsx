'use client';
import Image from 'next/image';
import { useEffect,useRef,useState } from 'react';
import type { Asset } from '@/data/content';
import styles from './SitePages.module.css';
export default function Media({asset,poster,autoplay=true,priority=false,className=''}:{asset:Asset;poster?:Asset|null;autoplay?:boolean;priority?:boolean;className?:string}){
 const ref=useRef<HTMLVideoElement>(null);const manualPause=useRef(false);const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const video=ref.current;if(!video||!autoplay)return;
  // Production autoplay can begin before React attaches the play listener.
  setPlaying(!video.paused);
  const query=window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false;
  const sync=()=>{if(visible&&!query.matches&&!document.hidden&&!manualPause.current)void video.play().then(()=>setPlaying(!video.paused)).catch(()=>setPlaying(false));else{video.pause();setPlaying(false)}};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.15});
  observer.observe(video);query.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  return()=>{observer.disconnect();query.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);video.pause()};
 },[autoplay,asset.src]);
 if(asset.kind!=='video')return <Image src={asset.src} alt={asset.alt.startsWith('An image uploaded')?'Project imagery':asset.alt} width={asset.width} height={asset.height} sizes="(min-width:1920px) 1820px,(min-width:1024px) calc(100vw - 100px),calc(100vw - 46px)" quality={90} priority={priority} className={className}/>;
 return <div className={`${styles.video} ${className}`}>
  <video ref={ref} poster={poster?.src} autoPlay={autoplay} muted={autoplay} loop={autoplay} controls={!autoplay} playsInline preload={priority?'auto':'metadata'} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} aria-label={asset.alt.startsWith('An image uploaded')?'Project film':asset.alt||'Project film'}>
   <source src={asset.src} type="video/mp4"/>
  </video>
  {autoplay&&<button className={styles.playToggle} aria-label={playing?'Pause video':'Play video'} onClick={()=>{if(ref.current){manualPause.current=!ref.current.paused;if(ref.current.paused)void ref.current.play().catch(()=>{});else ref.current.pause()}}}>{playing?'Pause':'Play'} film</button>}
 </div>;
}
