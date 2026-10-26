import tracks from '@/data/portal-motion.json';

export const clamp=(value:number,min=0,max=1)=>Math.min(max,Math.max(min,value));
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const map=(value:number,a:number,b:number)=>clamp((value-a)/(b-a));

/** CSS/Theatre cubic Bézier: solve its x coordinate before evaluating y. */
export function cubicBezier(x:number,x1:number,y1:number,x2:number,y2:number){
 x=clamp(x);if(x===0||x===1)return x;
 const at=(t:number,a:number,b:number)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
 let lo=0,hi=1,t=x;
 for(let i=0;i<18;i++){const value=at(t,x1,x2);if(value<x)lo=t;else hi=t;t=(lo+hi)/2}
 return at(t,y1,y2);
}

/** The original scroll controller applies easeOut(deltaSeconds * 3) each frame. */
export function scrollDamping(deltaSeconds:number){return cubicBezier(clamp(deltaSeconds*3),0,0,.58,1)}

export type ProjectFrame={entering:boolean;time:number;pinned:number;y:number;corners:[number,number,number,number];filter:number;visible:boolean;content:boolean};
export function projectFrame(top:number,height:number,viewportHeight:number,worldHeight:number):ProjectFrame{
 const bottom=top+height;
 const percentIn=1-clamp(top/viewportHeight);
 const percentOut=1-clamp(bottom/viewportHeight);
 const entering=percentOut===0;
 const time=entering?percentIn:percentOut;
 const pinned=map(top,0,-height+viewportHeight);
 const e=entering?map(time,.5,1):map(time,0,.5);
 const start=entering?-1.5:0,end=entering?0:-1.5;
 const tr=entering?map(e,0,.5):map(e,.35,.75);
 const br=entering?map(e,.35,.75):map(e,0,.5);
 const tl=entering?map(e,.45,.85):map(e,.55,1);
 const bl=entering?map(e,.55,1):map(e,.45,.85);
 return {entering,time,pinned,y:(entering?mix(-1.5*worldHeight,0,time):mix(0,1.5*worldHeight,time))+mix(-.35,.35,pinned),corners:[mix(start,end,tl),mix(start,end,tr),mix(start,end,bl),mix(start,end,br)],filter:time<.85?map(time,0,.85):1-map(time,.85,1),visible:bottom>0&&top<viewportHeight,content:top<=0&&bottom>=viewportHeight};
}

type TrackKey=keyof typeof tracks;
export function portalValue(key:TrackKey,time:number):number{
 const keys=tracks[key];
 if(time<=keys[0].t)return Number(keys[0].v);
 for(let i=1;i<keys.length;i++){
  const a=keys[i-1],b=keys[i];
  if(time<=b.t){
   if(typeof a.v==='boolean')return Number(a.v);
   return mix(Number(a.v),Number(b.v),cubicBezier(map(time,a.t,b.t),a.h[2],a.h[3],b.h[0],b.h[1]));
  }
 }
 return Number(keys[keys.length-1].v);
}

export function portalPath(time:number,width:number,height:number,pixelRatio=1){
 if(!portalValue('visible',time))return 'M 0 0 Z';
 const worldHeight=2*Math.tan(65*Math.PI/360)*5;
 const worldWidth=worldHeight*width/height;
 const size=Math.max(worldWidth,worldHeight)*1.05;
 const factor=clamp(mix(1.25,1.7,map(width,390,1200)),1.25,1.7);
 const portalX=4*factor*(.575-.5);
 const scale=portalValue('scale/x',time);
 const rx=portalValue('rotation/x',time)*Math.PI/180,ry=portalValue('rotation/y',time)*Math.PI/180,rz=portalValue('rotation/z',time)*Math.PI/180;
 const radius=Math.min(size*.49,96/Math.min(width*pixelRatio,height*pixelRatio)*size);
 const centres=[[size/2-radius,size/2-radius],[-size/2+radius,size/2-radius],[-size/2+radius,-size/2+radius],[size/2-radius,-size/2+radius]];
 const points:number[][]=[];
 centres.forEach(([cx,cy],corner)=>{
  for(let i=0;i<=16;i++){
   const angle=(corner*90+i*90/16)*Math.PI/180;
   const x=(cx+Math.cos(angle)*radius)*scale,y=(cy+Math.sin(angle)*radius)*scale;
   const x1=x*Math.cos(rz)-y*Math.sin(rz),y1=x*Math.sin(rz)+y*Math.cos(rz);
   const x2=x1*Math.cos(ry),z2=-x1*Math.sin(ry);
   const y3=y1*Math.cos(rx)-z2*Math.sin(rx),z3=y1*Math.sin(rx)+z2*Math.cos(rx);
   const perspective=5/(5-z3),pixels=height/worldHeight;
   points.push([width/2+(x2+portalX)*pixels*perspective,height/2-y3*pixels*perspective]);
  }
 });
 return points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(3)+' '+y.toFixed(3)).join(' ')+' Z';
}
