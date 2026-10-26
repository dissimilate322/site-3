'use client';
import Image from 'next/image';
import { useEffect,useRef } from 'react';
import type { Asset } from '@/data/content';
import styles from './SitePages.module.css';
let heroPlayer:HTMLVideoElement|null=null;let heroTime=0;
export default function Media({asset,poster,autoplay=true,priority=false,className=''}:{asset:Asset;poster?:Asset|null;autoplay?:boolean;priority?:boolean;className?:string}){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const video=ref.current;if(!video||!autoplay)return;
  let visible=false;
  const sync=()=>{if(video.closest('[data-featured-project]')&&video.closest('[data-webgl="ready"]'))return;if(visible&&!document.hidden&&getComputedStyle(video).visibility!=='hidden')void video.play().catch(()=>{});else video.pause()};
  const play=()=>{if(!asset.src.includes('/hero-')||!visible)return;if(heroPlayer&&heroPlayer!==video)heroTime=heroPlayer.currentTime;if(heroPlayer!==video&&Number.isFinite(video.duration))video.currentTime=heroTime%video.duration;heroPlayer=video};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>0;sync()},{threshold:0});
  observer.observe(video);document.addEventListener('visibilitychange',sync);video.addEventListener('loadeddata',sync);video.addEventListener('play',play);window.addEventListener('site:transition-end',sync);window.addEventListener('site:project-renderer',sync);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);video.removeEventListener('loadeddata',sync);video.removeEventListener('play',play);window.removeEventListener('site:transition-end',sync);window.removeEventListener('site:project-renderer',sync);if(heroPlayer===video){heroTime=video.currentTime;heroPlayer=null}video.pause()};
 },[autoplay,asset.src]);
 if(asset.kind!=='video')return <Image src={asset.src} alt={asset.alt.startsWith('An image uploaded')?'Project imagery':asset.alt} width={asset.width} height={asset.height} sizes="(min-width:1920px) 1820px,(min-width:1024px) calc(100vw - 100px),calc(100vw - 46px)" quality={90} priority={priority} className={className}/>;
 return <div className={`${styles.video} ${className}`}>
  <video ref={ref} poster={poster?.src} autoPlay={autoplay} muted={autoplay} loop={autoplay} controls={!autoplay} playsInline preload={priority?'auto':'metadata'} aria-label={asset.alt.startsWith('An image uploaded')?'Project film':asset.alt||'Project film'}>
   <source src={asset.src+(asset.src.includes('?')?'&':'?')+'v=hq-20261025'} type="video/mp4"/>
  </video>
 </div>;
}
