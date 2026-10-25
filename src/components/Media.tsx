'use client';
import Image from 'next/image';
import { useEffect,useRef,useState } from 'react';
import type { Asset } from '@/data/content';
import styles from './SitePages.module.css';
export default function Media({asset,poster,autoplay=false,priority=false,className=''}:{asset:Asset;poster?:Asset|null;autoplay?:boolean;priority?:boolean;className?:string}){
 const ref=useRef<HTMLVideoElement>(null);const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const video=ref.current;if(!video||!autoplay)return;
  const query=window.matchMedia('(prefers-reduced-motion: reduce)');
  const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!query.matches)void video.play().catch(()=>{});else video.pause();},{threshold:.2});
  observer.observe(video);const change=()=>{if(query.matches)video.pause()};query.addEventListener('change',change);
  return()=>{observer.disconnect();query.removeEventListener('change',change);video.pause()};
 },[autoplay]);
 if(asset.kind!=='video')return <Image src={asset.src} alt={asset.alt.startsWith('An image uploaded')?'Project imagery':asset.alt} width={asset.width} height={asset.height} sizes="(min-width:1920px) 1820px,(min-width:1024px) calc(100vw - 100px),calc(100vw - 46px)" quality={90} priority={priority} className={className}/>;
 return <div className={`${styles.video} ${className}`}>
  <video ref={ref} poster={poster?.src} muted={autoplay} loop={autoplay} controls={!autoplay} playsInline preload={priority?'metadata':'none'} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} aria-label={asset.alt||'Project film'}>
   <source src={asset.src} type="video/mp4"/>
  </video>
  {autoplay&&<button className={styles.playToggle} aria-label={playing?'Pause video':'Play video'} onClick={()=>{if(ref.current){if(ref.current.paused)void ref.current.play().catch(()=>{});else ref.current.pause()}}}>{playing?'Pause':'Play'} film</button>}
 </div>;
}
