'use client';

import {createContext,useContext,useLayoutEffect,useState,type ReactNode} from 'react';

type MotionSettingsValue={reduced:boolean;toggleMotion:()=>void};
const MotionContext=createContext<MotionSettingsValue>({reduced:false,toggleMotion:()=>{}});
const storageKey='otherlife-motion';

/** This reference recreation starts with motion enabled as requested by its owner.
 * Visitors can explicitly select and persist reduced motion from the menu. */
export default function MotionSettings({children}:{children:ReactNode}){
 const [reduced,setReduced]=useState(false);
 useLayoutEffect(()=>{
  let saved=false;
  try{saved=localStorage.getItem(storageKey)==='reduced'}catch{}
  document.documentElement.dataset.motion=saved?'reduced':'full';
  setReduced(saved);
  const sync=(event:StorageEvent)=>{
   if(event.key===storageKey){const value=event.newValue==='reduced';document.documentElement.dataset.motion=value?'reduced':'full';setReduced(value)}
  };
  window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
 },[]);
 useLayoutEffect(()=>{
  document.documentElement.dataset.motion=reduced?'reduced':'full';
  document.documentElement.dataset.motionReady='true';
  return()=>{delete document.documentElement.dataset.motionReady};
 },[reduced]);
 const toggleMotion=()=>{
  const next=!reduced;
  document.documentElement.dataset.motion=next?'reduced':'full';
  try{localStorage.setItem(storageKey,next?'reduced':'full')}catch{}
  setReduced(next);
 };
 return <MotionContext.Provider value={{reduced,toggleMotion}}>{children}</MotionContext.Provider>;
}

export function useSiteMotion(){return useContext(MotionContext)}
