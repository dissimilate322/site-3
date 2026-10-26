import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import Header from '@/components/Header';
import Reveal from '@/components/Reveal';
import Media from '@/components/Media';
import MoreWork from '@/components/MoreWork';
import CaseBlocks from '@/components/CaseBlocks';
import {content} from '@/data/content';
import styles from '@/components/SitePages.module.css';
export const dynamicParams=false;
export function generateStaticParams(){return content.cases.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=content.cases.find(p=>p.slug===slug);return {title:(p?.title||'Project')+' | meruem',description:p?.projectText}}
export default async function CaseStudy({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=content.cases.find(p=>p.slug===slug);if(!p)notFound();return <><Header/><main><Reveal>
 <section className={styles.caseHero}><Media asset={p.video||p.image} poster={p.image} autoplay={!!p.video} priority className={styles.featuredVisual}/><div className={styles.heroScrim}/><div className={styles.caseHeroContent}><p className={styles.subtitle} data-reveal>{p.subtitle}</p><h1 data-reveal>{p.title}</h1><div className={styles.caseDetails} data-reveal><div><span>Client</span><p>{p.projectText}</p></div><div><span>Services</span><p>{p.servicesText}</p></div><a href="#project" className={styles.caseButton}>Explore project ↓</a></div></div></section>
 <div className={`${styles.container} ${styles.mobileCaseDetails}`}><div><h2>Client</h2><p>{p.projectText}</p></div><div><h2>Services</h2><p>{p.servicesText}</p></div></div>
 <div id="project"><CaseBlocks blocks={p.blocks}/></div>
 {p.pdf&&<div className={`${styles.container} ${styles.pdf}`}><a href={p.pdf.src} download>Download case study PDF ↓</a></div>}
 <div className={styles.container}><Link href="/work" className={styles.backLink}>← Back to work</Link></div><MoreWork exclude={p.slug}/>
 </Reveal></main></>}
