'use client';
import Image from 'next/image';
import { useEffect,useRef } from 'react';
import type { Asset } from '@/data/content';
import styles from './SitePages.module.css';
export default function Media({asset,poster,autoplay=true,priority=false,className=''}:{asset:Asset;poster?:Asset|null;autoplay?:boolean;priority?:boolean;className?:string}){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const video=ref.current;if(!video||!autoplay)return;
  let visible=false;
  const sync=()=>{if(visible&&!document.hidden&&getComputedStyle(video).visibility!=='hidden')void video.play().catch(()=>{});else video.pause()};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>0;sync()},{threshold:0});
  observer.observe(video);document.addEventListener('visibilitychange',sync);video.addEventListener('loadeddata',sync);window.addEventListener('site:transition-end',sync);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);video.removeEventListener('loadeddata',sync);window.removeEventListener('site:transition-end',sync);video.pause()};
 },[autoplay,asset.src]);
 if(asset.kind!=='video')return <Image src={asset.src} alt={asset.alt.startsWith('An image uploaded')?'Project imagery':asset.alt} width={asset.width} height={asset.height} sizes="(min-width:1920px) 1820px,(min-width:1024px) calc(100vw - 100px),calc(100vw - 46px)" quality={90} priority={priority} className={className}/>;
 return <div className={`${styles.video} ${className}`}>
  <video ref={ref} poster={poster?.src} autoPlay={autoplay} muted={autoplay} loop={autoplay} controls={!autoplay} playsInline preload={priority?'auto':'metadata'} aria-label={asset.alt.startsWith('An image uploaded')?'Project film':asset.alt||'Project film'}>
   <source src={asset.src} type="video/mp4"/>
  </video>
 </div>;
}
