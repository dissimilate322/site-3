import { Fragment } from 'react';
import type { RichNode } from '@/data/content';
export default function RichText({ nodes }: { nodes: RichNode[] }) {
 return <>{nodes.map((n,i) => {
  let children = n.children ? <RichText nodes={n.children}/> : n.text;
  if(n.bold) children=<strong>{children}</strong>;
  if(n.italic) children=<em>{children}</em>;
  switch(n.type){
   case 'paragraph': return <p key={i}>{children}</p>;
   case 'heading': return n.level===2 ? <h2 key={i}>{children}</h2> : <h3 key={i}>{children}</h3>;
   case 'list': return n.format==='ordered' ? <ol key={i}>{children}</ol> : <ul key={i}>{children}</ul>;
   case 'list-item': return <li key={i}>{children}</li>;
   case 'link': return n.url?.startsWith('/') && !n.url.startsWith('//') ? <a key={i} href={n.url}>{children}</a> : <span key={i}>{children}</span>;
   default:return <Fragment key={i}>{children}</Fragment>;
  }
 })}</>;
}
