'use client';

import {useEffect,useRef,type RefObject} from 'react';
import * as THREE from 'three';
import {gsap} from 'gsap';
import {useSiteMotion} from './MotionSettings';
import {projectFrame,mix} from '@/lib/reference-motion';
import {projectVertex,projectFragment} from '@/lib/project-shaders';
import styles from './HomeExperience.module.css';

type Plane={track:HTMLElement;panel:HTMLElement;content:HTMLElement;scrim:HTMLElement;hit:HTMLElement;video:HTMLVideoElement;mesh:THREE.Mesh<THREE.PlaneGeometry,THREE.ShaderMaterial>;texture:THREE.VideoTexture;poster:THREE.Texture;visible:boolean;contentVisible:boolean;autoplay:boolean;guard:()=>void};

export default function ProjectSurface({root}:{root:RefObject<HTMLDivElement|null>}){
 const canvas=useRef<HTMLCanvasElement>(null);const {reduced}=useSiteMotion();
 useEffect(()=>{
  const element=root.current,target=canvas.current;if(!element||!target||reduced)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({canvas:target,alpha:true,antialias:false,stencil:false,powerPreference:'high-performance',preserveDrawingBuffer:true})}catch{return}
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(65,1,.1,1000);camera.position.z=5;
  const geometry=new THREE.PlaneGeometry(1,1,50,50);const loader=new THREE.TextureLoader();const planes:Plane[]=[];
  let width=innerWidth,height=innerHeight,worldHeight=0,worldWidth=0,disposed=false,lastScroll=scrollY;
  element.querySelectorAll<HTMLElement>('[data-project-track]').forEach(track=>{
   const panel=track.querySelector<HTMLElement>('[data-featured-project]')!;
   const video=panel.querySelector<HTMLVideoElement>('video')!;
   const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.NoColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
   const poster=loader.load(video.poster);poster.colorSpace=THREE.SRGBColorSpace;
   const material=new THREE.ShaderMaterial({vertexShader:projectVertex,fragmentShader:projectFragment,transparent:true,side:THREE.DoubleSide,depthTest:false,uniforms:{
    topLeft:{value:new THREE.Vector3()},topRight:{value:new THREE.Vector3()},bottomLeft:{value:new THREE.Vector3()},bottomRight:{value:new THREE.Vector3()},
    videoMap:{value:texture},posterMap:{value:poster},isVideo:{value:0},imageSize:{value:new THREE.Vector2(1920,1080)},planeSize:{value:new THREE.Vector2()},resolution:{value:new THREE.Vector2()},pixelRadius:{value:8},fieldOfView:{value:1},shutterAngle:{value:1},
   }});
   const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=planes.length;scene.add(mesh);
   const autoplay=video.autoplay;video.autoplay=false;video.pause();
   const plane:Plane={track,panel,video,mesh,texture,poster,visible:false,contentVisible:false,autoplay,guard:()=>{},content:panel.querySelector<HTMLElement>('[data-project-content]')!,scrim:panel.querySelector<HTMLElement>('[data-project-scrim]')!,hit:panel.querySelector<HTMLElement>('[data-project-hitarea]')!};
   plane.guard=()=>{if(!plane.visible||document.hidden)video.pause()};video.addEventListener('play',plane.guard);
   gsap.set([plane.content,plane.scrim],{opacity:0});planes.push(plane);
  });
  const resize=()=>{
   width=innerWidth;height=innerHeight;
   camera.aspect=width/height;camera.updateProjectionMatrix();worldHeight=2*Math.tan(65*Math.PI/360)*5;worldWidth=worldHeight*camera.aspect;
   const ratio=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);
   for(const p of planes){
    p.track.style.height=height*2+'px';p.panel.style.height=height+'px';p.panel.style.minHeight=height+'px';
    p.mesh.scale.set(worldWidth*1.1,worldHeight*1.1,1);
    p.mesh.material.uniforms.planeSize.value.set(worldWidth,worldHeight);p.mesh.material.uniforms.resolution.value.set(width*ratio,height*ratio);p.mesh.material.uniforms.pixelRadius.value=8*ratio;
   }
  };
  const update=()=>{
   if(disposed)return;
   let visible=false;const direction=scrollY>=lastScroll?1:-1;lastScroll=scrollY;
   for(const p of planes){
    const rect=p.track.getBoundingClientRect();const frame=projectFrame(Math.ceil(rect.top),Math.ceil(rect.height),height,worldHeight);
    p.mesh.visible=frame.visible;visible||=frame.visible;
    if(frame.visible!==p.visible){p.visible=frame.visible;if(frame.visible&&!document.hidden)void p.video.play().catch(()=>{});else p.video.pause()}
    if(!frame.visible)continue;
    p.mesh.position.y=frame.y;
    const uniforms=p.mesh.material.uniforms;
    ['topLeft','topRight','bottomLeft','bottomRight'].forEach((key,i)=>{uniforms[key].value.z=frame.corners[i]});
    uniforms.fieldOfView.value=mix(1,35,frame.filter);uniforms.shutterAngle.value=mix(1,70,frame.filter);
    uniforms.isVideo.value=Number(p.video.readyState>=2);
    if(p.video.videoWidth)uniforms.imageSize.value.set(p.video.videoWidth,p.video.videoHeight);
    if(frame.content!==p.contentVisible){
     p.contentVisible=frame.content;
     if(frame.content)gsap.fromTo(p.content,{opacity:0,y:direction*10},{opacity:1,y:0,duration:.25,ease:'power2.out',overwrite:true});
     else gsap.to(p.content,{opacity:0,y:-direction*10,duration:.25,ease:'power2.out',overwrite:true});
     gsap.to(p.scrim,{opacity:Number(frame.content),duration:.25,overwrite:true});
    }
    p.hit.style.pointerEvents=frame.content?'auto':'none';p.content.style.pointerEvents=frame.content?'auto':'none';
    p.track.dataset.projectProgress=frame.time.toFixed(5);p.track.dataset.projectPhase=frame.content?'hold':frame.entering?'enter':'exit';
    p.track.dataset.projectCorners=frame.corners.map(v=>v.toFixed(4)).join(',');
   }
   target.style.opacity=visible?'1':'0';
   renderer.render(scene,camera);
  };
  const mediaVisibility=()=>{for(const p of planes){if(p.visible&&!document.hidden)void p.video.play().catch(()=>{});else p.video.pause()}};
  const lost=(event:Event)=>{event.preventDefault();element.dataset.webgl='fallback';target.style.opacity='0';gsap.ticker.remove(update);for(const p of planes){p.video.removeEventListener('play',p.guard);p.video.autoplay=p.autoplay;p.hit.style.pointerEvents='';p.content.style.pointerEvents='';gsap.killTweensOf([p.content,p.scrim]);gsap.set([p.content,p.scrim],{clearProps:'all'})}window.dispatchEvent(new Event('site:project-renderer'))};
  resize();element.dataset.webgl='ready';window.dispatchEvent(new Event('site:project-renderer'));gsap.ticker.add(update);
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',mediaVisibility);window.addEventListener('site:transition-end',mediaVisibility);target.addEventListener('webglcontextlost',lost);
  return()=>{
   disposed=true;target.style.opacity='0';gsap.ticker.remove(update);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',mediaVisibility);window.removeEventListener('site:transition-end',mediaVisibility);target.removeEventListener('webglcontextlost',lost);
   delete element.dataset.webgl;window.dispatchEvent(new Event('site:project-renderer'));
   for(const p of planes){gsap.killTweensOf([p.content,p.scrim]);gsap.set([p.content,p.scrim],{clearProps:'all'});p.track.style.height='';p.panel.style.height='';p.panel.style.minHeight='';p.hit.style.pointerEvents='';p.content.style.pointerEvents='';p.video.removeEventListener('play',p.guard);p.video.autoplay=p.autoplay;p.texture.dispose();p.poster.dispose();p.mesh.material.dispose()}
   // React Strict Mode immediately reuses this canvas after effect cleanup.
   // Explicitly losing its context here would disable the second renderer.
   geometry.dispose();renderer.dispose();
  };
 },[reduced,root]);
 return reduced?null:<canvas ref={canvas} className={styles.projectCanvas} data-project-canvas aria-hidden="true"/>;
}
